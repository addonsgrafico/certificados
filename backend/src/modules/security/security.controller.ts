import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SecurityService } from './security.service';
import { AuthenticatedGuard } from '../../common/guards/authenticated.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { Role } from '@certificados/shared';

@ApiTags('Security & Audit')
@Controller('admin/security')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('audit-logs')
  @Roles(Role.SUPER_ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Consultar logs de auditoría (SuperAdmin / Auditor)' })
  async getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.securityService.getAuditLogs(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('security-events')
  @Roles(Role.SUPER_ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Consultar eventos de seguridad (SuperAdmin / Auditor)' })
  async getSecurityEvents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.securityService.getSecurityEvents(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
