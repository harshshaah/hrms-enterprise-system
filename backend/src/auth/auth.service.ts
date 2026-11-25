import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/mongoose';

import {
  JwtService,
} from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import {
  Model,
} from 'mongoose';

import {
  User,
  UserDocument,
} from '../user/schemas/user.schema';

import {
  Organization,
  OrganizationDocument,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../organization/schemas/organization.schema';

import {
  LoginDto,
} from './dto/login.dto';

import {
  RegisterDto,
} from './dto/register.dto';

import {
  RegisterCompanyDto,
} from './dto/register-company.dto';

import { EmailService } from '../common/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel:
      Model<UserDocument>,

    @InjectModel(Organization.name)
    private readonly orgModel:
      Model<OrganizationDocument>,

    private readonly jwtService:
      JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ) {
    const email =
      registerDto.email.toLowerCase();

    const existingUser =
      await this.userModel
        .findOne({ email })
        .exec();

    if (existingUser) {
      throw new ConflictException(
        'User with this email already exists',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        registerDto.password,
        10,
      );

    const user =
      new this.userModel({
        firstName:
          registerDto.firstName,

        lastName:
          registerDto.lastName,

        email,

        password:
          hashedPassword,

        role:
          registerDto.role,

        status:
          'active',

        employee:
          null,
      });

    const savedUser =
      await user.save();

    return {
      id: savedUser._id,

      firstName:
        savedUser.firstName,

      lastName:
        savedUser.lastName,

      email:
        savedUser.email,

      role:
        savedUser.role,

      status:
        savedUser.status,

      employee:
        savedUser.employee,

      createdAt:
        savedUser.createdAt,
    };
  }

  async registerCompany(dto: RegisterCompanyDto) {
    const slug = dto.companySlug.toLowerCase().trim();
    const existingOrg = await this.orgModel.findOne({ slug }).exec();
    if (existingOrg) {
      throw new ConflictException('An organization with this company URL/slug already exists');
    }

    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const org = new this.orgModel({
      name: dto.companyName.trim(),
      slug,
      email,
      phone: dto.phone,
      employeeCountRange: dto.employeeCountRange || '1-10',
      subscription: {
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.TRIAL,
        maxEmployees: 15,
        trialEndsAt,
      },
      status: 'active',
    });

    const savedOrg = await org.save();

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      organization: savedOrg._id,
      employee: null,
    });

    const savedUser = await user.save();

    const payload = {
      sub: savedUser._id.toString(),
      email: savedUser.email,
      role: savedUser.role,
      organization: savedOrg._id.toString(),
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.status,
        organization: savedOrg._id,
      },
      organization: {
        id: savedOrg._id,
        name: savedOrg.name,
        slug: savedOrg.slug,
        plan: savedOrg.subscription?.plan,
        trialEndsAt: savedOrg.subscription?.trialEndsAt,
      },
    };
  }

  async login(
    loginDto: LoginDto,
  ) {
    const email =
      loginDto.email.toLowerCase();

    const user =
      await this.userModel
        .findOne({ email })
        .populate('organization')
        .exec();

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const isPasswordValid =
      await bcrypt.compare(
        loginDto.password,
        user.password,
      );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    if (
      user.status !==
      'active'
    ) {
      throw new UnauthorizedException(
        'User account is inactive',
      );
    }

    const orgId = user.organization
      ? ((user.organization as any)._id || user.organization).toString()
      : null;

    const payload = {
      sub:
        user._id.toString(),

      email:
        user.email,

      role:
        user.role,

      organization:
        orgId,
    };

    const accessToken =
      await this.jwtService.signAsync(
        payload,
      );

    return {
      accessToken,

      user: {
        id:
          user._id,

        firstName:
          user.firstName,

        lastName:
          user.lastName,

        email:
          user.email,

        role:
          user.role,

        status:
          user.status,

        employee:
          user.employee,

        organization:
          user.organization || null,
      },
    };
  }

  async changePassword(userId: string, changePasswordDto: import('./dto/change-password.dto').ChangePasswordDto) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect old password');
    }

    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    user.password = hashedNewPassword;
    await user.save();

    return {
      message: 'Password changed successfully',
    };
  }

  async forgotPassword(forgotPasswordDto: import('./dto/forgot-password.dto').ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: forgotPasswordDto.email.toLowerCase() }).exec();
    if (!user) {
      return { message: 'If that email is registered, a password reset link has been sent.' };
    }

    const resetToken = Array.from({ length: 32 }, () => Math.random().toString(36).substring(2)).join('').substring(0, 32);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await user.save();
    
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If that email is registered, a password reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: import('./dto/reset-password.dto').ResetPasswordDto) {
    const user = await this.userModel.findOne({
      resetPasswordToken: resetPasswordDto.token,
      resetPasswordExpires: { $gt: new Date() },
    }).exec();

    if (!user) {
      throw new UnauthorizedException('Password reset token is invalid or has expired');
    }

    const hashedNewPassword = await bcrypt.hash(
      resetPasswordDto.newPassword,
      10,
    );

    user.password = hashedNewPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return { message: 'Password has been reset successfully. You can now login.' };
  }
}