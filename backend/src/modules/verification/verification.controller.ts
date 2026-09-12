import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { VerificationService } from './verification.service';

@ApiTags('Public Verification')
@Controller('verify')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Verificar la autenticidad pública de un certificado por QR (Público)' })
  async verifyByToken(@Param('token') token: string, @Req() req: Request) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.verificationService.verifyByToken(token, ipAddress, userAgent);
  }
}
