import {
  IsIn,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UploadDocumentDto {
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
}