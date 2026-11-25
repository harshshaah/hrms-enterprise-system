import {
  IsDateString,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLeaveDto {
  @IsMongoId()
  @IsNotEmpty()
  employee: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    'casual',
    'sick',
    'earned',
    'maternity',
    'paternity',
    'paid',
    'unpaid',
    'other',
  ])
  leaveType: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}