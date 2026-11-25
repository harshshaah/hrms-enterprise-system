import {
  IsDateString,
  IsOptional,
} from 'class-validator';

export class AttendanceSummaryDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}