import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ShiftDocument = HydratedDocument<Shift>;

@Schema({ timestamps: true })
export class Shift {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, uppercase: true })
  code: string;

  @Prop({ required: true, trim: true })
  startTime: string; // "09:30" (24h format)

  @Prop({ required: true, trim: true })
  endTime: string; // "18:30" (24h format)

  @Prop({ default: 15, min: 0 })
  gracePeriodMinutes: number; // e.g. 15 mins buffer before marked late

  @Prop({ default: 4.5, min: 1 })
  halfDayHours: number; // minimum hours to qualify for half day

  @Prop({ default: 8.5, min: 1 })
  fullDayHours: number; // minimum hours for full day

  @Prop({
    type: [String],
    default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  })
  workingDays: string[];

  @Prop({
    type: {
      lateMarksPerHalfDay: { type: Number, default: 3 },
    },
    default: { lateMarksPerHalfDay: 3 },
  })
  lateDeductionRule: {
    lateMarksPerHalfDay: number;
  };

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  })
  organization: Types.ObjectId;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop({ trim: true, default: '' })
  description?: string;
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);
ShiftSchema.index({ organization: 1, code: 1 }, { unique: true });

