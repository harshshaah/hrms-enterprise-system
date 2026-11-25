import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
  PerformanceService,
} from './performance.service';

import {
  CreatePerformanceDto,
} from './dto/create-performance.dto';

import {
  UpdatePerformanceDto,
} from './dto/update-performance.dto';

@Controller('performance')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class PerformanceController {
  constructor(
    private readonly performanceService: PerformanceService,
  ) {}

  @Post()
  @Roles('admin', 'hr')
  create(
    @Body()
    createPerformanceDto: CreatePerformanceDto,
  ) {
    return this.performanceService.create(
      createPerformanceDto,
    );
  }

  @Get()
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  findAll() {
    return this.performanceService.findAll();
  }

  @Get(':id')
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.performanceService.findOne(
      id,
    );
  }

  @Patch(':id')
  @Roles('admin', 'hr')
  update(
    @Param('id')
    id: string,

    @Body()
    updatePerformanceDto: UpdatePerformanceDto,
  ) {
    return this.performanceService.update(
      id,
      updatePerformanceDto,
    );
  }

  @Delete(':id')
  @Roles('admin')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.performanceService.remove(
      id,
    );
  }
}