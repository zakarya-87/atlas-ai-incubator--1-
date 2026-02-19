import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVentureDto {
  @ApiProperty({
    description: 'Venture name',
    example: 'My Startup',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Venture description',
    example: 'A revolutionary AI-powered platform',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Industry sector',
    example: 'Technology',
    required: false,
  })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiProperty({
    description: 'Business stage',
    example: 'idea',
    required: false,
  })
  @IsString()
  @IsOptional()
  stage?: string;
}