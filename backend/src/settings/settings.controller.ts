import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import {
  SettingsService,
} from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(
    private readonly settingsService:
      SettingsService,
  ) {}

  @Get()
  async getMySettings(
    @Req() req: any,
  ) {
    const data =
      await this.settingsService.getMySettings(
        req.user.userId,
      );

    return {
      success: true,
      message:
        'Settings fetched successfully',
      data,
    };
  }

  @Patch()
  async updateMySettings(
    @Req() req: any,
    @Body()
    updateData: {
      emailNotifications?: boolean;
      leaveNotifications?: boolean;
      payrollNotifications?: boolean;
      systemNotifications?: boolean;
    },
  ) {
    const data =
      await this.settingsService.updateMySettings(
        req.user.userId,
        updateData,
      );

    return {
      success: true,
      message:
        'Settings updated successfully',
      data,
    };
  }
}