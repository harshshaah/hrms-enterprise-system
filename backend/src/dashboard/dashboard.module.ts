import {
  Module,
} from '@nestjs/common';

import {
  MongooseModule,
} from '@nestjs/mongoose';

import {
  DashboardController,
} from './dashboard.controller';

import {
  DashboardService,
} from './dashboard.service';

import {
  DashboardRepository,
} from './repositories/dashboard.repository';

import {
  Employee,
  EmployeeSchema,
} from '../employee/schemas/employee.schema';

import {
  Department,
  DepartmentSchema,
} from '../department/schemas/department.schema';

import {
  Attendance,
  AttendanceSchema,
} from '../attendance/schemas/attendance.schema';

import {
  Leave,
  LeaveSchema,
} from '../leave/schemas/leave.schema';

import {
  User,
  UserSchema,
} from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Employee.name,
        schema: EmployeeSchema,
      },
      {
        name: Department.name,
        schema: DepartmentSchema,
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
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],

  controllers: [
    DashboardController,
  ],

  providers: [
    DashboardService,
    DashboardRepository,
  ],
})
export class DashboardModule {}