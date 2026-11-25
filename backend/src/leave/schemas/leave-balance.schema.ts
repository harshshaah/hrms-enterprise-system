import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeaveBalanceDocument = HydratedDocument<LeaveBalance>;

@Schema({ timestamps: true })
export class LeaveBalance {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employee: Types.ObjectId;

  @Prop({ required: true, default: () => new Date().getFullYear() })
  year: number;

  @Prop({
    type: {
      total: { type: Number, default: 12 },
      used: { type: Number, default: 0 },
    },
    default: { total: 12, used: 0 },
  })
  casual: { total: number; used: number };

  @Prop({
    type: {
      total: { type: Number, default: 10 },
      used: { type: Number, default: 0 },
    },
    default: { total: 10, used: 0 },
  })
  sick: { total: number; used: number };

  @Prop({
    type: {
      total: { type: Number, default: 15 },
      used: { type: Number, default: 0 },
    },
    default: { total: 15, used: 0 },
  })
  earned: { total: number; used: number };

  @Prop({
    type: {
      total: { type: Number, default: 182 },
      used: { type: Number, default: 0 },
    },
    default: { total: 182, used: 0 },
  })
  maternity: { total: number; used: number };

  @Prop({
    type: {
      total: { type: Number, default: 15 },
      used: { type: Number, default: 0 },
    },
    default: { total: 15, used: 0 },
  })
  paternity: { total: number; used: number };

  @Prop({
    type: {
      total: { type: Number, default: 999 },
      used: { type: Number, default: 0 },
    },
    default: { total: 999, used: 0 },
  })
  unpaid: { total: number; used: number };

  @Prop({ type: Types.ObjectId, ref: 'Organization', default: null, index: true })
  organization?: Types.ObjectId | null;
}

export const LeaveBalanceSchema = SchemaFactory.createForClass(LeaveBalance);
LeaveBalanceSchema.index({ employee: 1, year: 1 }, { unique: true });

