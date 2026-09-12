import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CoursesService } from './courses.service';
import { AuthenticatedGuard } from '../../common/guards/authenticated.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { Role } from '@certificados/shared';

@ApiTags('Courses')
@Controller()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('courses')
  @ApiOperation({ summary: 'Obtener catálogo público de cursos/programas' })
  async getPublicCourses() {
    return this.coursesService.listPublicCourses();
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Obtener detalle de un curso específico' })
  async getCourseById(@Param('id') id: string) {
    return this.coursesService.getCourseById(id);
  }

  @Get('admin/courses')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Listar cursos con estadísticas (Admin)' })
  async getAdminCourses() {
    return this.coursesService.listAdminCourses();
  }

  @Post('admin/courses')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Crear nuevo curso/evento (Admin)' })
  async createCourse(
    @Body()
    body: {
      name: string;
      subtitle?: string;
      description?: string;
      duration?: string;
      syllabus?: any;
      objectives?: any;
      institution: string;
      instructor: string;
      date: string;
      imageUrl?: string;
    },
  ) {
    return this.coursesService.createCourse({
      ...body,
      date: new Date(body.date),
    });
  }

  @Put('admin/courses/:id')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar curso (Admin)' })
  async updateCourse(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      subtitle?: string;
      description?: string;
      duration?: string;
      syllabus?: any;
      objectives?: any;
      institution?: string;
      instructor?: string;
      date?: string;
      imageUrl?: string;
      isActive?: boolean;
    },
  ) {
    return this.coursesService.updateCourse(id, {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
    });
  }

  @Post('admin/courses/:id/template')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @UseInterceptors(FileInterceptor('template'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir plantilla PDF personalizada para un curso (Admin)' })
  async uploadTemplate(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Debe adjuntar un archivo PDF de plantilla.');
    return this.coursesService.uploadCourseTemplate(id, file);
  }

  @Put('admin/courses/:id/template-config')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Guardar configuración visual del editor de plantilla (Admin)' })
  async updateTemplateConfig(
    @Param('id') id: string,
    @Body() config: any,
  ) {
    return this.coursesService.updateTemplateConfig(id, config);
  }

  @Delete('admin/courses/:id/template')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar plantilla PDF personalizada de un curso (Admin)' })
  async removeTemplate(@Param('id') id: string) {
    return this.coursesService.removeCourseTemplate(id);
  }

  @Delete('admin/courses/:id')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar curso si no tiene certificados (Admin)' })
  async deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }
}
