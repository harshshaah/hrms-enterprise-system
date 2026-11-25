import {
  Module,
} from '@nestjs/common';

import {
  MongooseModule,
} from '@nestjs/mongoose';

import {
  PerformanceController,
} from './performance.controller';

import {
  PerformanceService,
} from './performance.service';

import {
  PerformanceRepository,
} from './repositories/performance.repository';

import {
  Performance,
  PerformanceSchema,
} from './schemas/performance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Performance.name,
        schema: PerformanceSchema,
      },
    ]),
  ],

  controllers: [
    PerformanceController,
  ],

  providers: [
    PerformanceService,
    PerformanceRepository,
  ],

  exports: [
    PerformanceService,
  ],
})
export class PerformanceModule {}