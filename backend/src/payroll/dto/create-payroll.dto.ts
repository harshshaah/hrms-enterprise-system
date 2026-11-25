import {
  IsMongoId,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePayrollDto {
  @IsMongoId()
  employee: string;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  year: number;

  @IsNumber()
  @Min(0)
  basicSalary: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  allowances?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hra?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  conveyanceAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  specialAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deductions?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  epfEmployee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  epfEmployer?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  esicEmployee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  esicEmployer?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  professionalTax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tds?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lateDeduction?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}