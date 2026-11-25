import {
  Module,
} from '@nestjs/common';

import {
  MongooseModule,
} from '@nestjs/mongoose';

import {
  ReportController,
} from './report.controller';

import {
  ReportService,
} from './report.service';

import {
  Employee,
  EmployeeSchema,
} from '../employee/schemas/employee.schema';

import {
  Attendance,
  AttendanceSchema,
} from '../attendance/schemas/attendance.schema';

import {
  Leave,
  LeaveSchema,
} from '../leave/schemas/leave.schema';

import {
  Payroll,
  PayrollSchema,
} from '../payroll/schemas/payroll.schema';

import {
  Performance,
  PerformanceSchema,
} from '../performance/schemas/performance.schema';

import {
  Department,
  DepartmentSchema,
} from '../department/schemas/department.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Employee.name,
        schema: EmployeeSchema,
      },
      {
        name: Attendance.name,
        schema: AttendanceSchema,
      },
      {
        name: Leave.name,
        schema: LeaveSchema,
      },
      {
        name: Payroll.name,
        schema: PayrollSchema,
      },
      {
        name: Performance.name,
        schema: PerformanceSchema,
      },
      {
        name: Department.name,
        schema: DepartmentSchema,
      },
    ]),
  ],

  controllers: [
    ReportController,
  ],

  providers: [
    ReportService,
  ],
})
export class ReportModule {}