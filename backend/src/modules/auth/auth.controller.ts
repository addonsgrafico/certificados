import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from '../../common/guards/authenticated.guard';
import { CurrentUser } from '../../common/decorators';
import { AdminUser } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión administrativa con soporte TOTP' })
  async login(
    @Body() body: { email: string; pass?: string; password?: string; totpCode?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const passwordToUse = body.pass || body.password || '';

    return this.authService.login(
      body.email,
      passwordToUse,
      body.totpCode,
      ipAddress,
      userAgent,
      res,
    );
  }

  @Post('mfa/setup')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Generar clave y QR de configuración TOTP MFA' })
  async generateMfaSetup(@CurrentUser() user: AdminUser) {
    return this.authService.generateMfaSetup(user.id);
  }

  @Post('mfa/enable')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Validar y activar TOTP MFA' })
  async enableMfa(
    @Body() body: { secret: string; totpCode: string },
    @CurrentUser() user: AdminUser,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.enableMfa(
      user.id,
      body.secret,
      body.totpCode,
      ipAddress,
      userAgent,
    );
  }

  @Post('logout')
  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: AdminUser,
  ) {
    const sessionToken = req.cookies?.admin_session;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.logout(sessionToken, user.id, ipAddress, userAgent, res);
  }

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Obtener datos del usuario autenticado' })
  async getProfile(@CurrentUser() user: AdminUser) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
