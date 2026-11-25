import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DepartmentDocument =
  HydratedDocument<Department>;

@Schema({
  timestamps: true,
})
export class Department {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  })
  code: string;

  @Prop({
    trim: true,
    default: '',
  })
  description: string;

  @Prop({
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @Prop({
    type: String,
    default: null,
  })
  headOfDepartment: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const DepartmentSchema =
  SchemaFactory.createForClass(Department);
