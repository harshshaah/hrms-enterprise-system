import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  HydratedDocument,
  Types,
} from 'mongoose';

export type LeaveDocument =
  HydratedDocument<Leave>;

@Schema({
  timestamps: true,
})
export class Leave {
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
    required: true,
  })
  leaveType: string;

  @Prop({
    required: true,
  })
  startDate: Date;

  @Prop({
    required: true,
  })
  endDate: Date;

  @Prop({
    required: true,
    min: 1,
  })
  totalDays: number;

  @Prop({
    trim: true,
    default: '',
  })
  reason: string;

  @Prop({
    enum: [
      'pending',
      'approved',
      'rejected',
      'cancelled',
    ],
    default: 'pending',
  })
  status: string;

  @Prop({
    trim: true,
    default: '',
  })
  remarks: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    default: null,
  })
  approvedBy: Types.ObjectId | null;

  @Prop({
    type: Date,
    default: null,
  })
  approvedAt: Date | null;
}

export const LeaveSchema =
  SchemaFactory.createForClass(Leave);