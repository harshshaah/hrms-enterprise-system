import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  async create(@Body() createDto: CreateOrganizationDto) {
    const org = await this.orgService.create(createDto);
    return {
      success: true,
      message: 'Organization created successfully',
      data: org,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async findAll() {
    const orgs = await this.orgService.findAll();
    return {
      success: true,
      data: orgs,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin', 'hr')
  async findOne(@Param('id') id: string) {
    const org = await this.orgService.findById(id);
    return {
      success: true,
      data: org,
    };
  }

  @Get('by-slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const org = await this.orgService.findBySlug(slug);
    return {
      success: true,
      data: org,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  async update(@Param('id') id: string, @Body() updateDto: UpdateOrganizationDto) {
    const org = await this.orgService.update(id, updateDto);
    return {
      success: true,
      message: 'Organization updated successfully',
      data: org,
    };
  }
}

