
import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IntegrationsService } from './integrations.service';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';
import { IsBoolean, IsString, IsNotEmpty } from 'class-validator';

class ToggleIntegrationDto {
    @IsString()
    @IsNotEmpty()
    ventureId: string;

    @IsString()
    @IsNotEmpty()
    provider: string;

    @IsBoolean()
    connect: boolean;
}

@Controller('integrations')
@UseGuards(AuthGuard('jwt'))
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  async getIntegrations(
    @Query('ventureId') ventureId: string,
    @GetUser() user: User,
  ) {
    return this.integrationsService.getIntegrations(ventureId, user.id);
  }

  @Post('toggle')
  async toggleIntegration(
    @Body() dto: ToggleIntegrationDto,
    @GetUser() user: User,
  ) {
    return this.integrationsService.toggleIntegration(dto.ventureId, user.id, dto.provider, dto.connect);
  }
}
