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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ShiftService } from './shift.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Controller('shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  @Roles('admin', 'hr', 'superadmin')
  async create(@Body() createShiftDto: CreateShiftDto, @Req() req: any) {
    const orgId = req.user?.organizationId;
    const shift = await this.shiftService.create(createShiftDto, orgId);
    return {
      success: true,
      message: 'Shift created successfully',
      data: shift,
    };
  }

  @Get()
  @Roles('admin', 'hr', 'employee', 'superadmin')
  async findAll(@Req() req: any) {
    const orgId = req.user?.organizationId;
    const shifts = await this.shiftService.findAll(orgId);
    return {
      success: true,
      data: shifts,
    };
  }

  @Get(':id')
  @Roles('admin', 'hr', 'employee', 'superadmin')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const orgId = req.user?.organizationId;
    const shift = await this.shiftService.findOne(id, orgId);
    return {
      success: true,
      data: shift,
    };
  }

  @Patch(':id')
  @Roles('admin', 'hr', 'superadmin')
  async update(
    @Param('id') id: string,
    @Body() updateShiftDto: UpdateShiftDto,
    @Req() req: any,
  ) {
    const orgId = req.user?.organizationId;
    const shift = await this.shiftService.update(id, updateShiftDto, orgId);
    return {
      success: true,
      message: 'Shift updated successfully',
      data: shift,
    };
  }

  @Delete(':id')
  @Roles('admin', 'superadmin')
  async remove(@Param('id') id: string, @Req() req: any) {
    const orgId = req.user?.organizationId;
    const result = await this.shiftService.remove(id, orgId);
    return {
      success: true,
      message: 'Shift deleted successfully',
      data: result,
    };
  }
}

