import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Department,
  DepartmentDocument,
} from './schemas/department.schema';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
  ) {}

  async create(
    createDepartmentDto: CreateDepartmentDto,
    organizationId?: string,
  ) {
    const name =
      createDepartmentDto.name.trim();

    const code =
      createDepartmentDto.code
        .trim()
        .toUpperCase();

    const existingDepartment =
      await this.departmentModel
        .findOne({
          $or: [
            { name },
            { code },
          ],
        })
        .exec();

    if (existingDepartment) {
      if (
        existingDepartment.code === code
      ) {
        throw new ConflictException(
          'Department code already exists',
        );
      }

      throw new ConflictException(
        'Department name already exists',
      );
    }

    const department =
      new this.departmentModel({
        ...createDepartmentDto,
        name,
        code,
        status: 'active',
        organization: organizationId ? new Types.ObjectId(organizationId) : null,
      });

    return department.save();
  }

  async findAll(organizationId?: string) {
    const query = organizationId
      ? {
          $or: [
            { organization: new Types.ObjectId(organizationId) },
            { organization: null },
          ],
        }
      : {};

    return this.departmentModel
      .find(query)
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  async findOne(id: string) {
    const department =
      await this.departmentModel
        .findById(id)
        .exec();

    if (!department) {
      throw new NotFoundException(
        'Department not found',
      );
    }

    return department;
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ) {
    const department =
      await this.findOne(id);

    if (updateDepartmentDto.name) {
      const name =
        updateDepartmentDto.name.trim();

      const existingDepartment =
        await this.departmentModel
          .findOne({
            name,
            _id: {
              $ne: id,
            },
          })
          .exec();

      if (existingDepartment) {
        throw new ConflictException(
          'Department name already exists',
        );
      }

      updateDepartmentDto.name = name;
    }

    if (updateDepartmentDto.code) {
      const code =
        updateDepartmentDto.code
          .trim()
          .toUpperCase();

      const existingDepartment =
        await this.departmentModel
          .findOne({
            code,
            _id: {
              $ne: id,
            },
          })
          .exec();

      if (existingDepartment) {
        throw new ConflictException(
          'Department code already exists',
        );
      }

      updateDepartmentDto.code = code;
    }

    Object.assign(
      department,
      updateDepartmentDto,
    );

    return department.save();
  }

  async deactivate(id: string) {
    const department =
      await this.findOne(id);

    department.status = 'inactive';

    await department.save();

    return {
      message:
        'Department deactivated successfully',
      data: department,
    };
  }

  async activate(id: string) {
    const department =
      await this.findOne(id);

    department.status = 'active';

    await department.save();

    return {
      message:
        'Department activated successfully',
      data: department,
    };
  }
}