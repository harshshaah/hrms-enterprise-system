import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import {
  HydratedDocument,
  Types,
} from 'mongoose';

export type PerformanceDocument =
  HydratedDocument<Performance>;

export enum PerformanceStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PerformanceRating {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

@Schema({
  timestamps: true,
})
export class Performance {
  @Prop({
    type: Types.ObjectId,
    ref: 'Employee',
    required: true,
  })
  employee: Types.ObjectId;

  @Prop({
    required: true,
    min: 2000,
  })
  reviewYear: number;

  @Prop({
    required: true,
    trim: true,
  })
  reviewPeriod: string;

  @Prop({
    required: true,
    min: 1,
    max: 5,
    enum: PerformanceRating,
  })
  rating: PerformanceRating;

  @Prop({
    type: [String],
    default: [],
  })
  goals: string[];

  @Prop({
    type: [String],
    default: [],
  })
  achievements: string[];

  @Prop({
    default: '',
    trim: true,
  })
  strengths: string;

  @Prop({
    default: '',
    trim: true,
  })
  weaknesses: string;

  @Prop({
    default: '',
    trim: true,
  })
  managerFeedback: string;

  @Prop({
    type: String,
    enum: PerformanceStatus,
    default: PerformanceStatus.DRAFT,
  })
  status: PerformanceStatus;

  @Prop({
    type: Date,
    default: null,
  })
  reviewDate: Date | null;

  @Prop({
    default: '',
    trim: true,
  })
  remarks: string;
}

export const PerformanceSchema =
  SchemaFactory.createForClass(
    Performance,
  );

PerformanceSchema.index({
  employee: 1,
  reviewYear: -1,
});

PerformanceSchema.index({
  status: 1,
});

PerformanceSchema.index({
  reviewYear: -1,
});