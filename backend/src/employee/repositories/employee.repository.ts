import {
  Injectable,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/mongoose';

import {
  Model,
  Types,
} from 'mongoose';

import {
  Employee,
  EmployeeDocument,
} from '../schemas/employee.schema';

@Injectable()
export class EmployeeRepository {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel:
      Model<EmployeeDocument>,
  ) {}

  // ==========================================
  // CREATE EMPLOYEE
  // ==========================================

  async create(
    employeeData: Partial<Employee>,
  ): Promise<EmployeeDocument> {
    const employee =
      new this.employeeModel(
        employeeData,
      );

    return employee.save();
  }

  // ==========================================
  // FIND EMPLOYEE BY EMAIL
  // ==========================================

  async findByEmail(
    email: string,
  ): Promise<EmployeeDocument | null> {
    return this.employeeModel
      .findOne({
        email: email.toLowerCase().trim(),
      })
      .populate(
        'department',
        'name code description status',
      )
      .exec();
  }

  // ==========================================
  // FIND ALL EMPLOYEES
  // ==========================================

  async findAll(organizationId?: string): Promise<EmployeeDocument[]> {
    const filter = organizationId
      ? {
          $or: [
            { organization: new Types.ObjectId(organizationId) },
            { organization: null },
          ],
        }
      : {};

    return this.employeeModel
      .find(filter)
      .populate(
        'department',
        'name code description status',
      )
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  // ==========================================
  // FIND EMPLOYEE BY ID
  // ==========================================

  async findById(
    id: string,
  ): Promise<EmployeeDocument | null> {
    return this.employeeModel
      .findById(id)
      .populate(
        'department',
        'name code description status',
      )
      .exec();
  }

  // ==========================================
  // UPDATE EMPLOYEE
  // ==========================================

  async updateById(
    id: string,
    employeeData: Partial<Employee>,
  ): Promise<EmployeeDocument | null> {
    return this.employeeModel
      .findByIdAndUpdate(
        id,
        employeeData,
        {
          new: true,
          runValidators: true,
        },
      )
      .populate(
        'department',
        'name code description status',
      )
      .exec();
  }

  // ==========================================
  // DELETE EMPLOYEE BY ID
  // ==========================================

  async deleteById(
    id: string,
  ): Promise<EmployeeDocument | null> {
    return this.employeeModel
      .findByIdAndDelete(id)
      .exec();
  }

  // ==========================================
  // DEACTIVATE EMPLOYEE
  // ==========================================

  async deactivateById(
    id: string,
  ): Promise<EmployeeDocument | null> {
    return this.employeeModel
      .findByIdAndUpdate(
        id,
        {
          status: 'inactive',
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .populate(
        'department',
        'name code description status',
      )
      .exec();
  }

  // ==========================================
  // ACTIVATE EMPLOYEE
  // ==========================================

  async activateById(
    id: string,
  ): Promise<EmployeeDocument | null> {
    return this.employeeModel
      .findByIdAndUpdate(
        id,
        {
          status: 'active',
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .populate(
        'department',
        'name code description status',
      )
      .exec();
  }
}