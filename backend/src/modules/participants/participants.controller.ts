import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ParticipantsService } from './participants.service';
import { AuthenticatedGuard } from '../../common/guards/authenticated.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { Role } from '@certificados/shared';

@ApiTags('Participants')
@Controller('admin/participants')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Listar participantes con paginación y búsqueda (Admin)' })
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.participantsService.listParticipants(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      search,
    );
  }

  @Get(':id/dossier')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Obtener expediente y carpeta completa de un estudiante (Admin)' })
  async getDossier(@Param('id') id: string) {
    return this.participantsService.getParticipantDossier(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Crear nuevo participante (Admin)' })
  async create(
    @Body() body: { fullName: string; email?: string; internalDocument?: string },
  ) {
    return this.participantsService.createParticipant(body);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar datos de un participante (Admin)' })
  async update(
    @Param('id') id: string,
    @Body() body: { fullName?: string; email?: string; internalDocument?: string },
  ) {
    return this.participantsService.updateParticipant(id, body);
  }
}
