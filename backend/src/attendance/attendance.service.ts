import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Types } from 'mongoose';

import { AttendanceRepository } from './repositories/attendance.repository';

import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
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
  ) {
    const parsedDate = date
      ? new Date(date)
      : undefined;

    const summary =
      await this.attendanceRepository.getSummary(
        parsedDate,
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
}