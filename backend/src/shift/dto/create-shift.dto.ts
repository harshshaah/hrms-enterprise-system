import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateShiftDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:mm 24-hour format (e.g. 09:30)',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:mm 24-hour format (e.g. 18:30)',
  })
  endTime: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  gracePeriodMinutes?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  halfDayHours?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  fullDayHours?: number;

  @IsArray()
  @IsOptional()
  workingDays?: string[];

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

