import {
  Module,
} from '@nestjs/common';

import {
  MongooseModule,
} from '@nestjs/mongoose';

import {
  Leave,
  LeaveSchema,
} from './schemas/leave.schema';

import {
  LeaveBalance,
  LeaveBalanceSchema,
} from './schemas/leave-balance.schema';

import {
  Employee,
  EmployeeSchema,
} from '../employee/schemas/employee.schema';

import {
  User,
  UserSchema,
} from '../user/schemas/user.schema';

import {
  LeaveController,
} from './leave.controller';

import {
  LeaveService,
} from './leave.service';

import {
  LeaveRepository,
} from './repositories/leave.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Leave.name,
        schema: LeaveSchema,
      },
      {
        name: LeaveBalance.name,
        schema: LeaveBalanceSchema,
      },
      {
        name: Employee.name,
        schema: EmployeeSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],

  controllers: [
    LeaveController,
  ],

  providers: [
    LeaveService,
    LeaveRepository,
  ],
})
export class LeaveModule {}