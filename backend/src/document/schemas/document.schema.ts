import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import {
  HydratedDocument,
} from 'mongoose';

export type DocumentDocument =
  HydratedDocument<Document>;

@Schema({
  timestamps: true,
})
export class Document {
  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  employeeId: string;

  @Prop({
    required: true,
    trim: true,
  })
  documentType: string;

  @Prop({
    required: true,
    trim: true,
  })
  documentName: string;

  @Prop({
    required: true,
    trim: true,
  })
  fileName: string;

  @Prop({
    required: true,
    trim: true,
  })
  fileUrl: string;

  @Prop({
    required: true,
    trim: true,
  })
  uploadedBy: string;

  @Prop({
    trim: true,
  })
  publicId?: string;

  @Prop({
    trim: true,
  })
  resourceType?: string;

  @Prop({
    enum: [
      'active',
      'inactive',
    ],
    default: 'active',
  })
  status: string;

  createdAt?: Date;

  updatedAt?: Date;
}

export const DocumentSchema =
  SchemaFactory.createForClass(
    Document,
  );