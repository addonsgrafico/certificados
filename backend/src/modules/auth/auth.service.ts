import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import * as argon2 from 'argon2';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as crypto from 'crypto';
import { Response } from 'express';
import { Role, SecurityEventType } from '@certificados/shared';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly securityService: SecurityService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Procesa el inicio de sesión con soporte para TOTP MFA.
   */
  async login(
    email: string,
    pass: string,
    totpCode?: string,
    ipAddress = 'unknown',
    userAgent = 'unknown',
    res?: Response,
  ) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin || !admin.isActive || admin.archivedAt !== null) {
      await this.securityService.logSecurityEvent({
        eventType: SecurityEventType.FAILED_LOGIN,
        description: `Intento de login fallido para usuario inexistente o inactivo: ${email}`,
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    const isValidPassword = await argon2.verify(admin.passwordHash, pass);
    if (!isValidPassword) {
      await this.securityService.logAudit({
        adminId: admin.id,
        action: 'ADMIN_LOGIN',
        resource: 'AdminUser',
        resourceId: admin.id,
        ipAddress,
        userAgent,
        result: 'FAILURE',
        metadata: { reason: 'Invalid password' },
      });
      await this.securityService.logSecurityEvent({
        eventType: SecurityEventType.FAILED_LOGIN,
        description: `Contraseña incorrecta para ${email}`,
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    // MFA Requerido solo si el usuario lo activó en su cuenta o si REQUIRE_MFA es 'true'
    const forceMfa = this.configService.get('REQUIRE_MFA') === 'true';
    const requiresMfa = admin.mfaEnabled || forceMfa;

    // helper para crear sesión de servidor y cookie
    const createSession = async () => {
      const rawSessionToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto
        .createHash('sha256')
        .update(rawSessionToken)
        .digest('hex');

      const sessionDurationHours = 8;
      const expiresAt = new Date(Date.now() + sessionDurationHours * 3600 * 1000);

      await this.prisma.adminSession.create({
        data: {
          adminId: admin.id,
          tokenHash,
          ipAddress,
          userAgent,
          expiresAt,
        },
      });

      await this.prisma.adminUser.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() },
      });

      if (res) {
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        res.cookie('admin_session', rawSessionToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'strict',
          expires: expiresAt,
          path: '/',
        });
      }
      return rawSessionToken;
    };

    if (requiresMfa && !admin.mfaEnabled) {
      // Si se fuerza MFA por entorno pero no está configurado aún
      await createSession();
      const mfaQrData = await this.generateMfaSetup(admin.id);
      return {
        mfaRequired: true,
        mfaSetupRequired: true,
        mfaQrData,
        message: 'MFA es obligatorio. Configure TOTP.',
      };
    }

    if (requiresMfa && admin.mfaEnabled) {
      if (!totpCode) {
        return {
          mfaRequired: true,
          mfaSetupRequired: false,
          message: 'Se requiere el código TOTP de 6 dígitos.',
        };
      }

      // Probar si es un código TOTP estándar
      const isTotpValid = speakeasy.totp.verify({
        secret: admin.mfaSecret!,
        encoding: 'base32',
        token: totpCode,
        window: 1,
      });

      let isRecoveryValid = false;
      if (!isTotpValid) {
        // Intentar código de recuperación
        const recoveryCodes = await this.prisma.recoveryCode.findMany({
          where: { adminId: admin.id, usedAt: null },
        });

        for (const code of recoveryCodes) {
          const match = await argon2.verify(code.codeHash, totpCode);
          if (match) {
            isRecoveryValid = true;
            await this.prisma.recoveryCode.update({
              where: { id: code.id },
              data: { usedAt: new Date() },
            });
            break;
          }
        }
      }

      if (!isTotpValid && !isRecoveryValid) {
        await this.securityService.logSecurityEvent({
          eventType: SecurityEventType.MFA_FAILURE,
          description: `Código MFA inválido para ${email}`,
          ipAddress,
          userAgent,
        });
        throw new UnauthorizedException('Código de autenticación (TOTP/Recuperación) inválido.');
      }
    }

    // Crear sesión de servidor
    await createSession();

    await this.securityService.logAudit({
      adminId: admin.id,
      action: 'ADMIN_LOGIN',
      resource: 'AdminUser',
      resourceId: admin.id,
      ipAddress,
      userAgent,
      result: 'SUCCESS',
    });

    return {
      mfaRequired: false,
      user: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        mfaEnabled: admin.mfaEnabled,
      },
    };
  }

  /**
   * Genera el secreto TOTP y el código QR para configuración MFA.
   */
  async generateMfaSetup(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin) throw new BadRequestException('Usuario no encontrado');

    const secret = speakeasy.generateSecret({
      name: `Certificados Digitales (${admin.email})`,
      issuer: 'OrganizacionEmisora',
    });

    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCodeDataUrl,
    };
  }

  /**
   * Confirma y activa MFA con TOTP + genera códigos de recuperación.
   */
  async enableMfa(adminId: string, secret: string, totpCode: string, ipAddress: string, userAgent: string) {
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: totpCode,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException('El código TOTP ingresado es incorrecto.');
    }

    // Generar 8 recovery codes
    const recoveryPlainCodes: string[] = [];
    const recoveryCodeRecords = [];

    for (let i = 0; i < 8; i++) {
      const plainCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g. 8A3F19B2
      recoveryPlainCodes.push(plainCode);
      const codeHash = await argon2.hash(plainCode);
      recoveryCodeRecords.push({
        adminId,
        codeHash,
      });
    }

    // Guardar secreto TOTP y recovery codes
    await this.prisma.$transaction([
      this.prisma.adminUser.update({
        where: { id: adminId },
        data: {
          mfaEnabled: true,
          mfaSecret: secret,
        },
      }),
      this.prisma.recoveryCode.deleteMany({ where: { adminId } }),
      this.prisma.recoveryCode.createMany({ data: recoveryCodeRecords }),
    ]);

    await this.securityService.logAudit({
      adminId,
      action: 'MFA_ENABLED',
      resource: 'AdminUser',
      resourceId: adminId,
      ipAddress,
      userAgent,
      result: 'SUCCESS',
    });

    return {
      success: true,
      message: 'MFA activado con éxito. Guarde sus códigos de recuperación en un lugar seguro.',
      recoveryCodes: recoveryPlainCodes,
    };
  }

  /**
   * Cierra la sesión activa y destruye la cookie.
   */
  async logout(sessionToken: string, adminId: string, ipAddress: string, userAgent: string, res: Response) {
    if (sessionToken) {
      const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
      await this.prisma.adminSession.deleteMany({ where: { tokenHash } }).catch(() => {});
    }

    await this.securityService.logAudit({
      adminId,
      action: 'ADMIN_LOGOUT',
      resource: 'AdminUser',
      resourceId: adminId,
      ipAddress,
      userAgent,
      result: 'SUCCESS',
    });

    res.clearCookie('admin_session', { path: '/' });
    return { success: true, message: 'Sesión cerrada correctamente.' };
  }
}
