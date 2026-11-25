import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/mongoose';

import {
  Model,
} from 'mongoose';

import {
  Settings,
  SettingsDocument,
} from './settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name)
    private readonly settingsModel:
      Model<SettingsDocument>,
  ) {}

  async getMySettings(
    userId: string,
  ) {
    let settings =
      await this.settingsModel
        .findOne({
          user: userId,
        })
        .lean()
        .exec();

    if (!settings) {
      const createdSettings =
        await this.settingsModel.create({
          user: userId,
          emailNotifications: true,
          leaveNotifications: true,
          payrollNotifications: true,
          systemNotifications: true,
        });

      settings =
        createdSettings
          .toObject();
    }

    return settings;
  }

  async updateMySettings(
    userId: string,
    updateData: {
      emailNotifications?: boolean;
      leaveNotifications?: boolean;
      payrollNotifications?: boolean;
      systemNotifications?: boolean;
    },
  ) {
    const settings =
      await this.settingsModel
        .findOneAndUpdate(
          {
            user: userId,
          },
          {
            $set: updateData,
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        )
        .lean()
        .exec();

    if (!settings) {
      throw new NotFoundException(
        'Settings not found',
      );
    }

    return settings;
  }
}