
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/mongoose';

import * as bcrypt from 'bcrypt';

import {
  Model,
  Types,
} from 'mongoose';

import {
  User,
  UserDocument,
} from './schemas/user.schema';

import {
  Employee,
  EmployeeDocument,
} from '../employee/schemas/employee.schema';

import {
  ChangePasswordDto,
} from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel:
      Model<UserDocument>,

    @InjectModel(Employee.name)
    private readonly employeeModel:
      Model<EmployeeDocument>,
  ) {}

  // ==========================================
  // CREATE USER
  // ==========================================

  async create(
    createData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: string;
      status: string;
      employee?: string;
    },
  ) {
    const email =
      createData.email
        .toLowerCase()
        .trim();

    // ==========================================
    // CHECK DUPLICATE USER EMAIL
    // ==========================================

    const existingUser =
      await this.userModel
        .findOne({
          email,
        })
        .exec();

    if (existingUser) {
      throw new ConflictException(
        'User with this email already exists',
      );
    }

    let employeeId:
      | Types.ObjectId
      | null = null;

    // ==========================================
    // ROLE VALIDATION
    // ==========================================

    if (
      createData.role === 'employee'
    ) {
      /*
       * Employee account should be created
       * from Add Employee.
       *
       * Therefore employee ID must be provided
       * by Add Employee flow.
       */

      if (!createData.employee) {
        throw new ConflictException(
          'Employee account must be created from Add Employee',
        );
      }

      if (
        !Types.ObjectId.isValid(
          createData.employee,
        )
      ) {
        throw new ConflictException(
          'Invalid employee ID',
        );
      }

      const employee =
        await this.employeeModel
          .findById(
            createData.employee,
          )
          .exec();

      if (!employee) {
        throw new NotFoundException(
          'Employee profile not found',
        );
      }

      if (
        employee.status !== 'active'
      ) {
        throw new ConflictException(
          'User can only be created for an active employee',
        );
      }

      // ==========================================
      // CHECK EMPLOYEE ALREADY HAS ACCOUNT
      // ==========================================

      const existingEmployeeUser =
        await this.userModel
          .findOne({
            employee:
              employee._id,
          })
          .exec();

      if (existingEmployeeUser) {
        throw new ConflictException(
          'This employee already has a user account',
        );
      }

      // ==========================================
      // CHECK EMAIL MATCH
      // ==========================================

      if (
        employee.email
          .toLowerCase()
          .trim() !== email
      ) {
        throw new ConflictException(
          'User email must match employee email',
        );
      }

      employeeId =
        employee._id;
    } else {
      /*
       * Admin / HR users should not be linked
       * with an employee profile.
       */

      if (createData.employee) {
        throw new ConflictException(
          'Employee mapping is only allowed for employee role',
        );
      }

      if (
        createData.role !== 'admin' &&
        createData.role !== 'hr'
      ) {
        throw new ConflictException(
          'Only admin and hr users can be created from Add User',
        );
      }
    }

    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const hashedPassword =
      await bcrypt.hash(
        createData.password,
        10,
      );

    // ==========================================
    // CREATE USER
    // ==========================================

    const user =
      new this.userModel({
        firstName:
          createData.firstName,

        lastName:
          createData.lastName,

        email,

        password:
          hashedPassword,

        role:
          createData.role,

        status:
          createData.status,

        employee:
          employeeId,
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

  // ==========================================
  // GET ALL USERS
  // ==========================================

  async findAll() {
    return this.userModel
      .find()
      .select('-password')
      .populate(
        'employee',
        'firstName lastName email department designation status',
      )
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  // ==========================================
  // GET USER BY ID
  // ==========================================

  async findOne(id: string) {
    const user =
      await this.userModel
        .findById(id)
        .select('-password')
        .populate(
          'employee',
          'firstName lastName email department designation status',
        )
        .exec();

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return user;
  }

  // ==========================================
  // GET MY PROFILE
  // ==========================================

  async getMyProfile(
    user: {
      userId?: string;
    },
  ) {
    if (!user?.userId) {
      throw new NotFoundException(
        'Authenticated user not found',
      );
    }

    const currentUser =
      await this.userModel
        .findById(user.userId)
        .select('-password')
        .populate(
          'employee',
          'firstName lastName email department designation status',
        )
        .exec();

    if (!currentUser) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return currentUser;
  }

  // ==========================================
  // UPDATE MY PROFILE
  // ==========================================

  async updateMyProfile(
    user: {
      userId?: string;
    },
    updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
    },
  ) {
    if (!user?.userId) {
      throw new NotFoundException(
        'Authenticated user not found',
      );
    }

    const currentUser =
      await this.userModel
        .findById(user.userId)
        .exec();

    if (!currentUser) {
      throw new NotFoundException(
        'User not found',
      );
    }

    if (updateData.email) {
      const email =
        updateData.email
          .toLowerCase()
          .trim();

      const existingUser =
        await this.userModel.findOne({
          email,
          _id: {
            $ne: user.userId,
          },
        });

      if (existingUser) {
        throw new ConflictException(
          'User with this email already exists',
        );
      }

      currentUser.email = email;
    }

    if (
      updateData.firstName !==
      undefined
    ) {
      currentUser.firstName =
        updateData.firstName;
    }

    if (
      updateData.lastName !==
      undefined
    ) {
      currentUser.lastName =
        updateData.lastName;
    }

    const updatedUser =
      await currentUser.save();

    return {
      id: updatedUser._id,

      firstName:
        updatedUser.firstName,

      lastName:
        updatedUser.lastName,

      email:
        updatedUser.email,

      role:
        updatedUser.role,

      status:
        updatedUser.status,

      employee:
        updatedUser.employee,

      createdAt:
        updatedUser.createdAt,

      updatedAt:
        updatedUser.updatedAt,
    };
  }

  // ==========================================
  // CHANGE MY PASSWORD
  // ==========================================

  async changeMyPassword(
    user: {
      userId?: string;
    },
    changePasswordDto: ChangePasswordDto,
  ) {
    if (!user?.userId) {
      throw new NotFoundException(
        'Authenticated user not found',
      );
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = changePasswordDto;

    if (
      newPassword !==
      confirmPassword
    ) {
      throw new ConflictException(
        'New password and confirm password do not match',
      );
    }

    if (
      currentPassword ===
      newPassword
    ) {
      throw new ConflictException(
        'New password must be different from current password',
      );
    }

    const currentUser =
      await this.userModel
        .findById(user.userId)
        .exec();

    if (!currentUser) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const isPasswordValid =
      await bcrypt.compare(
        currentPassword,
        currentUser.password,
      );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Current password is incorrect',
      );
    }

    currentUser.password =
      await bcrypt.hash(
        newPassword,
        10,
      );

    await currentUser.save();

    return {
      success: true,
      message:
        'Password changed successfully',
    };
  }

  // ==========================================
  // UPDATE USER
  // ==========================================

  async update(
    id: string,
    updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      role?: string;
      status?: string;
      employee?: string;
    },
  ) {
    const user =
      await this.userModel
        .findById(id)
        .exec();

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    // ==========================================
    // EMAIL
    // ==========================================

    if (updateData.email) {
      const email =
        updateData.email
          .toLowerCase()
          .trim();

      const existingUser =
        await this.userModel.findOne({
          email,
          _id: {
            $ne: id,
          },
        });

      if (existingUser) {
        throw new ConflictException(
          'User with this email already exists',
        );
      }

      user.email = email;
    }

    // ==========================================
    // BASIC DETAILS
    // ==========================================

    if (
      updateData.firstName !==
      undefined
    ) {
      user.firstName =
        updateData.firstName;
    }

    if (
      updateData.lastName !==
      undefined
    ) {
      user.lastName =
        updateData.lastName;
    }

    // ==========================================
    // PASSWORD
    // ==========================================

    if (updateData.password) {
      user.password =
        await bcrypt.hash(
          updateData.password,
          10,
        );
    }

    // ==========================================
    // ROLE + EMPLOYEE MAPPING
    // ==========================================

    const newRole =
      updateData.role ??
      user.role;

    if (
      newRole === 'employee'
    ) {
      /*
       * Employee account should always have
       * an employee profile.
       */

      let employeeId =
        updateData.employee;

      if (!employeeId) {
        if (user.employee) {
          employeeId =
            user.employee.toString();
        } else {
          throw new ConflictException(
            'Employee account must be linked to an employee profile',
          );
        }
      }

      if (
        !Types.ObjectId.isValid(
          employeeId,
        )
      ) {
        throw new ConflictException(
          'Invalid employee ID',
        );
      }

      const employee =
        await this.employeeModel
          .findById(employeeId)
          .exec();

      if (!employee) {
        throw new NotFoundException(
          'Employee profile not found',
        );
      }

      if (
        employee.status !== 'active'
      ) {
        throw new ConflictException(
          'User can only be linked to an active employee',
        );
      }

      if (
        employee.email
          .toLowerCase()
          .trim() !==
        user.email
          .toLowerCase()
          .trim()
      ) {
        throw new ConflictException(
          'User email must match employee email',
        );
      }

      const existingEmployeeUser =
        await this.userModel
          .findOne({
            employee:
              employee._id,
            _id: {
              $ne: id,
            },
          })
          .exec();

      if (existingEmployeeUser) {
        throw new ConflictException(
          'This employee already has a user account',
        );
      }

      user.employee =
        employee._id;
    } else {
      if (updateData.employee) {
        throw new ConflictException(
          'Employee mapping is only allowed for employee role',
        );
      }

      user.employee = null;
    }

    if (
      newRole !== 'admin' &&
      newRole !== 'hr' &&
      newRole !== 'employee'
    ) {
      throw new ConflictException(
        'Invalid user role',
      );
    }

    user.role = newRole;

    // ==========================================
    // STATUS
    // ==========================================

    if (
      updateData.status !==
      undefined
    ) {
      user.status =
        updateData.status;
    }

    const updatedUser =
      await user.save();

    return {
      id: updatedUser._id,

      firstName:
        updatedUser.firstName,

      lastName:
        updatedUser.lastName,

      email:
        updatedUser.email,

      role:
        updatedUser.role,

      status:
        updatedUser.status,

      employee:
        updatedUser.employee,

      createdAt:
        updatedUser.createdAt,

      updatedAt:
        updatedUser.updatedAt,
    };
  }

  // ==========================================
  // ACTIVATE USER
  // ==========================================

  async activate(id: string) {
    const user =
      await this.userModel
        .findByIdAndUpdate(
          id,
          {
            status: 'active',
          },
          {
            new: true,
          },
        )
        .select('-password')
        .populate(
          'employee',
          'firstName lastName email department designation status',
        )
        .exec();

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return {
      message:
        'User activated successfully',

      data: user,
    };
  }

  // ==========================================
  // DEACTIVATE USER
  // ==========================================

  async deactivate(id: string) {
    const user =
      await this.userModel
        .findByIdAndUpdate(
          id,
          {
            status: 'inactive',
          },
          {
            new: true,
          },
        )
        .select('-password')
        .populate(
          'employee',
          'firstName lastName email department designation status',
        )
        .exec();

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return {
      message:
        'User deactivated successfully',

      data: user,
    };
  }
}

