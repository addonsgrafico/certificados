import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ParticipantsService {
  constructor(private readonly prisma: PrismaService) {}

  async listParticipants(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { internalDocument: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.participant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { certificates: true } },
          certificates: {
            include: {
              courseEvent: {
                select: {
                  id: true,
                  name: true,
                  duration: true,
                  date: true,
                  instructor: true,
                  institution: true,
                  imageUrl: true,
                },
              },
            },
            orderBy: { issuedAt: 'desc' },
          },
        },
      }),
      this.prisma.participant.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getParticipantDossier(id: string) {
    const participant = await this.prisma.participant.findUnique({
      where: { id },
      include: {
        certificates: {
          include: {
            courseEvent: true,
            certificateFile: true,
          },
          orderBy: { issuedAt: 'desc' },
        },
      },
    });
    if (!participant) throw new NotFoundException('Estudiante no encontrado.');

    // Listar todos los cursos para la carpeta/expediente
    const allCourses = await this.prisma.courseEvent.findMany({
      where: { archivedAt: null },
      orderBy: { date: 'desc' },
    });

    const coursesHistory = allCourses.map((course) => {
      const cert = participant.certificates.find((c) => c.courseEventId === course.id);
      return {
        course,
        isCertified: !!cert,
        status: cert ? cert.status : 'NOT_ENROLLED',
        certificate: cert || null,
      };
    });

    return {
      participant,
      coursesHistory,
      totalCertificates: participant.certificates.length,
    };
  }

  async createParticipant(data: { fullName: string; email?: string; internalDocument?: string }) {
    return this.prisma.participant.create({
      data: {
        fullName: data.fullName.trim(),
        email: data.email ? data.email.trim().toLowerCase() : null,
        internalDocument: data.internalDocument ? data.internalDocument.trim() : null,
      },
    });
  }

  async updateParticipant(
    id: string,
    data: { fullName?: string; email?: string; internalDocument?: string },
  ) {
    const participant = await this.prisma.participant.findUnique({ where: { id } });
    if (!participant) throw new NotFoundException('Participante no encontrado.');

    return this.prisma.participant.update({
      where: { id },
      data: {
        ...(data.fullName ? { fullName: data.fullName.trim() } : {}),
        ...(data.email !== undefined ? { email: data.email ? data.email.trim().toLowerCase() : null } : {}),
        ...(data.internalDocument !== undefined ? { internalDocument: data.internalDocument ? data.internalDocument.trim() : null } : {}),
      },
    });
  }
}
