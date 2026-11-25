import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PayrollDocument = HydratedDocument<Payroll>;

export enum PayrollStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Schema({
  timestamps: true,
})
export class Payroll {
  @Prop({
    type: Types.ObjectId,
    ref: 'Employee',
    required: true,
  })
  employee: Types.ObjectId;

  @Prop({
    required: true,
    min: 1,
    max: 12,
  })
  month: number;

  @Prop({
    required: true,
    min: 2000,
  })
  year: number;

  @Prop({
    required: true,
    min: 0,
  })
  basicSalary: number;

  @Prop({
    default: 0,
    min: 0,
  })
  allowances: number;

  @Prop({ default: 0, min: 0 })
  hra: number;

  @Prop({ default: 0, min: 0 })
  conveyanceAllowance: number;

  @Prop({ default: 0, min: 0 })
  specialAllowance: number;

  @Prop({
    default: 0,
    min: 0,
  })
  deductions: number;

  @Prop({ default: 0, min: 0 })
  epfEmployee: number;

  @Prop({ default: 0, min: 0 })
  epfEmployer: number;

  @Prop({ default: 0, min: 0 })
  esicEmployee: number;

  @Prop({ default: 0, min: 0 })
  esicEmployer: number;

  @Prop({ default: 0, min: 0 })
  professionalTax: number;

  @Prop({ default: 0, min: 0 })
  tds: number;

  @Prop({ default: 0, min: 0 })
  lateDeduction: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'Organization',
    default: null,
    index: true,
  })
  organization?: Types.ObjectId | null;

  @Prop({
    required: true,
    min: 0,
  })
  grossSalary: number;

  @Prop({
    required: true,
    min: 0,
  })
  netSalary: number;

  @Prop({
    type: String,
    enum: PayrollStatus,
    default: PayrollStatus.PENDING,
  })
  status: PayrollStatus;

  @Prop({
    type: Date,
    default: null,
  })
  paymentDate: Date | null;

  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  remarks: string;
}

export const PayrollSchema =
  SchemaFactory.createForClass(Payroll);

PayrollSchema.index(
  {
    employee: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  },
);

PayrollSchema.index({
  status: 1,
});

PayrollSchema.index({
  year: 1,
  month: 1,
});