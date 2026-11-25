import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import {
  RolesGuard,
} from '../auth/guards/roles.guard';

import {
  Roles,
} from '../auth/decorators/roles.decorator';

import {
  NotificationService,
} from './notification.service';

import {
  CreateNotificationDto,
} from './dto/create-notification.dto';

@Controller('notifications')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class NotificationController {
  constructor(
    private readonly notificationService:
      NotificationService,
  ) {}

  @Post()
  @Roles(
    'admin',
    'hr',
  )
  async create(
    @Body()
    createNotificationDto: CreateNotificationDto,
  ) {
    const notification =
      await this.notificationService.create(
        createNotificationDto,
      );

    return {
      success: true,
      message:
        'Notification created successfully',
      data: notification,
    };
  }

  @Get()
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async findMyNotifications(
    @Req() request: any,
  ) {
    const notifications =
      await this.notificationService.findMyNotifications(
        request.user.userId,
      );

    return {
      success: true,
      message:
        'Notifications fetched successfully',
      data: notifications,
    };
  }

  @Get('unread-count')
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async getUnreadCount(
    @Req() request: any,
  ) {
    const result =
      await this.notificationService.getUnreadCount(
        request.user.userId,
      );

    return {
      success: true,
      data: result,
    };
  }

  @Patch('read-all')
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async markAllAsRead(
    @Req() request: any,
  ) {
    const result =
      await this.notificationService.markAllAsRead(
        request.user.userId,
      );

    return {
      success: true,
      ...result,
    };
  }

  @Patch(':id/read')
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async markAsRead(
    @Param('id')
    notificationId: string,

    @Req() request: any,
  ) {
    const notification =
      await this.notificationService.markAsRead(
        notificationId,
        request.user.userId,
      );

    return {
      success: true,
      message:
        'Notification marked as read',
      data: notification,
    };
  }

  @Delete(':id')
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async remove(
    @Param('id')
    notificationId: string,

    @Req() request: any,
  ) {
    const result =
      await this.notificationService.remove(
        notificationId,
        request.user.userId,
      );

    return {
      success: true,
      ...result,
    };
  }
}