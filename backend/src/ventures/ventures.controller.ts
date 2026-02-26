import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VenturesService } from './ventures.service';
import { GetUser } from '../auth/get-user.decorator';
import type { User, Venture, VentureMember } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

class CreateVentureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

class UpdateVentureDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}

@ApiTags('Ventures')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('ventures')
export class VenturesController {

  constructor(private readonly venturesService: VenturesService) { }

  // ─── CRUD ─────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new venture' })
  async create(
    @Body() dto: CreateVentureDto,
    @GetUser() user: User
  ): Promise<Venture> {
    return this.venturesService.create(user.id, dto.name, dto.description);
  }

  @Get()
  @ApiOperation({ summary: 'List all ventures owned by or shared with the user' })
  async findAll(@GetUser() user: User): Promise<Venture[]> {
    return this.venturesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a venture by ID' })
  async findOne(
    @Param('id') id: string,
    @GetUser() user: User
  ): Promise<Venture> {
    return this.venturesService.findOne(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a venture (owner only)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVentureDto,
    @GetUser() user: User
  ): Promise<Venture> {
    return this.venturesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a venture (owner only)' })
  async remove(
    @Param('id') id: string,
    @GetUser() user: User
  ): Promise<{ message: string }> {
    return this.venturesService.remove(id, user.id);
  }

  // ─── TEAM COLLABORATION ───────────────────────────────────────────

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
