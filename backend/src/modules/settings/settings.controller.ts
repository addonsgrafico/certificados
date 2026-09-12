import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { AuthenticatedGuard } from '../../common/guards/authenticated.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { Role } from '@certificados/shared';

@ApiTags('Settings')
@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Obtener configuración pública de la organización' })
  async getPublicSettings() {
    return this.settingsService.getSettings();
  }

  @Put('admin/settings')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar datos institucionales y de la Coach' })
  async updateSettings(
    @Body()
    body: {
      orgName?: string;
      orgLogoUrl?: string;
      coachName?: string;
      coachTitle?: string;
      coachBio?: string;
      coachAvatarUrl?: string;
      coachSpecialties?: any;
      contactEmail?: string;
      contactPhone?: string;
      whatsapp?: string;
      address?: string;
      socialLinks?: any;
    },
  ) {
    return this.settingsService.updateSettings(body);
  }
}
