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
  DepartmentService,
} from './department.service';

import {
  CreateDepartmentDto,
} from './dto/create-department.dto';

import {
  UpdateDepartmentDto,
} from './dto/update-department.dto';

@Controller('departments')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class DepartmentController {
  constructor(
    private readonly departmentService: DepartmentService,
  ) {}

  @Post()
  @Roles('admin', 'hr')
  async create(
    @Body()
    createDepartmentDto: CreateDepartmentDto,
    @Req() req: any,
  ) {
    const orgId = req.user?.organizationId;
    const department =
      await this.departmentService.create(
        createDepartmentDto,
        orgId,
      );

    return {
      success: true,
      message:
        'Department created successfully',
      data: department,
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
    const departments =
      await this.departmentService.findAll(orgId);

    return {
      success: true,
      message:
        'Departments fetched successfully',
      data: departments,
    };
  }

  @Get(':id')
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async findOne(
    @Param('id') id: string,
  ) {
    const department =
      await this.departmentService.findOne(
        id,
      );

    return {
      success: true,
      message:
        'Department fetched successfully',
      data: department,
    };
  }

  @Patch(':id')
  @Roles('admin', 'hr')
  async update(
    @Param('id') id: string,

    @Body()
    updateDepartmentDto: UpdateDepartmentDto,
  ) {
    const department =
      await this.departmentService.update(
        id,
        updateDepartmentDto,
      );

    return {
      success: true,
      message:
        'Department updated successfully',
      data: department,
    };
  }

  @Delete(':id')
  @Roles('admin')
  async deactivate(
    @Param('id') id: string,
  ) {
    return this.departmentService.deactivate(
      id,
    );
  }

  @Patch(':id/activate')
  @Roles('admin', 'hr')
  async activate(
    @Param('id') id: string,
  ) {
    return this.departmentService.activate(
      id,
    );
  }
}