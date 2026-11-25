import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register-company')
  async registerCompany(
    @Body() registerCompanyDto: RegisterCompanyDto,
  ) {
    const result = await this.authService.registerCompany(registerCompanyDto);
    return {
      success: true,
      message: 'Company registered successfully with 14-day free trial',
      data: result,
    };
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ) {
    const user =
      await this.authService.register(
        registerDto,
      );

    return {
      success: true,
      message: 'User registered successfully',
      data: user,
    };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ) {
    const user =
      await this.authService.login(loginDto);

    return {
      success: true,
      message: 'Login successful',
      data: user,
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: any,
  ) {
    const result = await this.authService.changePassword(
      req.user.userId || req.user.sub,
      changePasswordDto,
    );

    return {
      success: true,
      message: result.message,
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: import('./dto/forgot-password.dto').ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: import('./dto/reset-password.dto').ResetPasswordDto) {
    const result = await this.authService.resetPassword(resetPasswordDto);
    return {
      success: true,
      message: result.message,
    };
  }
}