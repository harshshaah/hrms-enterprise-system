import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationDocument, SubscriptionPlan, SubscriptionStatus } from './schemas/organization.schema';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private readonly orgModel: Model<OrganizationDocument>,
  ) {}

  async create(createDto: CreateOrganizationDto) {
    const slug = createDto.slug.toLowerCase().trim();
    const existing = await this.orgModel.findOne({ slug }).exec();
    if (existing) {
      throw new ConflictException('An organization with this slug / URL already exists');
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14-day free trial

    const org = new this.orgModel({
      ...createDto,
      slug,
      subscription: {
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.TRIAL,
        maxEmployees: 15,
        trialEndsAt,
      },
      status: 'active',
    });

    return org.save();
  }

  async findAll() {
    return this.orgModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    const org = await this.orgModel.findById(id).exec();
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async findBySlug(slug: string) {
    const org = await this.orgModel.findOne({ slug: slug.toLowerCase().trim() }).exec();
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async update(id: string, updateDto: UpdateOrganizationDto) {
    const org = await this.orgModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }
}

