import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly logger = Logger;
  private readonly storageDir: string;

  constructor(private readonly configService: ConfigService) {
    this.storageDir =
      this.configService.get<string>('STORAGE_PATH') ||
      path.join(process.cwd(), 'storage', 'private', 'certificates');

    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Valida la firma de magic bytes de un PDF (%PDF- / 0x25 0x50 0x44 0x46 0x2D).
   */
  validatePdfMagicBytes(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 5) return false;
    const header = buffer.subarray(0, 5).toString('ascii');
    return header.startsWith('%PDF-');
  }

  /**
   * Guarda un archivo PDF en el almacenamiento privado de forma segura.
   * Asigna un UUID al archivo físico para evitar Path Traversal y sobreescrituras.
   */
  async saveCertificatePdf(file: Express.Multer.File): Promise<{
    filename: string;
    storagePath: string;
    fileSize: number;
    sha256Hash: string;
    mimeType: string;
  }> {
    const maxPdfSize =
      parseInt(this.configService.get<string>('MAX_PDF_SIZE') || '10485760', 10); // 10MB default

    if (file.size > maxPdfSize) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo permitido de ${(maxPdfSize / (1024 * 1024)).toFixed(1)}MB`,
      );
    }

    // Validación de Magic Bytes
    if (!this.validatePdfMagicBytes(file.buffer)) {
      throw new BadRequestException(
        'El archivo subido no es un documento PDF válido (Firma Magic Bytes no coincide).',
      );
    }

    // Calcular SHA-256 hash para verificación de integridad
    const sha256Hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Nombre de archivo seguro UUID
    const uniqueId = crypto.randomUUID();
    const filename = `${uniqueId}.pdf`;
    const targetPath = path.join(this.storageDir, filename);

    // Escribir archivo en storage privado
    await fs.promises.writeFile(targetPath, file.buffer);

    return {
      filename,
      storagePath: targetPath,
      fileSize: file.size,
      sha256Hash,
      mimeType: 'application/pdf',
    };
  }

  /**
   * Lee el buffer de un archivo desde el storage privado.
   */
  async getFileBuffer(storagePath: string): Promise<Buffer> {
    if (!fs.existsSync(storagePath)) {
      throw new BadRequestException('El archivo solicitado no existe en el almacenamiento.');
    }
    return fs.promises.readFile(storagePath);
  }
}
