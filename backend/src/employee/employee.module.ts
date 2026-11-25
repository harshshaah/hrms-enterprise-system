import {
  Module,
} from '@nestjs/common';

import {
  MongooseModule,
} from '@nestjs/mongoose';

import {
  EmployeeController,
} from './employee.controller';

import {
  EmployeeService,
} from './employee.service';

import {
  EmployeeRepository,
} from './repositories/employee.repository';

import {
  Employee,
  EmployeeSchema,
} from './schemas/employee.schema';

import {
  Department,
  DepartmentSchema,
} from '../department/schemas/department.schema';

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
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],

  controllers: [
    EmployeeController,
  ],

  providers: [
    EmployeeService,
    EmployeeRepository,
  ],

  exports: [
    EmployeeRepository,
  ],
})
export class EmployeeModule {}