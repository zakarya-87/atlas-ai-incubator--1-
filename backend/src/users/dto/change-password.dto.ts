import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'password123',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'New password (min 6 chars)',
    example: 'newpassword456',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}