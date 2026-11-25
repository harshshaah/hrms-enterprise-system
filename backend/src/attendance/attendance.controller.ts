import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
  AttendanceService,
} from './attendance.service';

import {
  CreateAttendanceDto,
} from './dto/create-attendance.dto';

import {
  UpdateAttendanceDto,
} from './dto/update-attendance.dto';

import {
  AttendanceFilterDto,
} from './dto/attendance-filter.dto';

import {
  AttendanceSummaryDto,
} from './dto/attendance-summary.dto';

@Controller('attendance')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
  ) {}

  @Post()
  @Roles('admin', 'hr')
  async create(
    @Body()
    createAttendanceDto: CreateAttendanceDto,
  ) {
    const attendance =
      await this.attendanceService.create(
        createAttendanceDto,
      );

    return {
      success: true,
      message:
        'Attendance created successfully',
      data: attendance,
    };
  }

  @Get()
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async findAll(
    @Query()
    filters: AttendanceFilterDto,
  ) {
    const attendance =
      await this.attendanceService.findAll(
        filters,
      );

    return {
      success: true,
      message:
        'Attendance fetched successfully',
      data: attendance,
    };
  }

  @Get('summary')
  @Roles('admin', 'hr')
  async getSummary(
    @Query()
    filters: AttendanceSummaryDto,
  ) {
    const summary =
      await this.attendanceService.getSummary(
        filters.date,
      );

    return {
      success: true,
      message:
        'Attendance summary fetched successfully',
      data: summary,
    };
  }

  @Get(':id')
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async findById(
    @Param('id') id: string,
  ) {
    const attendance =
      await this.attendanceService.findById(
        id,
      );

    return {
      success: true,
      message:
        'Attendance fetched successfully',
      data: attendance,
    };
  }

  @Patch(':id')
  @Roles('admin', 'hr')
  async update(
    @Param('id') id: string,

    @Body()
    updateAttendanceDto: UpdateAttendanceDto,
  ) {
    const attendance =
      await this.attendanceService.update(
        id,
        updateAttendanceDto,
      );

    return {
      success: true,
      message:
        'Attendance updated successfully',
      data: attendance,
    };
  }

  @Delete(':id')
  @Roles('admin')
  async delete(
    @Param('id') id: string,
  ) {
    return this.attendanceService.delete(
      id,
    );
  }
}