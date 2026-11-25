import {
  Injectable,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/mongoose';

import {
  Model,
} from 'mongoose';

import {
  Performance,
  PerformanceDocument,
} from '../schemas/performance.schema';

@Injectable()
export class PerformanceRepository {
  constructor(
    @InjectModel(Performance.name)
    private readonly performanceModel: Model<PerformanceDocument>,
  ) {}

  async create(
    data: Record<string, any>,
  ): Promise<PerformanceDocument> {
    const performance =
      new this.performanceModel(data);

    return performance.save();
  }

  async findAll(): Promise<PerformanceDocument[]> {
    return this.performanceModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(
    id: string,
  ): Promise<PerformanceDocument | null> {
    return this.performanceModel
      .findById(id)
      .exec();
  }

  async updateById(
    id: string,
    data: Record<string, any>,
  ): Promise<PerformanceDocument | null> {
    return this.performanceModel
      .findByIdAndUpdate(
        id,
        data,
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();
  }

  async deleteById(
    id: string,
  ): Promise<PerformanceDocument | null> {
    return this.performanceModel
      .findByIdAndDelete(id)
      .exec();
  }
}