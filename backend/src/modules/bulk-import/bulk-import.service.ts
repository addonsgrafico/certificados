import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { ConfigService } from '@nestjs/config';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import * as crypto from 'crypto';
import {
  generateCertificateCode,
  normalizeCertificateCode,
  calculateCodeDigest,
  getCodeLastFour,
  CertificateStatus,
} from '@certificados/shared';

export interface BulkImportRow {
  participantName: string;
  participantEmail?: string;
  participantDocument?: string;
  courseEventId: string;
  issuedAt?: string;
  expiresAt?: string;
}

@Injectable()
export class BulkImportService {
  private readonly pepper: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly securityService: SecurityService,
    private readonly configService: ConfigService,
  ) {
    this.pepper =
      this.configService.get<string>('CERTIFICATE_CODE_PEPPER') ||
      'default_secure_pepper_change_in_production_32bytes!';
  }

  /**
   * Parsea un archivo CSV o XLSX desde su buffer.
   */
  parseFile(buffer: Buffer, mimetype: string, originalname: string): BulkImportRow[] {
    const isXlsx =
      mimetype.includes('spreadsheetml') ||
      mimetype.includes('excel') ||
      originalname.endsWith('.xlsx') ||
      originalname.endsWith('.xls');

    if (isXlsx) {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json<any>(sheet);
      return json.map((row) => ({
        participantName: row['Nombre'] || row['fullName'] || row['participantName'] || '',
        participantEmail: row['Email'] || row['email'] || row['participantEmail'] || '',
        participantDocument: row['Documento'] || row['internalDocument'] || '',
        courseEventId: row['CursoID'] || row['courseEventId'] || '',
        issuedAt: row['FechaEmision'] || row['issuedAt'] || '',
        expiresAt: row['FechaVencimiento'] || row['expiresAt'] || '',
      }));
    } else {
      // CSV Parsing
      const records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
      return records.map((row: any) => ({
        participantName: row['Nombre'] || row['fullName'] || row['participantName'] || '',
        participantEmail: row['Email'] || row['email'] || row['participantEmail'] || '',
        participantDocument: row['Documento'] || row['internalDocument'] || '',
        courseEventId: row['CursoID'] || row['courseEventId'] || '',
        issuedAt: row['FechaEmision'] || row['issuedAt'] || '',
        expiresAt: row['FechaVencimiento'] || row['expiresAt'] || '',
      }));
    }
  }

  /**
   * Vista previa de la importación masiva: identifica válidos, inválidos y duplicados.
   */
  async previewImport(rows: BulkImportRow[]) {
    const validRecords: any[] = [];
    const invalidRecords: any[] = [];
    const coursesMap = new Map<string, any>();

    // Cargar cursos activos para verificación rápida
    const courses = await this.prisma.courseEvent.findMany({ where: { archivedAt: null } });
    courses.forEach((c) => coursesMap.set(c.id, c));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const errors: string[] = [];

      if (!row.participantName || row.participantName.trim().length < 3) {
        errors.push('El nombre del participante es obligatorio (mínimo 3 caracteres).');
      }

      if (!row.courseEventId || !coursesMap.has(row.courseEventId)) {
        errors.push(`ID de curso/evento no válido: "${row.courseEventId}".`);
      }

      if (row.participantEmail && !row.participantEmail.includes('@')) {
        errors.push('El correo electrónico no es válido.');
      }

      const courseName = coursesMap.get(row.courseEventId)?.name || 'Desconocido';

      if (errors.length > 0) {
        invalidRecords.push({ rowNumber: i + 1, data: row, errors });
      } else {
        validRecords.push({
          rowNumber: i + 1,
          participantName: row.participantName.trim(),
          participantEmail: row.participantEmail?.trim().toLowerCase() || null,
          participantDocument: row.participantDocument?.trim() || null,
          courseEventId: row.courseEventId,
          courseName,
          issuedAt: row.issuedAt ? new Date(row.issuedAt).toISOString() : new Date().toISOString(),
          expiresAt: row.expiresAt ? new Date(row.expiresAt).toISOString() : null,
        });
      }
    }

    return {
      totalRows: rows.length,
      validCount: validRecords.length,
      invalidCount: invalidRecords.length,
      validRecords,
      invalidRecords,
    };
  }

  /**
   * Ejecuta la importación masiva de los registros válidos mediante transacciones.
   */
  async executeImport(
    validRecords: any[],
    defaultTemplateFileId: string,
    adminId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    if (!validRecords || validRecords.length === 0) {
      throw new BadRequestException('No hay registros válidos para importar.');
    }

    // Verificar si existe el archivo plantilla predeterminado o crear uno sintético
    let fileId = defaultTemplateFileId;
    if (!fileId) {
      const firstFile = await this.prisma.certificateFile.findFirst();
      if (firstFile) {
        fileId = firstFile.id;
      } else {
        // Crear un registro de archivo predeterminado si aún no hay ninguno
        const defaultFile = await this.prisma.certificateFile.create({
          data: {
            originalName: 'plantilla_masiva_default.pdf',
            storagePath: 'storage/private/certificates/default_template.pdf',
            mimeType: 'application/pdf',
            fileSize: 1024,
            sha256Hash: crypto.createHash('sha256').update('default').digest('hex'),
          },
        });
        fileId = defaultFile.id;
      }
    }

    const issuedCertificates: any[] = [];

    // Ejecutar en transacción atómica
    await this.prisma.$transaction(async (tx) => {
      for (const rec of validRecords) {
        let participant = await tx.participant.findFirst({
          where: {
            fullName: { equals: rec.participantName, mode: 'insensitive' },
            ...(rec.participantEmail ? { email: rec.participantEmail } : {}),
          },
        });

        if (!participant) {
          participant = await tx.participant.create({
            data: {
              fullName: rec.participantName,
              email: rec.participantEmail,
              internalDocument: rec.participantDocument,
            },
          });
        }

        const { rawCode, formattedCode } = generateCertificateCode();
        const normalizedCode = normalizeCertificateCode(rawCode);
        const codeDigest = calculateCodeDigest(normalizedCode, this.pepper);
        const codeLastFour = getCodeLastFour(normalizedCode);
        const verificationToken = crypto.randomUUID();

        const year = new Date().getFullYear();
        const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
        const publicId = `CERT-${year}-${randomHex}`;

        const cert = await tx.certificate.create({
          data: {
            publicId,
            participantId: participant.id,
            courseEventId: rec.courseEventId,
            codeDigest,
            codeLastFour,
            verificationToken,
            status: CertificateStatus.ACTIVE,
            issuedAt: rec.issuedAt ? new Date(rec.issuedAt) : new Date(),
            expiresAt: rec.expiresAt ? new Date(rec.expiresAt) : null,
            certificateFileId: fileId,
            createdById: adminId,
          },
        });

        issuedCertificates.push({
          publicId: cert.publicId,
          participantName: rec.participantName,
          courseName: rec.courseName,
          secretCode: formattedCode, // Retornado una sola vez al reporte de importación
        });
      }
    });

    await this.securityService.logAudit({
      adminId,
      action: 'BULK_CERTIFICATES_IMPORTED',
      resource: 'Certificate',
      resourceId: null,
      ipAddress,
      userAgent,
      result: 'SUCCESS',
      metadata: { count: issuedCertificates.length },
    });

    return {
      success: true,
      importedCount: issuedCertificates.length,
      issuedCertificates,
    };
  }
}
