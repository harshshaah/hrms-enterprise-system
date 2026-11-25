import {
  Injectable,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/mongoose';

import {
  Model,
} from 'mongoose';

import {
  Employee,
  EmployeeDocument,
} from '../employee/schemas/employee.schema';

import {
  Attendance,
  AttendanceDocument,
} from '../attendance/schemas/attendance.schema';

import {
  Leave,
  LeaveDocument,
} from '../leave/schemas/leave.schema';

import {
  Payroll,
  PayrollDocument,
  PayrollStatus,
} from '../payroll/schemas/payroll.schema';

import {
  Performance,
  PerformanceDocument,
  PerformanceStatus,
} from '../performance/schemas/performance.schema';

import {
  Department,
  DepartmentDocument,
} from '../department/schemas/department.schema';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel:
      Model<EmployeeDocument>,

    @InjectModel(Attendance.name)
    private readonly attendanceModel:
      Model<AttendanceDocument>,

    @InjectModel(Leave.name)
    private readonly leaveModel:
      Model<LeaveDocument>,

    @InjectModel(Payroll.name)
    private readonly payrollModel:
      Model<PayrollDocument>,

    @InjectModel(Performance.name)
    private readonly performanceModel:
      Model<PerformanceDocument>,

    @InjectModel(Department.name)
    private readonly departmentModel:
      Model<DepartmentDocument>,
  ) {}

  async getSummary() {
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalDepartments,
      totalAttendance,
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      totalPayroll,
      paidPayroll,
      pendingPayroll,
      totalPerformance,
      completedPerformance,
    ] = await Promise.all([
      this.employeeModel.countDocuments(),

      this.employeeModel.countDocuments({
        status: 'active',
      }),

      this.employeeModel.countDocuments({
        status: 'inactive',
      }),

      this.departmentModel.countDocuments({
        status: 'active',
      }),

      this.attendanceModel.countDocuments(),

      this.leaveModel.countDocuments(),

      this.leaveModel.countDocuments({
        status: 'pending',
      }),

      this.leaveModel.countDocuments({
        status: 'approved',
      }),

      this.leaveModel.countDocuments({
        status: 'rejected',
      }),

      this.payrollModel.countDocuments(),

      this.payrollModel.countDocuments({
        status: PayrollStatus.PAID,
      }),

      this.payrollModel.countDocuments({
        status: PayrollStatus.PENDING,
      }),

      this.performanceModel.countDocuments(),

      this.performanceModel.countDocuments({
        status:
          PerformanceStatus.COMPLETED,
      }),
    ]);

    const payrollAmount =
      await this.payrollModel.aggregate([
        {
          $group: {
            _id: null,

            totalGrossSalary: {
              $sum: '$grossSalary',
            },

            totalNetSalary: {
              $sum: '$netSalary',
            },

            totalDeductions: {
              $sum: '$deductions',
            },

            totalAllowances: {
              $sum: '$allowances',
            },
          },
        },
      ]);

    const payrollTotals =
      payrollAmount[0] || {
        totalGrossSalary: 0,
        totalNetSalary: 0,
        totalDeductions: 0,
        totalAllowances: 0,
      };

    const performanceRating =
      await this.performanceModel.aggregate([
        {
          $group: {
            _id: null,

            averageRating: {
              $avg: '$rating',
            },
          },
        },
      ]);

    return {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees,
      },

      departments: {
        total: totalDepartments,
      },

      attendance: {
        total: totalAttendance,
      },

      leaves: {
        total: totalLeaves,
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: rejectedLeaves,
      },

      payroll: {
        total: totalPayroll,
        paid: paidPayroll,
        pending: pendingPayroll,

        totalGrossSalary:
          payrollTotals.totalGrossSalary,

        totalNetSalary:
          payrollTotals.totalNetSalary,

        totalDeductions:
          payrollTotals.totalDeductions,

        totalAllowances:
          payrollTotals.totalAllowances,
      },

      performance: {
        total: totalPerformance,

        completed:
          completedPerformance,

        averageRating:
          performanceRating[0]
            ?.averageRating || 0,
      },
    };
  }

  async getEmployeeReport() {
    const employees =
      await this.employeeModel
        .find()
        .sort({
          createdAt: -1,
        })
        .lean()
        .exec();

    return employees;
  }

  async getAttendanceReport(
    startDate?: string,
    endDate?: string,
  ) {
    const filter: any = {};

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte =
          new Date(startDate);
      }

      if (endDate) {
        const end =
          new Date(endDate);

        end.setHours(
          23,
          59,
          59,
          999,
        );

        filter.date.$lte = end;
      }
    }

    return this.attendanceModel
      .find(filter)
      .populate(
        'employee',
        'firstName lastName department designation',
      )
      .sort({
        date: -1,
      })
      .lean()
      .exec();
  }

  async getLeaveReport(
    startDate?: string,
    endDate?: string,
  ) {
    const filter: any = {};

    if (startDate || endDate) {
      filter.startDate = {};

      if (startDate) {
        filter.startDate.$gte =
          new Date(startDate);
      }

      if (endDate) {
        const end =
          new Date(endDate);

        end.setHours(
          23,
          59,
          59,
          999,
        );

        filter.startDate.$lte =
          end;
      }
    }

    return this.leaveModel
      .find(filter)
      .populate(
        'employee',
        'firstName lastName department designation',
      )
      .populate(
        'approvedBy',
        'email role',
      )
      .sort({
        startDate: -1,
      })
      .lean()
      .exec();
  }

  async getPayrollReport(
    year?: number,
    month?: number,
  ) {
    const filter: any = {};

    if (year) {
      filter.year = year;
    }

    if (month) {
      filter.month = month;
    }

    return this.payrollModel
      .find(filter)
      .populate(
        'employee',
        'firstName lastName department designation',
      )
      .sort({
        year: -1,
        month: -1,
      })
      .lean()
      .exec();
  }

  async getPerformanceReport(
    year?: number,
  ) {
    const filter: any = {};

    if (year) {
      filter.reviewYear = year;
    }

    return this.performanceModel
      .find(filter)
      .populate(
        'employee',
        'firstName lastName department designation',
      )
      .sort({
        reviewYear: -1,
        reviewDate: -1,
      })
      .lean()
      .exec();
  }

  async getDepartmentReport() {
    const departments =
      await this.departmentModel
        .find({
          status: 'active',
        })
        .lean()
        .exec();

    const employeeCounts =
      await this.employeeModel.aggregate([
        {
          $match: {
            status: 'active',
          },
        },

        {
          $group: {
            _id: '$department',

            employeeCount: {
              $sum: 1,
            },
          },
        },
      ]);

    const countMap =
      new Map(
        employeeCounts.map(
          (item) => [
            String(item._id),
            item.employeeCount,
          ],
        ),
      );

    return departments.map(
      (department) => ({
        ...department,

        employeeCount:
          countMap.get(
            department.name,
          ) ||
          countMap.get(
            String(department._id),
          ) ||
          0,
      }),
    );
  }
}