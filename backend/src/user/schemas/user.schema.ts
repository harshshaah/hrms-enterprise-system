import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import {
  HydratedDocument,
  Types,
} from 'mongoose';

export type UserDocument =
  HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
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

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    enum: [
      'superadmin',
      'admin',
      'hr',
      'employee',
    ],
    default: 'employee',
  })
  role: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Organization',
    default: null,
    index: true,
  })
  organization?: Types.ObjectId | null;

  @Prop({
    enum: [
      'active',
      'inactive',
    ],
    default: 'active',
  })
  status: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Employee',
    default: null,
    unique: true,
    sparse: true,
  })
  employee: Types.ObjectId | null;

  createdAt?: Date;

  updatedAt?: Date;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;
}

export const UserSchema =
  SchemaFactory.createForClass(User);