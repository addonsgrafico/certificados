import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { BulkImportService } from './bulk-import.service';
import { AuthenticatedGuard } from '../../common/guards/authenticated.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role } from '@certificados/shared';
import { AdminUser } from '@prisma/client';

@ApiTags('Bulk Import')
@Controller('admin/certificates/import')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class BulkImportController {
  constructor(private readonly bulkImportService: BulkImportService) {}

  @Post('preview')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Analizar archivo CSV/XLSX y previsualizar registros antes de importar' })
  async previewImport(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Debe subir un archivo CSV o XLSX.');
    const rows = this.bulkImportService.parseFile(
      file.buffer,
      file.mimetype,
      file.originalname,
    );
    return this.bulkImportService.previewImport(rows);
  }

  @Post('execute')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Ejecutar la importación masiva de los registros validados' })
  async executeImport(
    @Body() body: { validRecords: any[]; templateFileId?: string },
    @CurrentUser() user: AdminUser,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.bulkImportService.executeImport(
      body.validRecords,
      body.templateFileId || '',
      user.id,
      ipAddress,
      userAgent,
    );
  }
}
