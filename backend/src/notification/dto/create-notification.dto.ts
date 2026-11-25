import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
} from 'class-validator';

export class CreateNotificationDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum([
    'info',
    'success',
    'warning',
    'error',
  ])
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  link?: string;
}