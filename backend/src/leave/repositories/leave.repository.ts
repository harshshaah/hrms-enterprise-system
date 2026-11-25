import {
  Injectable,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/mongoose';

import {
  Model,
  Types,
} from 'mongoose';

import {
  Leave,
  LeaveDocument,
} from '../schemas/leave.schema';

@Injectable()
export class LeaveRepository {
  constructor(
    @InjectModel(Leave.name)
    private readonly leaveModel:
      Model<LeaveDocument>,
  ) {}

  async create(
    leaveData: Partial<Leave>,
  ) {
    const leave =
      new this.leaveModel(
        leaveData,
      );

    return leave.save();
  }

  async findAll() {
    return this.leaveModel
      .find()
      .populate(
        'employee',
        'firstName lastName email department designation',
      )
      .populate(
        'approvedBy',
        'firstName lastName email',
      )
      .sort({
        createdAt: -1,
      })
      .lean();
  }

  async findById(
    id: string,
  ) {
    return this.leaveModel
      .findById(id)
      .populate(
        'employee',
        'firstName lastName email department designation',
      )
      .populate(
        'approvedBy',
        'firstName lastName email',
      )
      .lean();
  }

  async findByEmployee(
    employeeId: string,
  ) {
    return this.leaveModel
      .find({
        employee:
          new Types.ObjectId(
            employeeId,
          ),
      })
      .populate(
        'employee',
        'firstName lastName email department designation',
      )
      .sort({
        startDate: -1,
      })
      .lean();
  }

  async findByStatus(
    status: string,
  ) {
    return this.leaveModel
      .find({
        status,
      })
      .populate(
        'employee',
        'firstName lastName email department designation',
      )
      .sort({
        createdAt: -1,
      })
      .lean();
  }

 async updateById(
  id: string,
  updateData: Partial<Leave>,
) {
  return this.leaveModel
    .findByIdAndUpdate(
      id,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    )
    .populate(
      'employee',
      'firstName lastName email department designation',
    )
    .populate(
      'approvedBy',
      'firstName lastName email',
    )
    .lean();
}

  async deleteById(
    id: string,
  ) {
    return this.leaveModel
      .findByIdAndDelete(id)
      .lean();
  }
}