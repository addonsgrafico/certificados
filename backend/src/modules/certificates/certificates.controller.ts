import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { CertificatesService } from './certificates.service';
import { AuthenticatedGuard } from '../../common/guards/authenticated.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role, CertificateStatus } from '@certificados/shared';
import { AdminUser } from '@prisma/client';

@ApiTags('Certificates')
@Controller()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  // ==================== ENDPOINTS PÚBLICOS ====================

  @Post('certificates/search')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 peticiones por minuto por IP
  @ApiOperation({ summary: 'Buscar certificado por código secreto (Público, Rate Limited)' })
  async searchByCode(@Body() body: { code: string }, @Req() req: Request) {
    if (!body.code) throw new BadRequestException('Debe ingresar un código.');
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.certificatesService.searchBySecretCode(body.code, ipAddress, userAgent);
  }

  @Post('certificates/lookup')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Consultar y descargar certificado por curso y correo/documento del estudiante' })
  async lookupByCourseAndStudent(
    @Body() body: { courseEventId: string; studentEmailOrDocument: string },
    @Req() req: Request,
  ) {
    if (!body.courseEventId || !body.studentEmailOrDocument) {
      throw new BadRequestException('Debe proporcionar la clase/curso y su correo o número de documento.');
    }
    const ipAddress = req.ip || 'unknown';
    return this.certificatesService.lookupCertificateByCourseAndStudent(
      body.courseEventId,
      body.studentEmailOrDocument,
      ipAddress,
    );
  }

  @Get('certificates/download')
  @ApiOperation({ summary: 'Descargar PDF usando ticket de descarga temporal' })
  async downloadPdf(
    @Query('ticket') ticket: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!ticket) throw new BadRequestException('Ticket de descarga es requerido.');
    const ipAddress = req.ip || 'unknown';
    const fileResult = await this.certificatesService.getPdfByDownloadTicket(ticket, ipAddress);

    res.setHeader('Content-Type', fileResult.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileResult.filename)}"`,
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(fileResult.buffer);
  }

  // ==================== ENDPOINTS ADMINISTRATIVOS ====================

  @Post('admin/certificates/issue')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Emitir nuevo certificado digital (Admin)' })
  async issueCertificate(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body()
    body: {
      participantName: string;
      participantEmail?: string;
      participantDocument?: string;
      courseEventId: string;
      issuedAt?: string;
      expiresAt?: string;
    },
    @CurrentUser() user: AdminUser,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    return this.certificatesService.issueCertificate(
      {
        participantName: body.participantName,
        participantEmail: body.participantEmail,
        participantDocument: body.participantDocument,
        courseEventId: body.courseEventId,
        issuedAt: body.issuedAt ? new Date(body.issuedAt) : undefined,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
      file,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  @Get('admin/certificates')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Listar certificados con búsqueda y paginación (Admin)' })
  async listCertificates(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('courseEventId') courseEventId?: string,
    @Query('status') status?: CertificateStatus,
  ) {
    return this.certificatesService.listCertificates(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      search,
      courseEventId,
      status,
    );
  }

  @Post('admin/certificates/:id/rotate-code')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Rotar y regenerar código secreto (Admin)' })
  async rotateCode(
    @Param('id') id: string,
    @CurrentUser() user: AdminUser,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.certificatesService.rotateSecretCode(id, user.id, ipAddress, userAgent);
  }

  @Post('admin/certificates/:id/revoke')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Revocar certificado con motivo (Admin)' })
  async revoke(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: AdminUser,
    @Req() req: Request,
  ) {
    if (!body.reason || body.reason.trim().length < 5) {
      throw new BadRequestException('Debe ingresar un motivo de revocación válido.');
    }
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.certificatesService.revokeCertificate(
      id,
      body.reason,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  @Post('admin/certificates/:id/reactivate')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Reactivar certificado (Admin)' })
  async reactivate(
    @Param('id') id: string,
    @CurrentUser() user: AdminUser,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.certificatesService.reactivateCertificate(id, user.id, ipAddress, userAgent);
  }

  @Get('admin/certificates/:id/qr')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Obtener QR en SVG/DataURL para administración' })
  async getQr(@Param('id') id: string) {
    return this.certificatesService.getCertificateQr(id);
  }

  @Post('admin/certificates/:id/send-email')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Enviar o re-enviar correo de certificado al participante' })
  async sendEmail(
    @Param('id') id: string,
    @Body() body: { email?: string },
  ) {
    return this.certificatesService.sendCertificateEmailById(id, body?.email);
  }
}
