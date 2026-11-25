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
} from '../../../auth/guards/jwt-auth.guard';

import {
  RolesGuard,
} from '../../../auth/guards/roles.guard';

import {
  Roles,
} from '../../../auth/decorators/roles.decorator';

import {
  PayrollService,
} from '../../services/payroll/payroll.service';

import {
  CreatePayrollDto,
} from '../../dto/create-payroll.dto';

import {
  UpdatePayrollDto,
} from '../../dto/update-payroll.dto';

import {
  PayrollQueryDto,
} from '../../dto/payroll-query.dto';

@Controller('payroll')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
  ) {}

  @Post()
  @Roles('admin', 'hr')
  async create(
    @Body()
    createPayrollDto: CreatePayrollDto,
  ) {
    const data =
      await this.payrollService.create(
        createPayrollDto,
      );

    return {
      success: true,
      message:
        'Payroll created successfully.',
      data,
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
    query: PayrollQueryDto,
  ) {
    const data =
      await this.payrollService.findAll(
        query,
      );

    return {
      success: true,
      message:
        'Payrolls fetched successfully.',
      data,
    };
  }

  @Get('stats')
  @Roles('admin', 'hr')
  async getStats() {
    const data =
      await this.payrollService.getStats();

    return {
      success: true,
      message:
        'Payroll statistics fetched successfully.',
      data,
    };
  }

  @Get(':id')
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async findOne(
    @Param('id')
    id: string,
  ) {
    const data =
      await this.payrollService.findOne(
        id,
      );

    return {
      success: true,
      message:
        'Payroll fetched successfully.',
      data,
    };
  }

  @Patch(':id')
  @Roles('admin', 'hr')
  async update(
    @Param('id')
    id: string,

    @Body()
    updatePayrollDto: UpdatePayrollDto,
  ) {
    const data =
      await this.payrollService.update(
        id,
        updatePayrollDto,
      );

    return {
      success: true,
      message:
        'Payroll updated successfully.',
      data,
    };
  }

  @Patch(':id/pay')
  @Roles('admin', 'hr')
  async markAsPaid(
    @Param('id')
    id: string,
  ) {
    const data =
      await this.payrollService.markAsPaid(
        id,
      );

    return {
      success: true,
      message:
        'Payroll marked as paid successfully.',
      data,
    };
  }

  @Patch(':id/cancel')
  @Roles('admin', 'hr')
  async cancel(
    @Param('id')
    id: string,
  ) {
    const data =
      await this.payrollService.cancel(
        id,
      );

    return {
      success: true,
      message:
        'Payroll cancelled successfully.',
      data,
    };
  }

  @Delete(':id')
  @Roles('admin')
  async remove(
    @Param('id')
    id: string,
  ) {
    const data =
      await this.payrollService.remove(
        id,
      );

    return {
      success: true,
      message:
        data.message,
    };
  }
}