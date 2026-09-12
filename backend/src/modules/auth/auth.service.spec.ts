import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockPrismaService = {
  adminUser: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  adminSession: {
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  recoveryCode: {
    findMany: jest.fn().mockResolvedValue([]),
  },
  auditLog: { create: jest.fn() },
  securityEvent: { create: jest.fn() },
};

const mockSecurityService = {
  logAudit: jest.fn().mockResolvedValue(undefined),
  logSecurityEvent: jest.fn().mockResolvedValue(undefined),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const cfg: Record<string, string> = {
      SESSION_SECRET: 'test-session-secret-64-chars-hex-000000000000000000000000000000',
      APP_URL: 'http://localhost:3000',
      NODE_ENV: 'test',
    };
    return cfg[key];
  }),
};

// Mock express Response
const mockRes = {
  cookie: jest.fn(),
  clearCookie: jest.fn(),
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: SecurityService, useValue: mockSecurityService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    // Reset default mock behaviors
    mockPrismaService.recoveryCode.findMany.mockResolvedValue([]);
    mockPrismaService.adminSession.create.mockResolvedValue({});
    mockPrismaService.adminUser.update.mockResolvedValue({});
  });

  // ── Login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should throw UnauthorizedException when user does not exist', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue(null);
      await expect(
        service.login('notfound@test.com', 'password123!'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue({
        id: '1', email: 'a@b.com', passwordHash: 'hash',
        isActive: false, role: 'ADMIN', mfaEnabled: false, archivedAt: null,
      });
      await expect(
        service.login('a@b.com', 'password123!'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const realHash = await argon2.hash('correct-password', { type: argon2.argon2id });
      mockPrismaService.adminUser.findUnique.mockResolvedValue({
        id: '1', email: 'a@b.com', passwordHash: realHash,
        isActive: true, role: 'ADMIN', mfaEnabled: false, archivedAt: null,
      });
      await expect(
        service.login('a@b.com', 'wrong-password', undefined, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockSecurityService.logAudit).toHaveBeenCalledWith(
        expect.objectContaining({ result: 'FAILURE' }),
      );
    });

    it('should return mfaRequired=true when SUPER_ADMIN has MFA but no totp provided', async () => {
      const realHash = await argon2.hash('correct-password', { type: argon2.argon2id });
      mockPrismaService.adminUser.findUnique.mockResolvedValue({
        id: '1', email: 'super@b.com', passwordHash: realHash,
        isActive: true, role: 'SUPER_ADMIN', mfaEnabled: true, mfaSecret: 'BASE32SECRET', archivedAt: null,
      });
      const result = await service.login('super@b.com', 'correct-password', undefined, '127.0.0.1', 'agent');
      expect(result).toMatchObject({ mfaRequired: true, mfaSetupRequired: false });
    });

    it('should return mfaRequired:false and user when ADMIN logs in successfully', async () => {
      const realHash = await argon2.hash('correct-password', { type: argon2.argon2id });
      mockPrismaService.adminUser.findUnique.mockResolvedValue({
        id: '2', email: 'admin@b.com', passwordHash: realHash,
        isActive: true, role: 'ADMIN', mfaEnabled: false, archivedAt: null,
      });
      const result = await service.login('admin@b.com', 'correct-password', undefined, '127.0.0.1', 'agent', mockRes as any);
      expect(result).toMatchObject({ mfaRequired: false, user: expect.objectContaining({ role: 'ADMIN' }) });
      expect(mockPrismaService.adminSession.create).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledWith('admin_session', expect.any(String), expect.objectContaining({ httpOnly: true }));
    });
  });

  // ── Logout ────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should delete session and clear cookie', async () => {
      mockPrismaService.adminSession.deleteMany.mockResolvedValue({ count: 1 });
      const result = await service.logout('raw-token', 'admin-id-1', '127.0.0.1', 'agent', mockRes as any);
      expect(result).toMatchObject({ success: true });
      expect(mockPrismaService.adminSession.deleteMany).toHaveBeenCalled();
      expect(mockRes.clearCookie).toHaveBeenCalledWith('admin_session', { path: '/' });
      expect(mockSecurityService.logAudit).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ADMIN_LOGOUT', result: 'SUCCESS' }),
      );
    });
  });
});
