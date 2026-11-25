import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Attendance,
  AttendanceDocument,
} from '../schemas/attendance.schema';

@Injectable()
export class AttendanceRepository {
  constructor(
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<AttendanceDocument>,
  ) {}

  async create(
    attendanceData: Partial<Attendance>,
  ): Promise<AttendanceDocument> {
    const attendance =
      new this.attendanceModel(
        attendanceData,
      );

    return attendance.save();
  }

  async findWithFilters(
    filters: {
      employee?: string;
      date?: Date;
      status?: string;
    },
  ): Promise<AttendanceDocument[]> {
    const query: any = {};

    if (filters.employee) {
      query.employee = new Types.ObjectId(
        filters.employee,
      );
    }

    if (filters.date) {
      const startOfDay = new Date(
        filters.date,
      );

      startOfDay.setUTCHours(
        0,
        0,
        0,
        0,
      );

      const endOfDay = new Date(
        filters.date,
      );

      endOfDay.setUTCHours(
        23,
        59,
        59,
        999,
      );

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    if (filters.status) {
      query.status = filters.status;
    }

    return this.attendanceModel
      .find(query)
      .populate(
        'employee',
        'firstName lastName email designation department status',
      )
      .sort({
        date: -1,
        createdAt: -1,
      })
      .exec();
  }

  async getSummary(
    date?: Date,
  ) {
    const match: any = {};

    if (date) {
      const startOfDay = new Date(
        date,
      );

      startOfDay.setUTCHours(
        0,
        0,
        0,
        0,
      );

      const endOfDay = new Date(
        date,
      );

      endOfDay.setUTCHours(
        23,
        59,
        59,
        999,
      );

      match.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const summary =
      await this.attendanceModel.aggregate([
        {
          $match: match,
        },
        {
          $group: {
            _id: '$status',
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    return summary;
  }

  async findAll(): Promise<
    AttendanceDocument[]
  > {
    return this.attendanceModel
      .find()
      .populate(
        'employee',
        'firstName lastName email designation department status',
      )
      .sort({
        date: -1,
        createdAt: -1,
      })
      .exec();
  }

  async findById(
    id: string,
  ): Promise<AttendanceDocument | null> {
    return this.attendanceModel
      .findById(id)
      .populate(
        'employee',
        'firstName lastName email designation department status',
      )
      .exec();
  }

  async findByEmployeeAndDate(
    employee: string,
    date: Date,
  ): Promise<AttendanceDocument | null> {
    const startOfDay = new Date(
      date,
    );

    startOfDay.setUTCHours(
      0,
      0,
      0,
      0,
    );

    const endOfDay = new Date(
      date,
    );

    endOfDay.setUTCHours(
      23,
      59,
      59,
      999,
    );

    return this.attendanceModel
      .findOne({
        employee: new Types.ObjectId(
          employee,
        ),
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .populate(
        'employee',
        'firstName lastName email designation department status',
      )
      .exec();
  }

  async updateById(
    id: string,
    attendanceData: Partial<Attendance>,
  ): Promise<AttendanceDocument | null> {
    return this.attendanceModel
      .findByIdAndUpdate(
        id,
        attendanceData,
        {
          new: true,
          runValidators: true,
        },
      )
      .populate(
        'employee',
        'firstName lastName email designation department status',
      )
      .exec();
  }

  async deleteById(
    id: string,
  ): Promise<AttendanceDocument | null> {
    return this.attendanceModel
      .findByIdAndDelete(id)
      .exec();
  }
}