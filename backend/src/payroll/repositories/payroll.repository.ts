import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Payroll,
  PayrollDocument,
  PayrollStatus,
} from '../schemas/payroll.schema';

@Injectable()
export class PayrollRepository {
  constructor(
    @InjectModel(Payroll.name)
    private readonly payrollModel: Model<PayrollDocument>,
  ) {}

  async create(data: Partial<Payroll>) {
    const payroll =
      new this.payrollModel(data);

    return payroll.save();
  }

  async findAll(
    filters?: {
      month?: number;
      year?: number;
      status?: PayrollStatus;
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      organizationId?: string;
    },
  ) {
    const query: any = {};

    if (filters?.organizationId) {
      query.$or = [
        { organization: new Types.ObjectId(filters.organizationId) },
        { organization: null },
      ];
    }

    if (filters?.month !== undefined) {
      query.month = filters.month;
    }

    if (filters?.year !== undefined) {
      query.year = filters.year;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    const page =
      filters?.page && filters.page > 0
        ? filters.page
        : 1;

    const limit =
      filters?.limit && filters.limit > 0
        ? filters.limit
        : 10;

    const skip =
      (page - 1) * limit;

    if (
      filters?.search &&
      filters.search.trim()
    ) {
      const search =
        filters.search.trim();

      const matchingEmployees =
        await this.payrollModel.db
          .collection('employees')
          .find({
            $or: [
              {
                firstName: {
                  $regex: search,
                  $options: 'i',
                },
              },
              {
                lastName: {
                  $regex: search,
                  $options: 'i',
                },
              },
              {
                email: {
                  $regex: search,
                  $options: 'i',
                },
              },
            ],
          })
          .project({
            _id: 1,
          })
          .toArray();

      const employeeIds =
        matchingEmployees.map(
          (employee) => employee._id,
        );

      query.employee = {
        $in: employeeIds,
      };
    }

    const sortBy =
      filters?.sortBy || 'createdAt';

    const sortOrder =
      filters?.sortOrder === 'asc'
        ? 1
        : -1;

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder,
    };

    const [
      data,
      total,
    ] = await Promise.all([
      this.payrollModel
        .find(query)
        .populate(
          'employee',
          'firstName lastName email designation department',
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),

      this.payrollModel.countDocuments(
        query,
      ),
    ]);

    const totalPages =
      Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPreviousPage:
          page > 1,
      },
    };
  }

  async findById(id: string) {
    return this.payrollModel
      .findById(id)
      .populate(
        'employee',
        'firstName lastName email designation department',
      )
      .exec();
  }

  async findByEmployeeAndMonth(
    employee: string,
    month: number,
    year: number,
  ) {
    return this.payrollModel
      .findOne({
        employee,
        month,
        year,
      })
      .exec();
  }

  async update(
    id: string,
    data: Partial<Payroll>,
  ) {
    return this.payrollModel
      .findByIdAndUpdate(
        id,
        data,
        {
          new: true,
          runValidators: true,
        },
      )
      .populate(
        'employee',
        'firstName lastName email designation department',
      )
      .exec();
  }

  async delete(id: string) {
    return this.payrollModel
      .findByIdAndDelete(id)
      .exec();
  }

  async findByStatus(
    status: PayrollStatus,
  ) {
    return this.payrollModel
      .find({
        status,
      })
      .populate(
        'employee',
        'firstName lastName email designation department',
      )
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  async getPayrollStats() {
    const [
      total,
      pending,
      paid,
      cancelled,
    ] = await Promise.all([
      this.payrollModel.countDocuments(),

      this.payrollModel.countDocuments({
        status: PayrollStatus.PENDING,
      }),

      this.payrollModel.countDocuments({
        status: PayrollStatus.PAID,
      }),

      this.payrollModel.countDocuments({
        status: PayrollStatus.CANCELLED,
      }),
    ]);

    return {
      total,
      pending,
      paid,
      cancelled,
    };
  }
}