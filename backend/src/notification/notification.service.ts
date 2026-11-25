import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/mongoose';

import {
  Model,
  Types,
} from 'mongoose';

import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

import {
  CreateNotificationDto,
} from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel:
      Model<NotificationDocument>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ) {
    const notification =
      await this.notificationModel.create({
        ...createNotificationDto,
        userId: new Types.ObjectId(
          createNotificationDto.userId,
        ),
        type:
          createNotificationDto.type ||
          'info',
        isRead: false,
      });

    return notification;
  }

  async findMyNotifications(
    userId: string,
  ) {
    return this.notificationModel
      .find({
        userId: new Types.ObjectId(
          userId,
        ),
      })
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  async getUnreadCount(
    userId: string,
  ) {
    const count =
      await this.notificationModel.countDocuments({
        userId: new Types.ObjectId(
          userId,
        ),
        isRead: false,
      });

    return {
      count,
    };
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ) {
    const notification =
      await this.notificationModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(
            notificationId,
          ),
          userId: new Types.ObjectId(
            userId,
          ),
        },
        {
          isRead: true,
        },
        {
          new: true,
        },
      );

    if (!notification) {
      throw new NotFoundException(
        'Notification not found',
      );
    }

    return notification;
  }

  async markAllAsRead(
    userId: string,
  ) {
    const result =
      await this.notificationModel.updateMany(
        {
          userId: new Types.ObjectId(
            userId,
          ),
          isRead: false,
        },
        {
          isRead: true,
        },
      );

    return {
      modifiedCount:
        result.modifiedCount,
      message:
        'All notifications marked as read',
    };
  }

  async remove(
    notificationId: string,
    userId: string,
  ) {
    const notification =
      await this.notificationModel.findOneAndDelete(
        {
          _id: new Types.ObjectId(
            notificationId,
          ),
          userId: new Types.ObjectId(
            userId,
          ),
        },
      );

    if (!notification) {
      throw new NotFoundException(
        'Notification not found',
      );
    }

    return {
      message:
        'Notification deleted successfully',
    };
  }
}