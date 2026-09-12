import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async listPublicCourses() {
    return this.prisma.courseEvent.findMany({
      where: { isActive: true, archivedAt: null },
      orderBy: { date: 'desc' },
    });
  }

  async getCourseById(id: string) {
    const course = await this.prisma.courseEvent.findFirst({
      where: { id, isActive: true, archivedAt: null },
    });
    if (!course) throw new NotFoundException('El curso solicitado no fue encontrado.');
    return course;
  }

  async listAdminCourses() {
    const courses = await this.prisma.courseEvent.findMany({
      where: { archivedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { certificates: true } },
      },
    });

    return courses.map((c) => ({
      ...c,
      certificateCount: c._count.certificates,
    }));
  }

  async createCourse(data: {
    name: string;
    subtitle?: string;
    description?: string;
    duration?: string;
    syllabus?: any;
    objectives?: any;
    institution: string;
    instructor: string;
    date: Date;
    imageUrl?: string;
  }) {
    return this.prisma.courseEvent.create({
      data: {
        name: data.name.trim(),
        subtitle: data.subtitle?.trim(),
        description: data.description?.trim(),
        duration: data.duration?.trim(),
        syllabus: data.syllabus,
        objectives: data.objectives,
        institution: data.institution.trim(),
        instructor: data.instructor.trim(),
        date: new Date(data.date),
        imageUrl: data.imageUrl,
      },
    });
  }

  async updateCourse(
    id: string,
    data: {
      name?: string;
      subtitle?: string;
      description?: string;
      duration?: string;
      syllabus?: any;
      objectives?: any;
      institution?: string;
      instructor?: string;
      date?: Date;
      imageUrl?: string;
      isActive?: boolean;
    },
  ) {
    const course = await this.prisma.courseEvent.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Curso no encontrado.');

    return this.prisma.courseEvent.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.subtitle !== undefined ? { subtitle: data.subtitle?.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() } : {}),
        ...(data.duration !== undefined ? { duration: data.duration?.trim() } : {}),
        ...(data.syllabus !== undefined ? { syllabus: data.syllabus } : {}),
        ...(data.objectives !== undefined ? { objectives: data.objectives } : {}),
        ...(data.institution ? { institution: data.institution.trim() } : {}),
        ...(data.instructor ? { instructor: data.instructor.trim() } : {}),
        ...(data.date ? { date: new Date(data.date) } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  async updateTemplateConfig(id: string, config: any) {
    const course = await this.prisma.courseEvent.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Curso no encontrado.');

    return this.prisma.courseEvent.update({
      where: { id },
      data: { templateConfig: config },
    });
  }

  async uploadCourseTemplate(id: string, file: Express.Multer.File) {
    const course = await this.prisma.courseEvent.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Curso no encontrado.');

    const savedFile = await this.storageService.saveCertificatePdf(file);

    return this.prisma.courseEvent.update({
      where: { id },
      data: {
        templateStoragePath: savedFile.storagePath,
        templateOriginalName: file.originalname,
      },
    });
  }

  async removeCourseTemplate(id: string) {
    const course = await this.prisma.courseEvent.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Curso no encontrado.');

    return this.prisma.courseEvent.update({
      where: { id },
      data: {
        templateStoragePath: null,
        templateOriginalName: null,
      },
    });
  }

  async deleteCourse(id: string) {
    const course = await this.prisma.courseEvent.findUnique({
      where: { id },
      include: { _count: { select: { certificates: true } } },
    });

    if (!course) throw new NotFoundException('Curso no encontrado.');

    if (course._count.certificates > 0) {
      throw new BadRequestException(
        `No se puede eliminar el curso "${course.name}" porque tiene ${course._count.certificates} certificado(s) emitido(s). Desactívelo o archívelo en su lugar.`,
      );
    }

    return this.prisma.courseEvent.delete({ where: { id } });
  }
}
