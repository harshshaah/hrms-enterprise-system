import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
  LeaveService,
} from './leave.service';

import {
  CreateLeaveDto,
} from './dto/create-leave.dto';

import {
  UpdateLeaveDto,
} from './dto/update-leave.dto';

@Controller('leaves')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class LeaveController {
  constructor(
    private readonly leaveService:
      LeaveService,
  ) {}

  @Post()
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async create(
    @Body()
    createLeaveDto: CreateLeaveDto,
    @Req() req: any,
  ) {
    const orgId = req.user?.organizationId;
    const leave =
      await this.leaveService.create(
        createLeaveDto,
        orgId,
      );

    return {
      success: true,
      message:
        'Leave created successfully',
      data: leave,
    };
  }

  @Get('my-balance')
  @Roles('admin', 'hr', 'employee')
  async getMyBalance(@Req() req: any, @Query('year') year?: string) {
    const employeeId = req.user?.employee;
    if (!employeeId) {
      return {
        success: true,
        data: null,
      };
    }
    const balance = await this.leaveService.getOrCreateBalance(
      employeeId,
      year ? parseInt(year, 10) : undefined,
      req.user?.organizationId,
    );
    return {
      success: true,
      data: balance,
    };
  }

  @Get('balance/:employeeId')
  @Roles('admin', 'hr')
  async getEmployeeBalance(
    @Param('employeeId') employeeId: string,
    @Query('year') year?: string,
    @Req() req?: any,
  ) {
    const balance = await this.leaveService.getOrCreateBalance(
      employeeId,
      year ? parseInt(year, 10) : undefined,
      req?.user?.organizationId,
    );
    return {
      success: true,
      data: balance,
    };
  }

  @Get()
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async findAll(
    @Query('employee')
    employee?: string,

    @Query('status')
    status?: string,

    @Req() req?: any,
  ) {
    const orgId = req?.user?.organizationId;
    let leaves;

    if (employee) {
      leaves =
        await this.leaveService
          .findByEmployee(
            employee,
          );
    } else if (status) {
      leaves =
        await this.leaveService
          .findByStatus(
            status,
            orgId,
          );
    } else {
      leaves =
        await this.leaveService
          .findAll(orgId);
    }

    return {
      success: true,
      message:
        'Leaves fetched successfully',
      data: leaves,
    };
  }

  @Get(':id')
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async findById(
    @Param('id')
    id: string,
  ) {
    const leave =
      await this.leaveService
        .findById(id);

    return {
      success: true,
      message:
        'Leave fetched successfully',
      data: leave,
    };
  }

  @Patch(':id')
  @Roles('admin', 'hr')
  async update(
    @Param('id')
    id: string,

    @Body()
    updateLeaveDto: UpdateLeaveDto,
  ) {
    const leave =
      await this.leaveService.update(
        id,
        updateLeaveDto,
      );

    return {
      success: true,
      message:
        'Leave updated successfully',
      data: leave,
    };
  }

  @Patch(':id/approve')
  @Roles('admin', 'hr')
  async approve(
    @Param('id')
    id: string,

    @Req() req: any,
  ) {
    const approvedBy =
      req.user.userId;

    const leave =
      await this.leaveService.approve(
        id,
        approvedBy,
      );

    return {
      success: true,
      message:
        'Leave approved successfully',
      data: leave,
    };
  }

  @Patch(':id/reject')
  @Roles('admin', 'hr')
  async reject(
    @Param('id')
    id: string,

    @Body('remarks')
    remarks: string,

    @Req() req: any,
  ) {
    const approvedBy =
      req.user.userId;

    const leave =
      await this.leaveService.reject(
        id,
        approvedBy,
        remarks,
      );

    return {
      success: true,
      message:
        'Leave rejected successfully',
      data: leave,
    };
  }

  @Patch(':id/cancel')
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async cancel(
    @Param('id')
    id: string,
  ) {
    const leave =
      await this.leaveService.cancel(
        id,
      );

    return {
      success: true,
      message:
        'Leave cancelled successfully',
      data: leave,
    };
  }

  @Delete(':id')
  @Roles('admin')
  async remove(
    @Param('id')
    id: string,
  ) {
    const result =
      await this.leaveService.remove(
        id,
      );

    return {
      success: true,
      ...result,
    };
  }
}