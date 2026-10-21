import {
  IsDateString,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  locationName: string;

  @IsNumber()
  @IsLatitude()
  latitude: number;

  @IsNumber()
  @IsLongitude()
  longitude: number;

  // Toa do phai la so duong va khong vuot qua 100 km.
  @IsNumber()
  @Min(1)
  @Max(100_000)
  radius: number;

  @IsDateString()
  startTime: Date;

  @IsDateString()
  endTime: Date;
}
