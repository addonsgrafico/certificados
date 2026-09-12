import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const bearerToken = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null;
    const sessionToken = request.cookies?.admin_session || bearerToken;

    if (!sessionToken) {
      throw new UnauthorizedException('Sesión no encontrada. Inicie sesión nuevamente.');
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(sessionToken)
      .digest('hex');

    const session = await this.prisma.adminSession.findUnique({
      where: { tokenHash },
      include: { admin: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await this.prisma.adminSession.delete({ where: { id: session.id } }).catch(() => {});
      }
      throw new UnauthorizedException('La sesión ha expirado o es inválida.');
    }

    if (!session.admin.isActive || session.admin.archivedAt !== null) {
      throw new UnauthorizedException('Cuenta desactivada o archivada.');
    }

    // Actualizar lastSeenAt asíncronamente
    this.prisma.adminSession.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    }).catch(() => {});

    request.user = session.admin;
    request.session = session;
    return true;
  }
}
