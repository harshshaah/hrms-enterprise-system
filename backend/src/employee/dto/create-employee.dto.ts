import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

export class CreateEmployeeDto {
  // ==========================================
  // EMPLOYEE DETAILS
  // ==========================================

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message:
      'Phone number must be exactly 10 digits',
  })
  phone: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsMongoId()
  @IsNotEmpty()
  department: string;

  @IsString()
  @IsNotEmpty()
  designation: string;

  @IsDateString()
  @IsNotEmpty()
  joiningDate: string;

  @IsNumber()
  @Min(0)
  salary: number;

  @IsOptional()
  @IsString()
  profilePhoto?: string;

  // ==========================================
  // LOGIN ACCOUNT
  // ==========================================

  @IsOptional()
  @IsBoolean()
  createLoginAccount?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(6, {
    message:
      'Login password must be at least 6 characters',
  })
  loginPassword?: string;
}