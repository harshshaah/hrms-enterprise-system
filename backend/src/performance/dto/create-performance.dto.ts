import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

import {
  PerformanceRating,
  PerformanceStatus,
} from '../schemas/performance.schema';

export class CreatePerformanceDto {
  @IsString()
  @MinLength(1)
  employee: string;

  @IsInt()
  @Min(2000)
  reviewYear: number;

  @IsString()
  @MinLength(1)
  reviewPeriod: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: PerformanceRating;

  @IsOptional()
  @IsArray()
  @IsString({
    each: true,
  })
  goals?: string[];

  @IsOptional()
  @IsArray()
  @IsString({
    each: true,
  })
  achievements?: string[];

  @IsOptional()
  @IsString()
  strengths?: string;

  @IsOptional()
  @IsString()
  weaknesses?: string;

  @IsOptional()
  @IsString()
  managerFeedback?: string;

  @IsOptional()
  @IsEnum(PerformanceStatus)
  status?: PerformanceStatus;

  @IsOptional()
  @IsDateString()
  reviewDate?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}