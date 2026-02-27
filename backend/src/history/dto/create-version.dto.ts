import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVersionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ventureId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tool: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  data: Record<string, unknown>;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  parentId?: string;
}
