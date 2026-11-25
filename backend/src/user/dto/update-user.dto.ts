import {
  IsEmail,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsIn([
    'admin',
    'hr',
    'employee',
  ])
  role?: string;

  @IsOptional()
  @IsIn([
    'active',
    'inactive',
  ])
  status?: string;

  @IsOptional()
  @IsMongoId()
  employee?: string;
}