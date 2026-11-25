import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
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
  CreateEmployeeDto,
} from './dto/create-employee.dto';

import {
  UpdateEmployeeDto,
} from './dto/update-employee.dto';

import {
  EmployeeService,
} from './employee.service';

@Controller('employees')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
  ) {}

  @Post()
  @Roles('admin', 'hr')
  async create(
    @Body()
    createEmployeeDto: CreateEmployeeDto,
    @Req() req: any,
  ) {
    const orgId = req.user?.organizationId;
    const employee =
      await this.employeeService.create(
        createEmployeeDto,
        orgId,
      );

    return {
      success: true,
      message:
        'Employee created successfully',
      data: employee,
    };
  }

  @Get()
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async findAll(@Req() req: any) {
    const orgId = req.user?.organizationId;
    const employees =
      await this.employeeService.findAll(orgId);

    return {
      success: true,
      message:
        'Employees fetched successfully',
      data: employees,
    };
  }

  @Get('me/profile')
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async getMyProfile(
    @Req() request: any,
  ) {
    const employee =
      await this.employeeService.getMyProfile(
        request.user,
      );

    return {
      success: true,
      message:
        'Profile fetched successfully',
      data: employee,
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
    const employee =
      await this.employeeService.findById(
        id,
      );

    return {
      success: true,
      message:
        'Employee fetched successfully',
      data: employee,
    };
  }

  @Patch('me/profile')
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async updateMyProfile(
    @Req() request: any,

    @Body()
    updateEmployeeDto: UpdateEmployeeDto,
  ) {
    const employee =
      await this.employeeService.updateMyProfile(
        request.user,
        updateEmployeeDto,
      );

    return {
      success: true,
      message:
        'Profile updated successfully',
      data: employee,
    };
  }

  @Patch(':id')
  @Roles('admin', 'hr')
  async update(
    @Param('id') id: string,

    @Body()
    updateEmployeeDto: UpdateEmployeeDto,
  ) {
    const employee =
      await this.employeeService.update(
        id,
        updateEmployeeDto,
      );

    return {
      success: true,
      message:
        'Employee updated successfully',
      data: employee,
    };
  }

  @Patch(':id/activate')
  @Roles('admin', 'hr')
  async activate(
    @Param('id') id: string,
  ) {
    const employee =
      await this.employeeService.activate(
        id,
      );

    return {
      success: true,
      message:
        'Employee activated successfully',
      data: employee,
    };
  }

  @Delete(':id')
  @Roles('admin')
  async deactivate(
    @Param('id') id: string,
  ) {
    const employee =
      await this.employeeService.deactivate(
        id,
      );

    return {
      success: true,
      message:
        'Employee deactivated successfully',
      data: employee,
    };
  }
}