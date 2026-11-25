import {
  IsDateString,
  IsIn,
  IsMongoId,
  IsOptional,
} from 'class-validator';

export class AttendanceFilterDto {
  @IsOptional()
  @IsMongoId()
  employee?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsIn([
    'present',
    'absent',
    'half-day',
    'leave',
  ])
  status?: string;
}