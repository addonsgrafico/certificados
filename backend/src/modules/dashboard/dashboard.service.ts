import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CertificateStatus } from '@certificados/shared';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(period?: 'month' | 'year' | 'all') {
    const now = new Date();
    let startDate: Date | undefined;

    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const whereIssuedAt = startDate ? { gte: startDate } : undefined;

    const [
      totalCertificates,
      activeCertificates,
      revokedCertificates,
      expiredCertificates,
      issuedThisMonth,
      totalCourses,
      totalDownloads,
      totalQrScans,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.certificate.count({
        where: { archivedAt: null, ...(whereIssuedAt ? { issuedAt: whereIssuedAt } : {}) },
      }),
      this.prisma.certificate.count({
        where: { status: CertificateStatus.ACTIVE, archivedAt: null, ...(whereIssuedAt ? { issuedAt: whereIssuedAt } : {}) },
      }),
      this.prisma.certificate.count({
        where: { status: CertificateStatus.REVOKED, archivedAt: null, ...(whereIssuedAt ? { issuedAt: whereIssuedAt } : {}) },
      }),
      this.prisma.certificate.count({
        where: { status: CertificateStatus.EXPIRED, archivedAt: null, ...(whereIssuedAt ? { issuedAt: whereIssuedAt } : {}) },
      }),
      this.prisma.certificate.count({
        where: {
          archivedAt: null,
          issuedAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        },
      }),
      this.prisma.courseEvent.count({ where: { archivedAt: null } }),
      this.prisma.downloadTicket.count({ where: { usedAt: { not: null } } }),
      this.prisma.qrScanLog.count(),
      this.prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { fullName: true, email: true } },
        },
      }),
    ]);

    return {
      metrics: {
        totalCertificates,
        activeCertificates,
        revokedCertificates,
        expiredCertificates,
        issuedThisMonth,
        totalCourses,
        totalDownloads,
        totalQrScans,
      },
      recentActivity: recentAuditLogs,
    };
  }
}
