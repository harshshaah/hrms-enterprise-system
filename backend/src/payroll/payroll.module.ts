import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PayrollController } from './controllers/payroll/payroll.controller';
import { PayrollService } from './services/payroll/payroll.service';
import { PayrollRepository } from './repositories/payroll.repository';

import {
  Payroll,
  PayrollSchema,
} from './schemas/payroll.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Payroll.name,
        schema: PayrollSchema,
      },
    ]),
  ],

  controllers: [
    PayrollController,
  ],

  providers: [
    PayrollService,
    PayrollRepository,
  ],

  exports: [
    PayrollService,
  ],
})
export class PayrollModule {}