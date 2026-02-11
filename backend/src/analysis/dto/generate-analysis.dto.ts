import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateAnalysisDto {
  @ApiProperty({
    description: 'UUID of the Venture context',
    example: 'v123-456',
  })
  @IsString()
  @IsNotEmpty()
  ventureId: string;

  @ApiProperty({ description: 'Module category', example: 'strategy' })
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiProperty({ description: 'Specific tool identifier', example: 'swot' })
  @IsString()
  @IsNotEmpty()
  tool: string;

  @ApiProperty({
    description: 'User input describing the business',
    example: 'A subscription coffee service.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Output language code', example: 'en' })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiPropertyOptional({ description: 'Custom prompt override' })
  @IsString()
  @IsOptional()
  prompt?: string;

  @ApiPropertyOptional({
    description: 'JSON Schema for the response structure',
  })
  @IsObject()
  @IsOptional()
  responseSchema?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Base64 encoded images for multi-modal analysis',
  })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({
    description: 'Instruction to refine an existing analysis',
  })
  @IsString()
  @IsOptional()
  refinementInstruction?: string;

  @ApiPropertyOptional({ description: 'ID of the analysis being refined' })
  @IsString()
  @IsOptional()
  parentAnalysisId?: string;
}
