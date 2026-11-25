import {
  IsIn,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    'aadhaar',
    'pan',
    'resume',
    'offer_letter',
    'joining_letter',
    'experience_letter',
    'salary_slip',
    'other',
  ])
  documentType: string;

  @IsString()
  @IsNotEmpty()
  documentName: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsString()
  @IsNotEmpty()
  uploadedBy: string;
}