import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { IntegrationsService } from './integrations.service';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Integration, User } from '@prisma/client';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

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
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  async getIntegrations(
    @Query('ventureId') ventureId: string,
    @GetUser() user: User
  ): Promise<Integration[]> {
    return this.integrationsService.getIntegrations(ventureId, user.id);
  }

  @Post('toggle')
  async toggleIntegration(
    @Body() dto: ToggleIntegrationDto,
    @GetUser() user: User
  ): Promise<Integration> {
    return this.integrationsService.toggleIntegration(
      dto.ventureId,
      user.id,
      dto.provider,
      dto.connect
    );
  }
}
