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

  async getDashboard(organizationId?: string) {
    const [
      employees,
      departments,
      attendance,
      recentEmployees,
      leaves,
    ] = await Promise.all([
      this.dashboardRepository.getEmployeeStats(organizationId),

      this.dashboardRepository.getDepartmentStats(organizationId),

      this.dashboardRepository.getTodayAttendanceStats(organizationId),

      this.dashboardRepository.getRecentEmployees(organizationId),

      this.dashboardRepository.getLeaveStats(organizationId),
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