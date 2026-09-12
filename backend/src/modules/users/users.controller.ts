import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from './users.service';
import { AuthenticatedGuard } from '../../common/guards/authenticated.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role } from '@certificados/shared';
import { AdminUser } from '@prisma/client';

@ApiTags('Admin Users')
@Controller('admin/users')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Listar usuarios administradores (SuperAdmin Exclusivo)' })
  async list() {
    return this.usersService.listAdmins();
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crear nuevo administrador (SuperAdmin Exclusivo)' })
  async create(
    @Body() body: { email: string; fullName: string; pass: string; role: Role },
    @CurrentUser() currentUser: AdminUser,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.usersService.createAdmin(body, currentUser.id, ipAddress, userAgent);
  }

  @Put(':id/status')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activar/Desactivar administrador (SuperAdmin Exclusivo)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
    @CurrentUser() currentUser: AdminUser,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.usersService.updateAdminStatus(
      id,
      body.isActive,
      currentUser.id,
      ipAddress,
      userAgent,
    );
  }
}
