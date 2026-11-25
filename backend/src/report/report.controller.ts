import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import {
  RolesGuard,
} from '../auth/guards/roles.guard';

import {
  Roles,
} from '../auth/decorators/roles.decorator';

import {
  ReportService,
} from './report.service';

@Controller('reports')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles('admin', 'hr')
export class ReportController {
  constructor(
    private readonly reportService:
      ReportService,
  ) {}

  @Get('summary')
  async getSummary() {
    const data =
      await this.reportService.getSummary();

    return {
      success: true,
      message:
        'Report summary fetched successfully',
      data,
    };
  }

  @Get('employees')
  async getEmployeeReport() {
    const data =
      await this.reportService.getEmployeeReport();

    return {
      success: true,
      message:
        'Employee report fetched successfully',
      data,
    };
  }

  @Get('attendance')
  async getAttendanceReport(
    @Query('startDate')
    startDate?: string,

    @Query('endDate')
    endDate?: string,
  ) {
    const data =
      await this.reportService.getAttendanceReport(
        startDate,
        endDate,
      );

    return {
      success: true,
      message:
        'Attendance report fetched successfully',
      data,
    };
  }

  @Get('leaves')
  async getLeaveReport(
    @Query('startDate')
    startDate?: string,

    @Query('endDate')
    endDate?: string,
  ) {
    const data =
      await this.reportService.getLeaveReport(
        startDate,
        endDate,
      );

    return {
      success: true,
      message:
        'Leave report fetched successfully',
      data,
    };
  }

  @Get('payroll')
  async getPayrollReport(
    @Query('year')
    year?: string,

    @Query('month')
    month?: string,
  ) {
    const data =
      await this.reportService.getPayrollReport(
        year
          ? Number(year)
          : undefined,

        month
          ? Number(month)
          : undefined,
      );

    return {
      success: true,
      message:
        'Payroll report fetched successfully',
      data,
    };
  }

  @Get('performance')
  async getPerformanceReport(
    @Query('year')
    year?: string,
  ) {
    const data =
      await this.reportService.getPerformanceReport(
        year
          ? Number(year)
          : undefined,
      );

    return {
      success: true,
      message:
        'Performance report fetched successfully',
      data,
    };
  }

  @Get('departments')
  async getDepartmentReport() {
    const data =
      await this.reportService.getDepartmentReport();

    return {
      success: true,
      message:
        'Department report fetched successfully',
      data,
    };
  }
}