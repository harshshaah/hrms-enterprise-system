import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { EmployeeModule } from './employee/employee.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentModule } from './department/department.module';
import { AttendanceModule } from './attendance/attendance.module';

import {
  DashboardModule,
} from './dashboard/dashboard.module';

import { LeaveModule } from './leave/leave.module';
import { PayrollModule } from './payroll/payroll.module';
import { PerformanceModule } from './performance/performance.module';

import {
  DocumentModule,
} from './document/document.module';

import {
  NotificationModule,
} from './notification/notification.module';

import {
  ReportModule,
} from './report/report.module';
import { SettingsModule } from './settings/settings.module';
import { EmailModule } from './common/email/email.module';
import { OrganizationModule } from './organization/organization.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService,
      ) => ({
        uri: configService.get<string>(
          'MONGODB_URI',
        ),
      }),
    }),

    EmployeeModule,
    UserModule,
    AuthModule,
    DepartmentModule,
    AttendanceModule,
    DashboardModule,
    LeaveModule,
    PayrollModule,
    PerformanceModule,
    DocumentModule,
    NotificationModule,
    ReportModule,
    SettingsModule,
    EmailModule,
    OrganizationModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,
  ],
})
export class AppModule {}