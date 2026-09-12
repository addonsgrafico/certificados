import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { AuthenticatedGuard } from '../../common/guards/authenticated.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { Role } from '@certificados/shared';

@ApiTags('Dashboard')
@Controller('admin/dashboard')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Obtener métricas y estadísticas del panel administrativo' })
  async getStats(@Query('period') period?: 'month' | 'year' | 'all') {
    return this.dashboardService.getDashboardStats(period);
  }
}
