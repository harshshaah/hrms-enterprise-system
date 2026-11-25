import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsDateString()
  date?: string;

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