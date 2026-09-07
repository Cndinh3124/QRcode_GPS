import {
  IsEmail,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CheckInDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  qrToken: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  participantCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsNumber()
  @IsLatitude()
  latitude: number;

  @IsNumber()
  @IsLongitude()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  device: string;
}