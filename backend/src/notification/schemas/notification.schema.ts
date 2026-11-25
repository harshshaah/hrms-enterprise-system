import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import {
  HydratedDocument,
  Types,
} from 'mongoose';

export type NotificationDocument =
  HydratedDocument<Notification>;

@Schema({
  timestamps: true,
})
export class Notification {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  title: string;

  @Prop({
    required: true,
    trim: true,
  })
  message: string;

  @Prop({
    enum: [
      'info',
      'success',
      'warning',
      'error',
    ],
    default: 'info',
  })
  type: string;

  @Prop({
    default: false,
    index: true,
  })
  isRead: boolean;

  @Prop({
    trim: true,
  })
  link?: string;

  createdAt?: Date;

  updatedAt?: Date;
}

export const NotificationSchema =
  SchemaFactory.createForClass(
    Notification,
  );