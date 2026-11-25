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
    organizationId?: string,
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
        hra: createPayrollDto.hra || 0,
        conveyanceAllowance: createPayrollDto.conveyanceAllowance || 0,
        specialAllowance: createPayrollDto.specialAllowance || 0,
        deductions,
        epfEmployee: createPayrollDto.epfEmployee || 0,
        epfEmployer: createPayrollDto.epfEmployer || 0,
        esicEmployee: createPayrollDto.esicEmployee || 0,
        esicEmployer: createPayrollDto.esicEmployer || 0,
        professionalTax: createPayrollDto.professionalTax || 0,
        tds: createPayrollDto.tds || 0,
        lateDeduction: createPayrollDto.lateDeduction || 0,
        organization: organizationId ? new Types.ObjectId(organizationId) : null,
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
  organizationId?: string,
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
    organizationId,
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

  calculateStatutory(grossSalary: number, options?: { state?: string; capPfAt1800?: boolean; tds?: number; lateDeductionDays?: number }) {
    const gross = Number(grossSalary) || 0;
    const basicSalary = Math.round(gross * 0.50);
    const hra = Math.round(gross * 0.20);
    const conveyanceAllowance = gross > 15000 ? 1600 : Math.round(gross * 0.05);
    const specialAllowance = Math.max(0, gross - (basicSalary + hra + conveyanceAllowance));
    const allowances = hra + conveyanceAllowance + specialAllowance;

    // EPF (12% of Basic, standard cap at 1,800 if basic > 15,000)
    let epfEmployee = 0;
    let epfEmployer = 0;
    if (basicSalary > 0) {
      if (options?.capPfAt1800 !== false && basicSalary > 15000) {
        epfEmployee = 1800;
        epfEmployer = 1800;
      } else {
        epfEmployee = Math.round(basicSalary * 0.12);
        epfEmployer = Math.round(basicSalary * 0.12);
      }
    }

    // ESIC (if gross <= 21,000: 0.75% employee + 3.25% employer)
    let esicEmployee = 0;
    let esicEmployer = 0;
    if (gross <= 21000 && gross > 0) {
      esicEmployee = Math.ceil(gross * 0.0075);
      esicEmployer = Math.ceil(gross * 0.0325);
    }

    // Professional Tax (Standard Indian Slabs)
    let professionalTax = 0;
    if (gross > 10000) {
      professionalTax = 200;
    } else if (gross > 7500) {
      professionalTax = 175;
    }

    const tds = Number(options?.tds) || 0;

    let lateDeduction = 0;
    if (options?.lateDeductionDays && options.lateDeductionDays > 0) {
      const perDaySalary = gross / 30;
      lateDeduction = Math.round(perDaySalary * options.lateDeductionDays);
    }

    const totalDeductions = epfEmployee + esicEmployee + professionalTax + tds + lateDeduction;
    const netSalary = Math.max(0, gross - totalDeductions);

    return {
      basicSalary,
      hra,
      conveyanceAllowance,
      specialAllowance,
      allowances,
      grossSalary: gross,
      epfEmployee,
      epfEmployer,
      esicEmployee,
      esicEmployer,
      professionalTax,
      tds,
      lateDeduction,
      deductions: totalDeductions,
      netSalary,
    };
  }
}