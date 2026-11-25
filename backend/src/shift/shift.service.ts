import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shift, ShiftDocument } from './schemas/shift.schema';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftService {
  constructor(
    @InjectModel(Shift.name)
    private readonly shiftModel: Model<ShiftDocument>,
  ) {}

  async create(createShiftDto: CreateShiftDto, organizationId: string): Promise<ShiftDocument> {
    const orgId = new Types.ObjectId(organizationId);
    const code = createShiftDto.code.toUpperCase().trim();

    const existing = await this.shiftModel.findOne({ organization: orgId, code }).exec();
    if (existing) {
      throw new ConflictException(`Shift with code ${code} already exists in your organization`);
    }

    if (createShiftDto.isDefault) {
      await this.shiftModel.updateMany({ organization: orgId }, { isDefault: false }).exec();
    }

    const shift = new this.shiftModel({
      ...createShiftDto,
      code,
      organization: orgId,
    });

    return shift.save();
  }

  async findAll(organizationId?: string): Promise<ShiftDocument[]> {
    const filter: any = {};
    if (organizationId) {
      filter.organization = new Types.ObjectId(organizationId);
    }
    return this.shiftModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, organizationId?: string): Promise<ShiftDocument> {
    const filter: any = { _id: new Types.ObjectId(id) };
    if (organizationId) {
      filter.organization = new Types.ObjectId(organizationId);
    }

    const shift = await this.shiftModel.findOne(filter).exec();
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }
    return shift;
  }

  async findDefaultOrFirst(organizationId: string): Promise<ShiftDocument | null> {
    const orgId = new Types.ObjectId(organizationId);
    let shift = await this.shiftModel.findOne({ organization: orgId, isDefault: true, status: 'active' }).exec();
    if (!shift) {
      shift = await this.shiftModel.findOne({ organization: orgId, status: 'active' }).exec();
    }
    return shift;
  }

  async update(id: string, updateShiftDto: UpdateShiftDto, organizationId?: string): Promise<ShiftDocument> {
    const filter: any = { _id: new Types.ObjectId(id) };
    if (organizationId) {
      filter.organization = new Types.ObjectId(organizationId);
    }

    if (updateShiftDto.isDefault && organizationId) {
      await this.shiftModel.updateMany({ organization: new Types.ObjectId(organizationId) }, { isDefault: false }).exec();
    }

    const updated = await this.shiftModel
      .findOneAndUpdate(filter, { $set: updateShiftDto }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Shift not found');
    }
    return updated;
  }

  async remove(id: string, organizationId?: string): Promise<{ deleted: boolean }> {
    const filter: any = { _id: new Types.ObjectId(id) };
    if (organizationId) {
      filter.organization = new Types.ObjectId(organizationId);
    }

    const res = await this.shiftModel.deleteOne(filter).exec();
    if (res.deletedCount === 0) {
      throw new NotFoundException('Shift not found');
    }
    return { deleted: true };
  }
}

