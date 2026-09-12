import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CertificateStatus } from '@certificados/shared';

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verificar la autenticidad de un certificado mediante token público del QR.
   */
  async verifyByToken(token: string, ipAddress = 'unknown', userAgent = 'unknown') {
    const cert = await this.prisma.certificate.findUnique({
      where: { verificationToken: token },
      include: {
        participant: true,
        courseEvent: true,
      },
    });

    if (!cert) {
      return {
        isValid: false,
        status: 'NOT_FOUND',
        message: 'No se encontró ningún certificado válido asociado a este código QR.',
      };
    }

    // Registrar escaneo QR en bitácora
    this.prisma.qrScanLog
      .create({
        data: {
          certificateId: cert.id,
          ipAddress,
          userAgent: userAgent.substring(0, 255),
        },
      })
      .catch(() => {});

    // Determinar estado actual
    let status = cert.status;
    if (status === CertificateStatus.ACTIVE && cert.expiresAt && cert.expiresAt < new Date()) {
      status = CertificateStatus.EXPIRED;
    }

    const isValid = status === CertificateStatus.ACTIVE;

    return {
      isValid,
      status,
      publicId: cert.publicId,
      participantName: cert.participant.fullName,
      courseName: cert.courseEvent.name,
      institution: cert.courseEvent.institution,
      instructor: cert.courseEvent.instructor,
      issuedAt: cert.issuedAt.toISOString(),
      expiresAt: cert.expiresAt ? cert.expiresAt.toISOString() : null,
      revokedAt: cert.revokedAt ? cert.revokedAt.toISOString() : null,
      revocationReason: cert.revocationReason || null,
      // NOTA DE SEGURIDAD: NO SE RETORNA CÓDIGO SECRETO NI BOTÓN DE DESCARGA PDF
    };
  }
}
