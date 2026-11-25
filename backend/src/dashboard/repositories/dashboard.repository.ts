import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/mongoose';

import {
  Model,
  Types,
} from 'mongoose';

import {
  Employee,
  EmployeeDocument,
} from '../../employee/schemas/employee.schema';

import {
  Department,
  DepartmentDocument,
} from '../../department/schemas/department.schema';

import {
  Attendance,
  AttendanceDocument,
} from '../../attendance/schemas/attendance.schema';

import {
  Leave,
  LeaveDocument,
} from '../../leave/schemas/leave.schema';

import {
  User,
  UserDocument,
} from '../../user/schemas/user.schema';

@Injectable()
export class DashboardRepository {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<EmployeeDocument>,

    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,

    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<AttendanceDocument>,

    @InjectModel(Leave.name)
    private readonly leaveModel: Model<LeaveDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getEmployeeStats() {
    const [
      total,
      active,
      inactive,
    ] = await Promise.all([
      this.employeeModel.countDocuments(),

      this.employeeModel.countDocuments({
        status: 'active',
      }),

      this.employeeModel.countDocuments({
        status: 'inactive',
      }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }

  async getDepartmentStats() {
    const [
      total,
      active,
      inactive,
    ] = await Promise.all([
      this.departmentModel.countDocuments(),

      this.departmentModel.countDocuments({
        status: 'active',
      }),

      this.departmentModel.countDocuments({
        status: 'inactive',
      }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }

  async getTodayAttendanceStats() {
    const today = new Date();

    const startOfDay =
      new Date(today);

    startOfDay.setUTCHours(
      0,
      0,
      0,
      0,
    );

    const endOfDay =
      new Date(today);

    endOfDay.setUTCHours(
      23,
      59,
      59,
      999,
    );

    const result =
      await this.attendanceModel.aggregate([
        {
          $match: {
            date: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          },
        },

        {
          $group: {
            _id: '$status',

            count: {
              $sum: 1,
            },
          },
        },
      ]);

    const attendance = {
      total: 0,
      present: 0,
      absent: 0,
      halfDay: 0,
      leave: 0,
    };

    result.forEach(
      (item) => {
        attendance.total +=
          item.count;

        if (
          item._id ===
          'present'
        ) {
          attendance.present =
            item.count;
        }

        if (
          item._id ===
          'absent'
        ) {
          attendance.absent =
            item.count;
        }

        if (
          item._id ===
          'half-day'
        ) {
          attendance.halfDay =
            item.count;
        }

        if (
          item._id ===
          'leave'
        ) {
          attendance.leave =
            item.count;
        }
      },
    );

    return attendance;
  }

  async getLeaveStats() {
    const [
      total,
      pending,
      approved,
      rejected,
      cancelled,
    ] = await Promise.all([
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

      this.leaveModel.countDocuments({
        status: 'cancelled',
      }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      cancelled,
    };
  }

  async getRecentEmployees() {
    return this.employeeModel
      .find()
      .populate(
        'department',
        'name code',
      )
      .sort({
        createdAt: -1,
      })
      .limit(4)
      .lean();
  }

  // ==========================================
  // EMPLOYEE DASHBOARD
  // ==========================================

  async getEmployeeDashboard(
    userId: string,
  ) {
    if (
      !Types.ObjectId.isValid(
        userId,
      )
    ) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const user =
      await this.userModel
        .findById(userId)
        .select(
          'firstName lastName email role employee',
        )
        .lean();

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    if (!user.employee) {
      throw new NotFoundException(
        'Employee profile is not linked to this user',
      );
    }

    const employeeId =
      user.employee;

    const employee =
      await this.employeeModel
        .findById(employeeId)
        .populate(
          'department',
          'name code',
        )
        .lean();

    if (!employee) {
      throw new NotFoundException(
        'Employee profile not found',
      );
    }

    // Today's attendance
    const today =
      new Date();

    const startOfDay =
      new Date(today);

    startOfDay.setUTCHours(
      0,
      0,
      0,
      0,
    );

    const endOfDay =
      new Date(today);

    endOfDay.setUTCHours(
      23,
      59,
      59,
      999,
    );

    const todayAttendance =
      await this.attendanceModel
        .findOne({
          employee: employeeId,
          date: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        })
        .sort({
          date: -1,
        })
        .lean();

    // Leave statistics
    const [
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      cancelledLeaves,
    ] = await Promise.all([
      this.leaveModel.countDocuments({
        employee: employeeId,
        status: 'pending',
      }),

      this.leaveModel.countDocuments({
        employee: employeeId,
        status: 'approved',
      }),

      this.leaveModel.countDocuments({
        employee: employeeId,
        status: 'rejected',
      }),

      this.leaveModel.countDocuments({
        employee: employeeId,
        status: 'cancelled',
      }),
    ]);

    const totalLeaves =
      pendingLeaves +
      approvedLeaves +
      rejectedLeaves +
      cancelledLeaves;

    return {
      employee: {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        designation: employee.designation,
        joiningDate: employee.joiningDate,
        profilePhoto:
          employee.profilePhoto,
        department:
          employee.department,
        status: employee.status,
      },

      attendance: {
        today: todayAttendance
          ? {
              status:
                todayAttendance.status,
              checkIn:
                todayAttendance.checkIn,
              checkOut:
                todayAttendance.checkOut,
              workingHours:
                todayAttendance.workingHours,
              remarks:
                todayAttendance.remarks,
            }
          : null,
      },

      leaves: {
        total: totalLeaves,
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: rejectedLeaves,
        cancelled:
          cancelledLeaves,
      },
    };
  }
}