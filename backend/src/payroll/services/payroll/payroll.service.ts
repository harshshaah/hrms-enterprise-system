import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Types } from 'mongoose';

import { PayrollRepository } from '../../repositories/payroll.repository';

import {
  PayrollStatus,
} from '../../schemas/payroll.schema';

import {
  CreatePayrollDto,
} from '../../dto/create-payroll.dto';

import {
  UpdatePayrollDto,
} from '../../dto/update-payroll.dto';

import {
  PayrollQueryDto,
} from '../../dto/payroll-query.dto';

@Injectable()
export class PayrollService {
  constructor(
    private readonly payrollRepository: PayrollRepository,
  ) {}

  async create(
    createPayrollDto: CreatePayrollDto,
  ) {
    const {
      employee,
      month,
      year,
      basicSalary,
      allowances = 0,
      deductions = 0,
      remarks,
    } = createPayrollDto;

    if (!Types.ObjectId.isValid(employee)) {
      throw new BadRequestException(
        'Invalid employee ID.',
      );
    }

    if (
      deductions >
      basicSalary + allowances
    ) {
      throw new BadRequestException(
        'Deductions cannot be greater than gross salary.',
      );
    }

    const existingPayroll =
      await this.payrollRepository.findByEmployeeAndMonth(
        employee,
        month,
        year,
      );

    if (existingPayroll) {
      throw new BadRequestException(
        'Payroll already exists for this employee and month.',
      );
    }

    const grossSalary =
      basicSalary + allowances;

    const netSalary =
      grossSalary - deductions;

    try {
      return await this.payrollRepository.create({
        employee:
          new Types.ObjectId(employee),
        month,
        year,
        basicSalary,
        allowances,
        deductions,
        grossSalary,
        netSalary,
        status:
          PayrollStatus.PENDING,
        paymentDate: null,
        remarks: remarks || '',
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException(
          'Payroll already exists for this employee and month.',
        );
      }

      throw error;
    }
  }

 async findAll(
  query: PayrollQueryDto,
) {
  const {
    month,
    year,
    status,
    page = 1,
    limit = 10,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  return this.payrollRepository.findAll({
    month,
    year,
    status,
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  });
}

  async findOne(id: string) {
    if (
      !Types.ObjectId.isValid(id)
    ) {
      throw new BadRequestException(
        'Invalid payroll ID.',
      );
    }

    const payroll =
      await this.payrollRepository.findById(
        id,
      );

    if (!payroll) {
      throw new NotFoundException(
        'Payroll not found.',
      );
    }

    return payroll;
  }

  async update(
    id: string,
    updatePayrollDto: UpdatePayrollDto,
  ) {
    if (
      !Types.ObjectId.isValid(id)
    ) {
      throw new BadRequestException(
        'Invalid payroll ID.',
      );
    }

    const existingPayroll =
      await this.payrollRepository.findById(
        id,
      );

    if (!existingPayroll) {
      throw new NotFoundException(
        'Payroll not found.',
      );
    }

    const basicSalary =
      updatePayrollDto.basicSalary ??
      existingPayroll.basicSalary;

    const allowances =
      updatePayrollDto.allowances ??
      existingPayroll.allowances;

    const deductions =
      updatePayrollDto.deductions ??
      existingPayroll.deductions;

    const grossSalary =
      basicSalary + allowances;

    if (
      deductions > grossSalary
    ) {
      throw new BadRequestException(
        'Deductions cannot be greater than gross salary.',
      );
    }

    const netSalary =
      grossSalary - deductions;

    const updateData = {
      ...updatePayrollDto,
      grossSalary,
      netSalary,
    };

    return this.payrollRepository.update(
      id,
      updateData,
    );
  }

  async remove(id: string) {
    if (
      !Types.ObjectId.isValid(id)
    ) {
      throw new BadRequestException(
        'Invalid payroll ID.',
      );
    }

    const existingPayroll =
      await this.payrollRepository.findById(
        id,
      );

    if (!existingPayroll) {
      throw new NotFoundException(
        'Payroll not found.',
      );
    }

    await this.payrollRepository.delete(
      id,
    );

    return {
      message:
        'Payroll deleted successfully.',
    };
  }

  async markAsPaid(id: string) {
    if (
      !Types.ObjectId.isValid(id)
    ) {
      throw new BadRequestException(
        'Invalid payroll ID.',
      );
    }

    const payroll =
      await this.payrollRepository.findById(
        id,
      );

    if (!payroll) {
      throw new NotFoundException(
        'Payroll not found.',
      );
    }

    if (
      payroll.status ===
      PayrollStatus.PAID
    ) {
      throw new BadRequestException(
        'Payroll is already marked as paid.',
      );
    }

    if (
      payroll.status ===
      PayrollStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cancelled payroll cannot be marked as paid.',
      );
    }

    return this.payrollRepository.update(
      id,
      {
        status:
          PayrollStatus.PAID,
        paymentDate:
          new Date(),
      },
    );
  }

  async cancel(id: string) {
    if (
      !Types.ObjectId.isValid(id)
    ) {
      throw new BadRequestException(
        'Invalid payroll ID.',
      );
    }

    const payroll =
      await this.payrollRepository.findById(
        id,
      );

    if (!payroll) {
      throw new NotFoundException(
        'Payroll not found.',
      );
    }

    if (
      payroll.status ===
      PayrollStatus.PAID
    ) {
      throw new BadRequestException(
        'Paid payroll cannot be cancelled.',
      );
    }

    return this.payrollRepository.update(
      id,
      {
        status:
          PayrollStatus.CANCELLED,
      },
    );
  }

  async getStats() {
    return this.payrollRepository.getPayrollStats();
  }
}