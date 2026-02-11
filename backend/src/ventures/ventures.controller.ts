import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


import { VenturesService } from './ventures.service';
import { GetUser } from '../auth/get-user.decorator';
import type { User, VentureMember } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}

@ApiTags('Ventures')
@ApiBearerAuth()
@Controller('ventures')
  @UseGuards(JwtAuthGuard)
export class VenturesController {

  constructor(private readonly venturesService: VenturesService) { }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite a user to a venture' })
  async inviteMember(
    @Param('id') ventureId: string,
    @Body() dto: InviteMemberDto,
    @GetUser() user: User
  ): Promise<VentureMember> {
    return this.venturesService.inviteMember(
      ventureId,
      user.id,
      dto.email,
      dto.role
    );
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List all members of a venture' })
  async listMembers(
    @Param('id') ventureId: string,
    @GetUser() user: User
  ): Promise<(VentureMember & { user: { email: string; fullName: string | null } })[]> {
    return this.venturesService.listMembers(ventureId, user.id);
  }
}
