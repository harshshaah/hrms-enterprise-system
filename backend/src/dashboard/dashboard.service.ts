import {
  Injectable,
} from '@nestjs/common';

import {
  DashboardRepository,
} from './repositories/dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
  ) {}

  async getDashboard() {
    const [
      employees,
      departments,
      attendance,
      recentEmployees,
      leaves,
    ] = await Promise.all([
      this.dashboardRepository.getEmployeeStats(),

      this.dashboardRepository.getDepartmentStats(),

      this.dashboardRepository.getTodayAttendanceStats(),

      this.dashboardRepository.getRecentEmployees(),

      this.dashboardRepository.getLeaveStats(),
    ]);

    return {
      employees,
      departments,
      attendance,
      recentEmployees,
      leaves,
    };
  }

  async getEmployeeDashboard(
    userId: string,
  ) {
    return this.dashboardRepository.getEmployeeDashboard(
      userId,
    );
  }
}