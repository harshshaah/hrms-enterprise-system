import {
  Module,
} from '@nestjs/common';

import {
  MongooseModule,
} from '@nestjs/mongoose';

import {
  User,
  UserSchema,
} from './schemas/user.schema';

import {
  Employee,
  EmployeeSchema,
} from '../employee/schemas/employee.schema';

import {
  UserController,
} from './user.controller';

import {
  UserService,
} from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Employee.name,
        schema: EmployeeSchema,
      },
    ]),
  ],

  controllers: [
    UserController,
  ],

  providers: [
    UserService,
  ],

  exports: [
    MongooseModule,
    UserService,
  ],
})
export class UserModule {}