import {
  IsDateString,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateAttendanceDto {
  @IsMongoId()
  @IsNotEmpty()
  employee: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @IsIn([
    'present',
    'absent',
    'half-day',
    'leave',
  ])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  workingHours?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}