import {
  IsEmail,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn([
    'admin',
    'hr',
    'employee',
  ])
  role: string;

  @IsIn([
    'active',
    'inactive',
  ])
  status: string;

  @IsOptional()
  @IsMongoId()
  employee?: string;
}