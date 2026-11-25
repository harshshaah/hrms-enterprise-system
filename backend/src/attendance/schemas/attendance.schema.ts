import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  HydratedDocument,
  Types,
} from 'mongoose';

export type AttendanceDocument =
  HydratedDocument<Attendance>;

@Schema({
  timestamps: true,
})
export class Attendance {
  @Prop({
    type: Types.ObjectId,
    ref: 'Employee',
    required: true,
  })
  employee: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Organization',
    default: null,
    index: true,
  })
  organization?: Types.ObjectId | null;

  @Prop({
    type: Types.ObjectId,
    ref: 'Shift',
    default: null,
    index: true,
  })
  shift?: Types.ObjectId | null;

  @Prop({
    required: true,
  })
  date: Date;

  @Prop({
    type: Date,
    default: null,
  })
  checkIn: Date | null;

  @Prop({
    type: Date,
    default: null,
  })
  checkOut: Date | null;

  @Prop({
    enum: [
      'present',
      'absent',
      'half-day',
      'leave',
    ],
    default: 'present',
  })
  status: string;

  @Prop({
    default: 0,
    min: 0,
  })
  workingHours: number;

  @Prop({
    default: false,
  })
  isLate: boolean;

  @Prop({
    default: 0,
    min: 0,
  })
  lateMinutes: number;

  @Prop({
    default: false,
  })
  isHalfDay: boolean;

  @Prop({
    enum: ['web', 'mobile', 'biometric', 'manual'],
    default: 'web',
  })
  clockSource: string;

  @Prop({
    trim: true,
    default: '',
  })
  remarks: string;
}

export const AttendanceSchema =
  SchemaFactory.createForClass(Attendance);