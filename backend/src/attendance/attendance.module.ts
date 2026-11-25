import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceRepository } from './repositories/attendance.repository';
import { ShiftModule } from '../shift/shift.module';

import {
  Attendance,
  AttendanceSchema,
} from './schemas/attendance.schema';
import {
  Employee,
  EmployeeSchema,
} from '../employee/schemas/employee.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Attendance.name,
        schema: AttendanceSchema,
      },
      {
        name: Employee.name,
        schema: EmployeeSchema,
      },
    ]),
    ShiftModule,
  ],

  controllers: [
    AttendanceController,
  ],

  providers: [
    AttendanceService,
    AttendanceRepository,
  ],

  exports: [
    AttendanceService,
    AttendanceRepository,
  ],
})
export class AttendanceModule {}