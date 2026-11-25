import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import {
  HydratedDocument,
  Types,
} from 'mongoose';

export type SettingsDocument =
  HydratedDocument<Settings>;

@Schema({
  timestamps: true,
})
export class Settings {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  user: Types.ObjectId;

  @Prop({
    default: true,
  })
  emailNotifications: boolean;

  @Prop({
    default: true,
  })
  leaveNotifications: boolean;

  @Prop({
    default: true,
  })
  payrollNotifications: boolean;

  @Prop({
    default: true,
  })
  systemNotifications: boolean;
}

export const SettingsSchema =
  SchemaFactory.createForClass(
    Settings,
  );