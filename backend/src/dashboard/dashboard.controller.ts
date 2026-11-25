import {
  Controller,
  Get,
  Req,
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
  DashboardService,
} from './dashboard.service';

@Controller('dashboard')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get()
  @Roles('admin', 'hr')
  async getDashboard() {
    const dashboard =
      await this.dashboardService.getDashboard();

    return {
      success: true,
      message:
        'Dashboard data fetched successfully',
      data: dashboard,
    };
  }

  @Get('me')
  @Roles('employee')
  async getEmployeeDashboard(
    @Req() request: any,
  ) {
    const dashboard =
      await this.dashboardService.getEmployeeDashboard(
        request.user.userId,
      );

    return {
      success: true,
      message:
        'Employee dashboard data fetched successfully',
      data: dashboard,
    };
  }
}