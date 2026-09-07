import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  // ==========================================
  // Full name
  // ==========================================

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  // ==========================================
  // Email
  // ==========================================

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  // ==========================================
  // Password
  // ==========================================

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password?: string;

  // ==========================================
  // Account status
  // ==========================================

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // ==========================================
  // Role
  // ==========================================

  @IsOptional()
  @IsString()
  @IsIn([
    'ADMIN',
    'ORGANIZER',
    'PARTICIPANT',
  ])
  role?: string;
}