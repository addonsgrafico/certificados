import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import * as argon2 from 'argon2';
import { Role } from '@certificados/shared';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly securityService: SecurityService,
  ) {}

  async listAdmins() {
    return this.prisma.adminUser.findMany({
      where: { archivedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        mfaEnabled: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }

  async createAdmin(
    data: { email: string; fullName: string; pass: string; role: Role },
    currentAdminId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new BadRequestException('Ya existe un usuario con este correo electrónico.');
    }

    const passwordHash = await argon2.hash(data.pass);

    const newAdmin = await this.prisma.adminUser.create({
      data: {
        email: data.email.toLowerCase().trim(),
        fullName: data.fullName.trim(),
        passwordHash,
        role: data.role,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        mfaEnabled: true,
        createdAt: true,
      },
    });

    await this.securityService.logAudit({
      adminId: currentAdminId,
      action: 'ADMIN_USER_CREATED',
      resource: 'AdminUser',
      resourceId: newAdmin.id,
      ipAddress,
      userAgent,
      result: 'SUCCESS',
      metadata: { email: newAdmin.email, role: newAdmin.role },
    });

    return newAdmin;
  }

  async updateAdminStatus(
    targetUserId: string,
    isActive: boolean,
    currentAdminId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const targetUser = await this.prisma.adminUser.findUnique({ where: { id: targetUserId } });
    if (!targetUser) throw new NotFoundException('Usuario no encontrado.');

    if (targetUser.role === Role.SUPER_ADMIN && targetUser.id !== currentAdminId) {
      throw new ForbiddenException('No se puede desactivar a un SUPER_ADMIN.');
    }

    const updated = await this.prisma.adminUser.update({
      where: { id: targetUserId },
      data: { isActive },
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });

    await this.securityService.logAudit({
      adminId: currentAdminId,
      action: 'ADMIN_USER_STATUS_UPDATED',
      resource: 'AdminUser',
      resourceId: targetUserId,
      ipAddress,
      userAgent,
      result: 'SUCCESS',
      metadata: { isActive },
    });

    return updated;
  }
}
