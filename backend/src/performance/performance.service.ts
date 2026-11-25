import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PerformanceDocument,
} from './schemas/performance.schema';

import {
  CreatePerformanceDto,
} from './dto/create-performance.dto';

import {
  UpdatePerformanceDto,
} from './dto/update-performance.dto';

import {
  PerformanceRepository,
} from './repositories/performance.repository';

@Injectable()
export class PerformanceService {
  constructor(
    private readonly performanceRepository: PerformanceRepository,
  ) {}

  async create(
    createPerformanceDto: CreatePerformanceDto,
  ): Promise<PerformanceDocument> {
    return this.performanceRepository.create(
      createPerformanceDto,
    );
  }

  async findAll(): Promise<PerformanceDocument[]> {
    return this.performanceRepository.findAll();
  }

  async findOne(
    id: string,
  ): Promise<PerformanceDocument> {
    const performance =
      await this.performanceRepository.findById(id);

    if (!performance) {
      throw new NotFoundException(
        'Performance record not found',
      );
    }

    return performance;
  }

  async update(
    id: string,
    updatePerformanceDto: UpdatePerformanceDto,
  ): Promise<PerformanceDocument> {
    const performance =
      await this.performanceRepository.updateById(
        id,
        updatePerformanceDto,
      );

    if (!performance) {
      throw new NotFoundException(
        'Performance record not found',
      );
    }

    return performance;
  }

  async remove(
    id: string,
  ): Promise<PerformanceDocument> {
    const performance =
      await this.performanceRepository.deleteById(id);

    if (!performance) {
      throw new NotFoundException(
        'Performance record not found',
      );
    }

    return performance;
  }
}