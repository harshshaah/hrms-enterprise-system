import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { Types } from 'mongoose';

export type EmployeeDocument = HydratedDocument<Employee>;

@Schema({
  timestamps: true,
})
export class Employee {
  @Prop({
    required: true,
    trim: true,
  })
  firstName: string;

  @Prop({
    required: true,
    trim: true,
  })
  lastName: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop({
    enum: ['male', 'female', 'other'],
  })
  gender?: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
    trim: true,
  })
  phone: string;

  @Prop()
  address?: string;

  @Prop()
  city?: string;

  @Prop()
  state?: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Organization',
    default: null,
    index: true,
  })
  organization?: Types.ObjectId | null;

  @Prop({
    type: Types.ObjectId,
    ref: 'Department',
    required: true,
  })
  department: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  designation: string;

  @Prop({
    required: true,
  })
  joiningDate: Date;

  @Prop({
    required: true,
    min: 0,
  })
  salary: number;

  @Prop()
  profilePhoto?: string;

  @Prop({
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;
}

export const EmployeeSchema =
  SchemaFactory.createForClass(Employee);