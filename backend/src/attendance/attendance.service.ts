import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AttendanceRepository } from './repositories/attendance.repository';
import { Employee, EmployeeDocument } from '../employee/schemas/employee.schema';
import { ShiftService } from '../shift/shift.service';

import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<EmployeeDocument>,
    private readonly shiftService: ShiftService,
  ) {}

  async create(
    createAttendanceDto: CreateAttendanceDto,
  ) {
    const employeeId =
      createAttendanceDto.employee;

    const date = new Date(
      createAttendanceDto.date,
    );

    /*
     * Check duplicate attendance
     * for same employee and same calendar date.
     */
    const existingAttendance =
      await this.attendanceRepository.findByEmployeeAndDate(
        employeeId,
        date,
      );

    if (existingAttendance) {
      throw new ConflictException(
        'Attendance already exists for this employee on this date',
      );
    }

    const checkIn =
      createAttendanceDto.checkIn
        ? new Date(
            createAttendanceDto.checkIn,
          )
        : null;

    const checkOut =
      createAttendanceDto.checkOut
        ? new Date(
            createAttendanceDto.checkOut,
          )
        : null;

    /*
     * Calculate working hours automatically
     * when both check-in and check-out exist.
     */
    let workingHours =
      createAttendanceDto.workingHours ||
      0;

    if (checkIn && checkOut) {
      const difference =
        checkOut.getTime() -
        checkIn.getTime();

      if (difference < 0) {
        throw new ConflictException(
          'Check-out time cannot be earlier than check-in time',
        );
      }

      workingHours =
        Number(
          (
            difference /
            (1000 * 60 * 60)
          ).toFixed(2),
        );
    }

    const attendanceData = {
      ...createAttendanceDto,

      employee:
        new Types.ObjectId(employeeId),

      date,

      checkIn,

      checkOut,

      status:
        createAttendanceDto.status ||
        'present',

      workingHours,
    };

    return this.attendanceRepository.create(
      attendanceData,
    );
  }

  async getSummary(
    date?: string,
    organizationId?: string,
  ) {
    const parsedDate = date
      ? new Date(date)
      : undefined;

    const summary =
      await this.attendanceRepository.getSummary(
        parsedDate,
        organizationId,
      );

    const result = {
      total: 0,
      present: 0,
      absent: 0,
      halfDay: 0,
      leave: 0,
    };

    summary.forEach((item) => {
      result.total += item.count;

      if (item._id === 'present') {
        result.present =
          item.count;
      }

      if (item._id === 'absent') {
        result.absent =
          item.count;
      }

      if (item._id === 'half-day') {
        result.halfDay =
          item.count;
      }

      if (item._id === 'leave') {
        result.leave =
          item.count;
      }
    });

    return result;
  }

  async findAll(
    filters: {
      employee?: string;
      date?: string;
      status?: string;
    } = {},
    organizationId?: string,
  ) {
    const date = filters.date
      ? new Date(filters.date)
      : undefined;

    return this.attendanceRepository.findWithFilters(
      {
        employee:
          filters.employee,

        date,

        status:
          filters.status,

        organizationId,
      },
    );
  }

  async findById(id: string) {
    const attendance =
      await this.attendanceRepository.findById(
        id,
      );

    if (!attendance) {
      throw new NotFoundException(
        'Attendance not found',
      );
    }

    return attendance;
  }

  async update(
    id: string,
    updateAttendanceDto: UpdateAttendanceDto,
  ) {
    const existingAttendance =
      await this.attendanceRepository.findById(
        id,
      );

    if (!existingAttendance) {
      throw new NotFoundException(
        'Attendance not found',
      );
    }

    const attendanceData: any = {
      ...updateAttendanceDto,
    };

    /*
     * Employee cannot be changed from update DTO.
     *
     * IMPORTANT:
     * findById() populates employee.
     * Therefore employee can be either:
     *
     * 1. ObjectId
     * 2. Populated employee object
     *
     * We safely extract the actual ObjectId.
     */
    const employeeValue: any =
      existingAttendance.employee;

    const employeeId =
      employeeValue?._id
        ? employeeValue._id.toString()
        : employeeValue.toString();

    /*
     * Check duplicate attendance when
     * date is changed.
     *
     * Repository checks complete calendar day.
     */
    if (updateAttendanceDto.date) {
      const newDate =
        new Date(
          updateAttendanceDto.date,
        );

      const existingForNewDate =
        await this.attendanceRepository.findByEmployeeAndDate(
          employeeId,
          newDate,
        );

      if (
        existingForNewDate &&
        existingForNewDate._id.toString() !== id
      ) {
        throw new ConflictException(
          'Attendance already exists for this employee on this date',
        );
      }

      attendanceData.date =
        newDate;
    }

    /*
     * Convert check-in string
     * into Date object.
     */
    if (updateAttendanceDto.checkIn) {
      const checkIn =
        new Date(
          updateAttendanceDto.checkIn,
        );

      if (
        Number.isNaN(
          checkIn.getTime(),
        )
      ) {
        throw new ConflictException(
          'Invalid check-in time',
        );
      }

      attendanceData.checkIn =
        checkIn;
    }

    /*
     * Convert check-out string
     * into Date object.
     */
    if (updateAttendanceDto.checkOut) {
      const checkOut =
        new Date(
          updateAttendanceDto.checkOut,
        );

      if (
        Number.isNaN(
          checkOut.getTime(),
        )
      ) {
        throw new ConflictException(
          'Invalid check-out time',
        );
      }

      attendanceData.checkOut =
        checkOut;
    }

    /*
     * Calculate working hours using
     * updated values + existing values.
     */
    const checkIn =
      attendanceData.checkIn ??
      existingAttendance.checkIn;

    const checkOut =
      attendanceData.checkOut ??
      existingAttendance.checkOut;

    if (checkIn && checkOut) {
      const difference =
        new Date(checkOut).getTime() -
        new Date(checkIn).getTime();

      if (difference < 0) {
        throw new ConflictException(
          'Check-out time cannot be earlier than check-in time',
        );
      }

      attendanceData.workingHours =
        Number(
          (
            difference /
            (1000 * 60 * 60)
          ).toFixed(2),
        );
    }

    /*
     * Update attendance record.
     */
    return this.attendanceRepository.updateById(
      id,
      attendanceData,
    );
  }

  async delete(id: string) {
    const existingAttendance =
      await this.attendanceRepository.findById(
        id,
      );

    if (!existingAttendance) {
      throw new NotFoundException(
        'Attendance not found',
      );
    }

    await this.attendanceRepository.deleteById(
      id,
    );

    return {
      message:
        'Attendance deleted successfully',
    };
  }

  async clockIn(employeeId: string, organizationId?: string) {
    if (!employeeId) {
      throw new NotFoundException('Employee ID is required for clock-in');
    }

    const today = new Date();
    const existing = await this.attendanceRepository.findByEmployeeAndDate(employeeId, today);
    if (existing && existing.checkIn) {
      throw new ConflictException(
        `Already clocked in today at ${new Date(existing.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      );
    }

    const employee = await this.employeeModel.findById(employeeId).exec();
    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    let shift: any = null;
    if (employee.shift) {
      try {
        shift = await this.shiftService.findOne(employee.shift.toString());
      } catch (err) {
        shift = null;
      }
    }
    if (!shift && organizationId) {
      shift = await this.shiftService.findDefaultOrFirst(organizationId);
    }

    const now = new Date();
    let isLate = false;
    let lateMinutes = 0;

    if (shift && shift.startTime) {
      const [startHour, startMin] = shift.startTime.split(':').map(Number);
      const shiftStartTime = new Date(now);
      shiftStartTime.setHours(startHour, startMin, 0, 0);

      const graceMinutes = shift.gracePeriodMinutes !== undefined ? shift.gracePeriodMinutes : 15;
      const graceTime = new Date(shiftStartTime.getTime() + graceMinutes * 60 * 1000);

      if (now > graceTime) {
        isLate = true;
        lateMinutes = Math.max(0, Math.round((now.getTime() - shiftStartTime.getTime()) / (1000 * 60)));
      }
    }

    if (existing) {
      return this.attendanceRepository.updateById(existing._id.toString(), {
        checkIn: now,
        status: 'present',
        isLate,
        lateMinutes,
        shift: shift?._id || existing.shift,
        clockSource: 'web',
      });
    }

    const attendanceData = {
      employee: new Types.ObjectId(employeeId),
      organization: organizationId ? new Types.ObjectId(organizationId) : employee.organization || null,
      shift: shift?._id || null,
      date: now,
      checkIn: now,
      checkOut: null,
      status: 'present',
      workingHours: 0,
      isLate,
      lateMinutes,
      clockSource: 'web',
    };

    return this.attendanceRepository.create(attendanceData);
  }

  async clockOut(employeeId: string) {
    if (!employeeId) {
      throw new NotFoundException('Employee ID is required for clock-out');
    }

    const today = new Date();
    const existing = await this.attendanceRepository.findByEmployeeAndDate(employeeId, today);
    if (!existing || !existing.checkIn) {
      throw new NotFoundException('No clock-in record found for today. Please clock in first.');
    }

    if (existing.checkOut) {
      throw new ConflictException(
        `Already clocked out today at ${new Date(existing.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      );
    }

    const now = new Date();
    const diffMs = now.getTime() - new Date(existing.checkIn).getTime();
    const workingHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

    const shift: any = existing.shift;
    const halfDayHours = shift?.halfDayHours || 4.5;
    const fullDayHours = shift?.fullDayHours || 8.5;

    let status = 'present';
    let isHalfDay = false;

    if (workingHours < halfDayHours) {
      status = 'half-day';
      isHalfDay = true;
    } else if (workingHours < fullDayHours) {
      status = 'half-day';
      isHalfDay = true;
    }

    return this.attendanceRepository.updateById(existing._id.toString(), {
      checkOut: now,
      workingHours,
      status,
      isHalfDay,
    });
  }

  async getToday(employeeId: string, organizationId?: string) {
    if (!employeeId) {
      return { attendance: null, shift: null };
    }

    const today = new Date();
    const attendance = await this.attendanceRepository.findByEmployeeAndDate(employeeId, today);

    const employee = await this.employeeModel.findById(employeeId).exec();
    let shift: any = null;
    if (employee?.shift) {
      try {
        shift = await this.shiftService.findOne(employee.shift.toString());
      } catch (err) {
        shift = null;
      }
    }
    if (!shift && organizationId) {
      shift = await this.shiftService.findDefaultOrFirst(organizationId);
    }

    return {
      attendance,
      shift,
    };
  }

  async getLateSummary(employeeId: string, month?: number, year?: number) {
    if (!employeeId) {
      throw new NotFoundException('Employee ID is required');
    }

    const currentYear = year || new Date().getFullYear();
    const currentMonth = month !== undefined ? month : new Date().getMonth();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    const records = await this.attendanceRepository.findWithFilters({
      employee: employeeId,
    });

    const monthRecords = records.filter((r) => {
      const d = new Date(r.date);
      return d >= startOfMonth && d <= endOfMonth;
    });

    const lateRecords = monthRecords.filter((r) => r.isLate);
    const totalLateMarks = lateRecords.length;
    const totalLateMinutes = lateRecords.reduce((sum, r) => sum + (r.lateMinutes || 0), 0);
    // Zimyo Standard Late Rule: 3 late marks = 0.5 day deduction
    const lateDeductionDays = Math.floor(totalLateMarks / 3) * 0.5;

    return {
      month: currentMonth + 1,
      year: currentYear,
      totalDaysPresent: monthRecords.length,
      totalLateMarks,
      totalLateMinutes,
      lateDeductionDays,
      lateRecords,
    };
  }
}