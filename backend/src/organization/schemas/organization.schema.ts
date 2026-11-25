import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrganizationDocument = HydratedDocument<Organization>;

export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  GROWTH = 'growth',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
}

@Schema({ _id: false })
export class SubscriptionInfo {
  @Prop({ enum: SubscriptionPlan, default: SubscriptionPlan.FREE })
  plan: SubscriptionPlan;

  @Prop({ enum: SubscriptionStatus, default: SubscriptionStatus.TRIAL })
  status: SubscriptionStatus;

  @Prop({ default: 15 })
  maxEmployees: number;

  @Prop()
  trialEndsAt?: Date;

  @Prop()
  renewsAt?: Date;
}

@Schema({ _id: false })
export class OrganizationSettings {
  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ default: 'Asia/Kolkata' })
  timeZone: string;

  @Prop({ default: 4 })
  fiscalYearStart: number;

  @Prop({ type: [String], default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] })
  workingDays: string[];

  @Prop({ default: '09:00' })
  defaultWorkStartTime: string;

  @Prop({ default: '18:00' })
  defaultWorkEndTime: string;
}

@Schema({ timestamps: true })
export class Organization {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  website?: string;

  @Prop({ trim: true })
  logo?: string;

  @Prop({ trim: true })
  industry?: string;

  @Prop({ default: '1-10' })
  employeeCountRange: string;

  @Prop({ type: SubscriptionInfo, default: () => ({}) })
  subscription: SubscriptionInfo;

  @Prop({ type: OrganizationSettings, default: () => ({}) })
  settings: OrganizationSettings;

  @Prop({ enum: ['active', 'suspended', 'inactive'], default: 'active' })
  status: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

