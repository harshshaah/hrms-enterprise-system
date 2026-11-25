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
  UserService,
} from './user.service';

import {
  CreateUserDto,
} from './dto/create-user.dto';

import {
  UpdateUserDto,
} from './dto/update-user.dto';

import {
  UpdateMyProfileDto,
} from './dto/update-my-profile.dto';

import {
  ChangePasswordDto,
} from './dto/change-password.dto';

@Controller('users')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Post()
  @Roles('admin')
  async create(
    @Body()
    createUserDto: CreateUserDto,
  ) {
    const user =
      await this.userService.create(
        createUserDto,
      );

    return {
      success: true,
      message:
        'User created successfully',
      data: user,
    };
  }

  @Get()
  @Roles('admin', 'hr')
  async findAll() {
    const users =
      await this.userService.findAll();

    return {
      success: true,
      message:
        'Users fetched successfully',
      data: users,
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
    const user =
      await this.userService.getMyProfile(
        request.user,
      );

    return {
      success: true,
      message:
        'Profile fetched successfully',
      data: user,
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
    updateMyProfileDto: UpdateMyProfileDto,
  ) {
    const user =
      await this.userService.updateMyProfile(
        request.user,
        updateMyProfileDto,
      );

    return {
      success: true,
      message:
        'Profile updated successfully',
      data: user,
    };
  }

  @Patch('me/password')
  @Roles(
    'admin',
    'hr',
    'employee',
  )
  async changeMyPassword(
    @Req() request: any,

    @Body()
    changePasswordDto: ChangePasswordDto,
  ) {
    const result =
      await this.userService.changeMyPassword(
        request.user,
        changePasswordDto,
      );

    return result;
  }

  @Get(':id')
  @Roles('admin', 'hr')
  async findOne(
    @Param('id')
    id: string,
  ) {
    const user =
      await this.userService.findOne(
        id,
      );

    return {
      success: true,
      message:
        'User fetched successfully',
      data: user,
    };
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id')
    id: string,

    @Body()
    updateUserDto: UpdateUserDto,
  ) {
    const user =
      await this.userService.update(
        id,
        updateUserDto,
      );

    return {
      success: true,
      message:
        'User updated successfully',
      data: user,
    };
  }

  @Patch(':id/activate')
  @Roles('admin')
  async activate(
    @Param('id')
    id: string,
  ) {
    const result =
      await this.userService.activate(
        id,
      );

    return {
      success: true,
      ...result,
    };
  }

  @Delete(':id')
  @Roles('admin')
  async deactivate(
    @Param('id')
    id: string,
  ) {
    const result =
      await this.userService.deactivate(
        id,
      );

    return {
      success: true,
      ...result,
    };
  }
}