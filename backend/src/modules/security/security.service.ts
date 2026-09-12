import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SecurityEventType } from '@certificados/shared';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logAudit(params: {
    adminId?: string | null;
    action: string;
    resource: string;
    resourceId?: string | null;
    ipAddress: string;
    userAgent: string;
    result: 'SUCCESS' | 'FAILURE';
    metadata?: any;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: params.adminId || null,
          action: params.action,
          resource: params.resource,
          resourceId: params.resourceId || null,
          ipAddress: params.ipAddress || 'unknown',
          userAgent: params.userAgent?.substring(0, 255) || 'unknown',
          result: params.result,
          metadata: params.metadata || undefined,
        },
      });
    } catch (err) {
      this.logger.error('Error registrando audit log:', err);
    }
  }

  async logSecurityEvent(params: {
    eventType: SecurityEventType;
    description: string;
    ipAddress: string;
    userAgent: string;
    metadata?: any;
  }) {
    try {
      this.logger.warn(`SecurityEvent [${params.eventType}]: ${params.description}`);
      await this.prisma.securityEvent.create({
        data: {
          eventType: params.eventType,
          description: params.description,
          ipAddress: params.ipAddress || 'unknown',
          userAgent: params.userAgent?.substring(0, 255) || 'unknown',
          metadata: params.metadata || undefined,
        },
      });
    } catch (err) {
      this.logger.error('Error registrando security event:', err);
    }
  }

  async getAuditLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { id: true, email: true, fullName: true, role: true },
          },
        },
      }),
      this.prisma.auditLog.count(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getSecurityEvents(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.securityEvent.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.securityEvent.count(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
