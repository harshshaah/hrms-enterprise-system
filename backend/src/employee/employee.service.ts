import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
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
  Department,
  DepartmentDocument,
} from '../department/schemas/department.schema';

import {
  User,
  UserDocument,
} from '../user/schemas/user.schema';

import {
  Employee,
} from './schemas/employee.schema';

import {
  CreateEmployeeDto,
} from './dto/create-employee.dto';

import {
  UpdateEmployeeDto,
} from './dto/update-employee.dto';

import {
  EmployeeRepository,
} from './repositories/employee.repository';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly employeeRepository:
      EmployeeRepository,

    @InjectModel(Department.name)
    private readonly departmentModel:
      Model<DepartmentDocument>,

    @InjectModel(User.name)
    private readonly userModel:
      Model<UserDocument>,
  ) {}

  // ==========================================
  // VALIDATE DEPARTMENT
  // ==========================================

  private async validateDepartment(
    departmentId: string,
  ) {
    if (
      !Types.ObjectId.isValid(
        departmentId,
      )
    ) {
      throw new BadRequestException(
        'Invalid department ID',
      );
    }

    const department =
      await this.departmentModel
        .findById(departmentId)
        .exec();

    if (!department) {
      throw new NotFoundException(
        'Department not found',
      );
    }

    if (
      department.status !== 'active'
    ) {
      throw new ConflictException(
        'Cannot assign an inactive department',
      );
    }

    return new Types.ObjectId(
      departmentId,
    );
  }

  // ==========================================
  // CREATE EMPLOYEE
  // ==========================================

  async create(
    createEmployeeDto: CreateEmployeeDto,
  ) {
    const email =
      createEmployeeDto.email
        .toLowerCase()
        .trim();

    // ------------------------------------------
    // CHECK EXISTING EMPLOYEE
    // ------------------------------------------

    const existingEmployee =
      await this.employeeRepository.findByEmail(
        email,
      );

    if (existingEmployee) {
      throw new ConflictException(
        'Employee with this email already exists',
      );
    }

    // ------------------------------------------
    // VALIDATE DEPARTMENT
    // ------------------------------------------

    const department =
      await this.validateDepartment(
        createEmployeeDto.department,
      );

    // ------------------------------------------
    // LOGIN ACCOUNT VALIDATION
    // ------------------------------------------

    if (
      createEmployeeDto.createLoginAccount
    ) {
      if (
        !createEmployeeDto.loginPassword
      ) {
        throw new BadRequestException(
          'Login password is required when creating a login account',
        );
      }

      const existingUser =
        await this.userModel
          .findOne({
            email,
          })
          .exec();

      if (existingUser) {
        throw new ConflictException(
          'A user account with this email already exists',
        );
      }
    }

    // ------------------------------------------
    // EMPLOYEE DATA
    // ------------------------------------------

    const employeeData = {
      ...createEmployeeDto,

      email,

      department,

      dateOfBirth:
        createEmployeeDto.dateOfBirth
          ? new Date(
              createEmployeeDto.dateOfBirth,
            )
          : undefined,

      joiningDate:
        new Date(
          createEmployeeDto.joiningDate,
        ),
    };

    // These fields belong to login account,
    // not Employee document.
    delete employeeData.createLoginAccount;
    delete employeeData.loginPassword;

    // ------------------------------------------
    // CREATE EMPLOYEE
    // ------------------------------------------

    const employee =
      await this.employeeRepository.create(
        employeeData,
      );

    // ------------------------------------------
    // CREATE LOGIN ACCOUNT
    // ------------------------------------------

    if (
      createEmployeeDto.createLoginAccount
    ) {
      try {
        const hashedPassword =
          await bcrypt.hash(
            createEmployeeDto.loginPassword!,
            10,
          );

        await this.userModel.create({
          firstName:
            employee.firstName,

          lastName:
            employee.lastName,

          email:
            employee.email,

          password:
            hashedPassword,

          role: 'employee',

          status:
            employee.status ===
            'inactive'
              ? 'inactive'
              : 'active',

          employee:
            employee._id,
        });
      } catch (error) {
        // --------------------------------------
        // ROLLBACK EMPLOYEE
        // --------------------------------------

        await this.employeeRepository.deleteById(
          employee._id.toString(),
        );

        throw error;
      }
    }

    return employee;
  }

  // ==========================================
  // GET ALL EMPLOYEES
  // ==========================================

  async findAll() {
    return this.employeeRepository.findAll();
  }

  // ==========================================
  // GET EMPLOYEE BY ID
  // ==========================================

  async findById(
    id: string,
  ) {
    const employee =
      await this.employeeRepository.findById(
        id,
      );

    if (!employee) {
      throw new NotFoundException(
        'Employee not found',
      );
    }

    return employee;
  }

  // ==========================================
  // UPDATE EMPLOYEE
  // ==========================================

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ) {
    const existingEmployee =
      await this.employeeRepository.findById(
        id,
      );

    if (!existingEmployee) {
      throw new NotFoundException(
        'Employee not found',
      );
    }

    if (updateEmployeeDto.email) {
      const email =
        updateEmployeeDto.email
          .toLowerCase()
          .trim();

      const employeeWithEmail =
        await this.employeeRepository.findByEmail(
          email,
        );

      if (
        employeeWithEmail &&
        employeeWithEmail._id.toString() !== id
      ) {
        throw new ConflictException(
          'Employee with this email already exists',
        );
      }

      updateEmployeeDto.email =
        email;
    }

    let department:
      | Types.ObjectId
      | undefined;

    if (
      updateEmployeeDto.department
    ) {
      department =
        await this.validateDepartment(
          updateEmployeeDto.department,
        );
    }

    const employeeData:
      Partial<Employee> = {
      ...updateEmployeeDto,

      dateOfBirth:
        updateEmployeeDto.dateOfBirth
          ? new Date(
              updateEmployeeDto.dateOfBirth,
            )
          : undefined,

      joiningDate:
        updateEmployeeDto.joiningDate
          ? new Date(
              updateEmployeeDto.joiningDate,
            )
          : undefined,

      department,
    };

    return this.employeeRepository.updateById(
      id,
      employeeData,
    );
  }

  // ==========================================
  // MY PROFILE
  // ==========================================

  async getMyProfile(
    user: {
      email?: string;
    },
  ) {
    if (!user?.email) {
      throw new BadRequestException(
        'User email not found in authentication token',
      );
    }

    const employee =
      await this.employeeRepository.findByEmail(
        user.email,
      );

    if (!employee) {
      throw new NotFoundException(
        'Employee profile not found for this user',
      );
    }

    return employee;
  }

  // ==========================================
  // UPDATE MY PROFILE
  // ==========================================

  async updateMyProfile(
    user: {
      email?: string;
    },
    updateEmployeeDto: UpdateEmployeeDto,
  ) {
    if (!user?.email) {
      throw new BadRequestException(
        'User email not found in authentication token',
      );
    }

    const employee =
      await this.employeeRepository.findByEmail(
        user.email,
      );

    if (!employee) {
      throw new NotFoundException(
        'Employee profile not found for this user',
      );
    }

    const profileData:
      Partial<Employee> = {};

    if (
      updateEmployeeDto.firstName !==
      undefined
    ) {
      profileData.firstName =
        updateEmployeeDto.firstName;
    }

    if (
      updateEmployeeDto.lastName !==
      undefined
    ) {
      profileData.lastName =
        updateEmployeeDto.lastName;
    }

    if (
      updateEmployeeDto.dateOfBirth !==
      undefined
    ) {
      profileData.dateOfBirth =
        new Date(
          updateEmployeeDto.dateOfBirth,
        );
    }

    if (
      updateEmployeeDto.gender !==
      undefined
    ) {
      profileData.gender =
        updateEmployeeDto.gender;
    }

    if (
      updateEmployeeDto.phone !==
      undefined
    ) {
      profileData.phone =
        updateEmployeeDto.phone;
    }

    if (
      updateEmployeeDto.address !==
      undefined
    ) {
      profileData.address =
        updateEmployeeDto.address;
    }

    if (
      updateEmployeeDto.city !==
      undefined
    ) {
      profileData.city =
        updateEmployeeDto.city;
    }

    if (
      updateEmployeeDto.state !==
      undefined
    ) {
      profileData.state =
        updateEmployeeDto.state;
    }

    if (
      updateEmployeeDto.profilePhoto !==
      undefined
    ) {
      profileData.profilePhoto =
        updateEmployeeDto.profilePhoto;
    }

    return this.employeeRepository.updateById(
      employee._id.toString(),
      profileData,
    );
  }

  // ==========================================
  // DEACTIVATE
  // ==========================================

  async deactivate(
    id: string,
  ) {
    const existingEmployee =
      await this.employeeRepository.findById(
        id,
      );

    if (!existingEmployee) {
      throw new NotFoundException(
        'Employee not found',
      );
    }

    if (
      existingEmployee.status ===
      'inactive'
    ) {
      throw new ConflictException(
        'Employee is already inactive',
      );
    }

    return this.employeeRepository.deactivateById(
      id,
    );
  }

  // ==========================================
  // ACTIVATE
  // ==========================================

  async activate(
    id: string,
  ) {
    const existingEmployee =
      await this.employeeRepository.findById(
        id,
      );

    if (!existingEmployee) {
      throw new NotFoundException(
        'Employee not found',
      );
    }

    if (
      existingEmployee.status ===
      'active'
    ) {
      throw new ConflictException(
        'Employee is already active',
      );
    }

    return this.employeeRepository.activateById(
      id,
    );
  }
}