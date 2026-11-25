import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { EmailService } from '../common/email/email.service';

import {
  Types,
  Model,
} from 'mongoose';

import {
  InjectModel,
} from '@nestjs/mongoose';

import {
  Leave,
  LeaveDocument,
} from './schemas/leave.schema';

import {
  Employee,
  EmployeeDocument,
} from '../employee/schemas/employee.schema';

import {
  LeaveRepository,
} from './repositories/leave.repository';

import {
  CreateLeaveDto,
} from './dto/create-leave.dto';

import {
  UpdateLeaveDto,
} from './dto/update-leave.dto';

@Injectable()
export class LeaveService {
  constructor(
    private readonly leaveRepository:
      LeaveRepository,

    @InjectModel(Employee.name)
    private readonly employeeModel:
      Model<EmployeeDocument>,

    private readonly emailService: EmailService,
  ) {}

  private calculateTotalDays(
    startDate: Date,
    endDate: Date,
  ): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    const difference =
      end.getTime() - start.getTime();

    return (
      Math.floor(
        difference /
          (1000 * 60 * 60 * 24),
      ) + 1
    );
  }

  private async checkOverlap(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ) {
    const leaves =
      await this.leaveRepository.findByEmployee(
        employeeId,
      );

    const hasOverlap = leaves.some(
      (leave: any) => {
        if (
          excludeId &&
          leave._id.toString() === excludeId
        ) {
          return false;
        }

        if (
          leave.status === 'rejected' ||
          leave.status === 'cancelled'
        ) {
          return false;
        }

        const existingStart =
          new Date(leave.startDate);

        const existingEnd =
          new Date(leave.endDate);

        return (
          startDate <= existingEnd &&
          endDate >= existingStart
        );
      },
    );

    if (hasOverlap) {
      throw new ConflictException(
        'Leave dates overlap with an existing leave',
      );
    }
  }

  async create(
    createLeaveDto: CreateLeaveDto,
    organizationId?: string,
  ) {
    const {
      employee,
      startDate,
      endDate,
    } = createLeaveDto;

    if (
      !Types.ObjectId.isValid(
        employee,
      )
    ) {
      throw new BadRequestException(
        'Invalid employee ID',
      );
    }

    const employeeExists =
      await this.employeeModel.findById(
        employee,
      );

    if (!employeeExists) {
      throw new NotFoundException(
        'Employee not found',
      );
    }

    if (
      employeeExists.status !==
      'active'
    ) {
      throw new BadRequestException(
        'Leave can only be applied for an active employee',
      );
    }

    const start =
      new Date(startDate);

    const end =
      new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      throw new BadRequestException(
        'Invalid leave dates',
      );
    }

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    if (start > end) {
      throw new BadRequestException(
        'Start date cannot be after end date',
      );
    }

    await this.checkOverlap(
      employee,
      start,
      end,
    );

    const totalDays =
      this.calculateTotalDays(
        start,
        end,
      );

    // Validate Annual Leave Balance Quota
    const targetYear = start.getFullYear();
    const balance = await this.getOrCreateBalance(employee, targetYear, organizationId);
    const typeKey = createLeaveDto.leaveType === 'paid' ? 'earned' : createLeaveDto.leaveType;
    if (typeKey !== 'unpaid' && typeKey !== 'other' && (balance as any)[typeKey]) {
      const avail = (balance as any)[typeKey].remaining;
      if (totalDays > avail) {
        throw new BadRequestException(
          `Insufficient ${typeKey.toUpperCase()} balance. Available: ${avail} day(s), but requested: ${totalDays} day(s).`
        );
      }
    }

    const leave =
      await this.leaveRepository.create(
        {
          ...createLeaveDto,
          employee:
            new Types.ObjectId(
              employee,
            ),
          organization: organizationId ? new Types.ObjectId(organizationId) : null,
          startDate: start,
          endDate: end,
          totalDays,
          status: 'pending',
        },
      );

    return leave;
  }

  async findAll(organizationId?: string) {
    return this.leaveRepository
      .findAll(organizationId);
  }

  async findById(
    id: string,
  ) {
    if (
      !Types.ObjectId.isValid(id)
    ) {
      throw new BadRequestException(
        'Invalid leave ID',
      );
    }

    const leave =
      await this.leaveRepository
        .findById(id);

    if (!leave) {
      throw new NotFoundException(
        'Leave not found',
      );
    }

    return leave;
  }

  async findByEmployee(
    employeeId: string,
  ) {
    if (
      !Types.ObjectId.isValid(
        employeeId,
      )
    ) {
      throw new BadRequestException(
        'Invalid employee ID',
      );
    }

    return this.leaveRepository
      .findByEmployee(
        employeeId,
      );
  }

  async findByStatus(
    status: string,
    organizationId?: string,
  ) {
    const allowedStatuses = [
      'pending',
      'approved',
      'rejected',
      'cancelled',
    ];

    if (
      !allowedStatuses.includes(
        status,
      )
    ) {
      throw new BadRequestException(
        'Invalid leave status',
      );
    }

    return this.leaveRepository
      .findByStatus(status, organizationId);
  }

  async update(
    id: string,
    updateLeaveDto: UpdateLeaveDto,
  ) {
    if (
      !Types.ObjectId.isValid(id)
    ) {
      throw new BadRequestException(
        'Invalid leave ID',
      );
    }

    const existingLeave =
      await this.leaveRepository.findById(
        id,
      );

    if (!existingLeave) {
      throw new NotFoundException(
        'Leave not found',
      );
    }

    if (
      existingLeave.status !==
      'pending'
    ) {
      throw new BadRequestException(
        'Only pending leaves can be edited',
      );
    }

    const startDate =
      updateLeaveDto.startDate
        ? new Date(
            updateLeaveDto.startDate,
          )
        : new Date(
            existingLeave.startDate,
          );

    const endDate =
      updateLeaveDto.endDate
        ? new Date(
            updateLeaveDto.endDate,
          )
        : new Date(
            existingLeave.endDate,
          );

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      throw new BadRequestException(
        'Invalid leave dates',
      );
    }

    startDate.setUTCHours(
      0,
      0,
      0,
      0,
    );

    endDate.setUTCHours(
      0,
      0,
      0,
      0,
    );

    if (startDate > endDate) {
      throw new BadRequestException(
        'Start date cannot be after end date',
      );
    }

    const employeeValue: any =
      existingLeave.employee;

    const employeeId =
      employeeValue?._id
        ? employeeValue._id.toString()
        : employeeValue.toString();

    await this.checkOverlap(
      employeeId,
      startDate,
      endDate,
      id,
    );

    const totalDays =
      this.calculateTotalDays(
        startDate,
        endDate,
      );

    const updateData: Partial<Leave> = {
      startDate,
      endDate,
      totalDays,
    };

    if (
      updateLeaveDto.leaveType !==
      undefined
    ) {
      updateData.leaveType =
        updateLeaveDto.leaveType;
    }

    if (
      updateLeaveDto.reason !==
      undefined
    ) {
      updateData.reason =
        updateLeaveDto.reason;
    }

    if (
      updateLeaveDto.remarks !==
      undefined
    ) {
      updateData.remarks =
        updateLeaveDto.remarks;
    }

    return this.leaveRepository
      .updateById(
        id,
        updateData,
      );
  }

  async approve(
    id: string,
    approvedBy: string,
  ) {
    if (
      !Types.ObjectId.isValid(id)
    ) {
      throw new BadRequestException(
        'Invalid leave ID',
      );
    }

    if (
      !Types.ObjectId.isValid(
        approvedBy,
      )
    ) {
      throw new BadRequestException(
        'Invalid approver ID',
      );
    }

    const leave =
      await this.leaveRepository
        .findById(id);

    if (!leave) {
      throw new NotFoundException(
        'Leave not found',
      );
    }

    const currentStatus = String(leave.status || '').toLowerCase().trim();

    // Idempotent approve: if already approved, return without throwing
    if (currentStatus === 'approved') {
      return leave;
    }

    if (currentStatus !== 'pending') {
      throw new BadRequestException(
        `Only pending leaves can be approved (current status: ${leave.status})`,
      );
    }

    const updatedLeave = await this.leaveRepository
      .updateById(
        id,
        {
          status: 'approved',
          approvedBy:
            new Types.ObjectId(
              approvedBy,
            ),
          approvedAt: new Date(),
        },
      );

    // Update leave balance quota safely
    try {
      const targetYear = new Date(leave.startDate).getFullYear();
      const typeKey = leave.leaveType === 'paid' ? 'earned' : leave.leaveType;
      const orgId = leave.organization ? leave.organization.toString() : undefined;
      const empId = (leave.employee as any)?._id ? (leave.employee as any)._id.toString() : leave.employee?.toString();
      if (empId) {
        const balance = await this.getOrCreateBalance(empId, targetYear, orgId);
        if (typeKey !== 'unpaid' && typeKey !== 'other' && (balance as any)[typeKey]) {
          (balance as any)[typeKey].used = ((balance as any)[typeKey].used || 0) + (leave.totalDays || 1);
          (balance as any)[typeKey].remaining = Math.max(0, (balance as any)[typeKey].total - (balance as any)[typeKey].used);
          await (balance as any).save();
        }
      }
    } catch (balErr) {
      console.warn('Failed to update leave balance quota on approval:', balErr);
    }

    // Safely send email notification (don't fail approval if SMTP is unreachable)
    try {
      const employeeId = (leave.employee as any)?._id || leave.employee;
      const employee = await this.employeeModel.findById(employeeId);
      if (employee && employee.email) {
        await this.emailService.sendLeaveStatusEmail(
          employee.email,
          `${employee.firstName} ${employee.lastName}`,
          'approved',
          leave.startDate,
          leave.endDate,
        );
      }
    } catch (emailErr) {
      console.warn('Failed to send leave status email:', emailErr);
    }

    return updatedLeave;
  }

  async reject(
    id: string,
    approvedBy: string,
    remarks?: string,
  ) {
    if (
      !Types.ObjectId.isValid(id)
    ) {
      throw new BadRequestException(
        'Invalid leave ID',
      );
    }

    if (
      !Types.ObjectId.isValid(
        approvedBy,
      )
    ) {
      throw new BadRequestException(
        'Invalid approver ID',
      );
    }

    const leave =
      await this.leaveRepository
        .findById(id);

    if (!leave) {
      throw new NotFoundException(
        'Leave not found',
      );
    }

    const currentStatus = String(leave.status || '').toLowerCase().trim();

    // Idempotent reject: if already rejected, return without throwing
    if (currentStatus === 'rejected') {
      return leave;
    }

    if (currentStatus !== 'pending') {
      throw new BadRequestException(
        `Only pending leaves can be rejected (current status: ${leave.status})`,
      );
    }

    const updatedLeave = await this.leaveRepository
      .updateById(
        id,
        {
          status: 'rejected',
          approvedBy:
            new Types.ObjectId(
              approvedBy,
            ),
          approvedAt: new Date(),
          ...(remarks
            ? { remarks }
            : {}),
        },
      );

    try {
      const employeeId = (leave.employee as any)?._id || leave.employee;
      const employee = await this.employeeModel.findById(employeeId);
      if (employee && employee.email) {
        await this.emailService.sendLeaveStatusEmail(
          employee.email,
          `${employee.firstName} ${employee.lastName}`,
          'rejected',
          leave.startDate,
          leave.endDate,
          remarks,
        );
      }
    } catch (emailErr) {
      console.warn('Failed to send leave status email:', emailErr);
    }

    return updatedLeave;
  }

  async cancel(
    id: string,
  ) {
    if (
      !Types.ObjectId.isValid(id)
    ) {
      throw new BadRequestException(
        'Invalid leave ID',
      );
    }

    const leave =
      await this.leaveRepository
        .findById(id);

    if (!leave) {
      throw new NotFoundException(
        'Leave not found',
      );
    }

    const currentStatus = String(leave.status || '').toLowerCase().trim();

    if (currentStatus === 'cancelled') {
      return leave;
    }

    if (currentStatus !== 'pending') {
      throw new BadRequestException(
        `Only pending leaves can be cancelled (current status: ${leave.status})`,
      );
    }

    return this.leaveRepository
      .updateById(
        id,
        {
          status: 'cancelled',
        },
      );
  }

  async remove(
    id: string,
  ) {
    if (
      !Types.ObjectId.isValid(id)
    ) {
      throw new BadRequestException(
        'Invalid leave ID',
      );
    }

    const leave =
      await this.leaveRepository
        .findById(id);

    if (!leave) {
      throw new NotFoundException(
        'Leave not found',
      );
    }

    await this.leaveRepository
      .deleteById(id);

    return {
      message:
        'Leave deleted successfully',
    };
  }

  async getOrCreateBalance(employeeId: string, year?: number, organizationId?: string) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID');
    }

    const targetYear = year || new Date().getFullYear();
    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    const approvedLeaves = await this.leaveRepository.findByEmployee(employeeId);
    const yearApproved = approvedLeaves.filter((l: any) => {
      const d = new Date(l.startDate);
      return (l.status === 'approved' || l.status === 'pending') && d >= startOfYear && d <= endOfYear;
    });

    let usedCasual = 0;
    let usedSick = 0;
    let usedEarned = 0;
    let usedMaternity = 0;
    let usedPaternity = 0;
    let usedUnpaid = 0;

    for (const l of yearApproved) {
      const t = l.leaveType;
      const days = l.totalDays || 0;
      if (t === 'casual') usedCasual += days;
      else if (t === 'sick') usedSick += days;
      else if (t === 'earned' || t === 'paid') usedEarned += days;
      else if (t === 'maternity') usedMaternity += days;
      else if (t === 'paternity') usedPaternity += days;
      else if (t === 'unpaid') usedUnpaid += days;
    }

    return {
      year: targetYear,
      casual: {
        total: 12,
        used: usedCasual,
        remaining: Math.max(0, 12 - usedCasual),
        label: 'Casual Leave (CL)',
      },
      sick: {
        total: 10,
        used: usedSick,
        remaining: Math.max(0, 10 - usedSick),
        label: 'Sick Leave (SL)',
      },
      earned: {
        total: 15,
        used: usedEarned,
        remaining: Math.max(0, 15 - usedEarned),
        label: 'Earned Leave (EL/PL)',
      },
      maternity: {
        total: 182,
        used: usedMaternity,
        remaining: Math.max(0, 182 - usedMaternity),
        label: 'Maternity Leave',
      },
      paternity: {
        total: 15,
        used: usedPaternity,
        remaining: Math.max(0, 15 - usedPaternity),
        label: 'Paternity Leave',
      },
      unpaid: {
        total: 999,
        used: usedUnpaid,
        remaining: 999,
        label: 'Leave Without Pay (LWP)',
      },
    };
  }
}