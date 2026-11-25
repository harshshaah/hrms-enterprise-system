import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  documentType?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  documentName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fileName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fileUrl?: string;

  @IsOptional()
  @IsIn([
    'active',
    'inactive',
  ])
  status?: string;
}