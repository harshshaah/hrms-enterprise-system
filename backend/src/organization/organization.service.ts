import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Organization, OrganizationDocument, SubscriptionPlan, SubscriptionStatus } from './schemas/organization.schema';
import { Employee, EmployeeDocument } from '../employee/schemas/employee.schema';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<EmployeeDocument>,
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

  async getMySubscription(organizationId: string) {
    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    const org = await this.findById(organizationId);

    const activeEmployees = await this.employeeModel.countDocuments({
      organization: new Types.ObjectId(organizationId),
      status: 'active',
    });

    let daysRemaining = null;
    if (org.subscription?.trialEndsAt) {
      const diff = new Date(org.subscription.trialEndsAt).getTime() - Date.now();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } else if (org.subscription?.renewsAt) {
      const diff = new Date(org.subscription.renewsAt).getTime() - Date.now();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    const plans = [
      {
        id: SubscriptionPlan.FREE,
        name: 'Free Trial',
        badge: '14 Days',
        monthlyPrice: 0,
        yearlyPrice: 0,
        maxEmployees: 15,
        description: 'Complete trial experience for small teams exploring Zimyo HRMS.',
        features: [
          'Up to 15 Employees',
          'Standard Attendance & Shifts',
          'Live Clock In/Out Widget',
          'Standard Salary & Payslip generation',
          'Leave Requests & Approvals',
          'Community Support',
        ],
      },
      {
        id: SubscriptionPlan.STARTER,
        name: 'Starter',
        badge: 'Growing Teams',
        monthlyPrice: 1999,
        yearlyPrice: 19990,
        maxEmployees: 50,
        description: 'Comprehensive workforce management for up to 50 team members.',
        features: [
          'Up to 50 Employees',
          'Multiple Shift Schedules with Grace Buffer',
          'Automated Late-Mark Deductions',
          'Full Indian Statutory Payroll (EPF, ESIC, PT)',
          'Annual Leave Quotas (CL, SL, EL)',
          'Email Notifications & Payslip PDF Export',
          'Standard Email Support',
        ],
      },
      {
        id: SubscriptionPlan.GROWTH,
        name: 'Growth / Pro',
        badge: 'Most Popular',
        monthlyPrice: 4999,
        yearlyPrice: 49990,
        maxEmployees: 200,
        description: 'Ideal for scaling businesses needing multi-level approvals and compliance.',
        features: [
          'Up to 200 Employees',
          'Everything in Starter',
          'Custom Working Shifts & Half-day Auto Rules',
          'Multi-level Manager Leave Approval Flow',
          'Executive Attendance & Payroll Export (Excel/PDF)',
          'Encrypted Cloud Document Vault (Cloudinary)',
          'Priority WhatsApp & Phone Support',
        ],
      },
      {
        id: SubscriptionPlan.ENTERPRISE,
        name: 'Enterprise',
        badge: 'Unlimited Suite',
        monthlyPrice: 9999,
        yearlyPrice: 99990,
        maxEmployees: 1000,
        description: 'Custom capacity, white-labeling, and dedicated compliance advisor.',
        features: [
          'Up to 1,000+ Employees',
          'Everything in Pro',
          'Custom Branding & Organization Subdomain',
          'Biometric Device API Webhooks',
          'Dedicated Account Manager & 99.9% Uptime SLA',
          'Custom Form 16 / TDS Ledger Mapping',
        ],
      },
    ];

    return {
      organization: {
        id: org._id,
        name: org.name,
        slug: org.slug,
        email: org.email,
        phone: org.phone,
      },
      subscription: org.subscription,
      usage: {
        activeEmployees,
        maxEmployees: org.subscription?.maxEmployees || 15,
        percentageUsed: Math.min(
          100,
          Math.round((activeEmployees / (org.subscription?.maxEmployees || 15)) * 100),
        ),
        daysRemaining,
      },
      plans,
    };
  }

  async upgradeSubscription(
    organizationId: string,
    dto: { plan: string; billingCycle?: 'monthly' | 'yearly'; paymentMethod?: string },
  ) {
    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    const validPlans = ['starter', 'growth', 'enterprise'];
    if (!validPlans.includes(dto.plan)) {
      throw new BadRequestException('Invalid subscription plan selected');
    }

    const org = await this.findById(organizationId);

    let maxEmployees = 50;
    let price = 1999;

    if (dto.plan === 'growth') {
      maxEmployees = 200;
      price = dto.billingCycle === 'yearly' ? 49990 : 4999;
    } else if (dto.plan === 'enterprise') {
      maxEmployees = 1000;
      price = dto.billingCycle === 'yearly' ? 99990 : 9999;
    } else {
      price = dto.billingCycle === 'yearly' ? 19990 : 1999;
    }

    const renewDays = dto.billingCycle === 'yearly' ? 365 : 30;
    const renewsAt = new Date();
    renewsAt.setDate(renewsAt.getDate() + renewDays);

    org.subscription = {
      plan: dto.plan as SubscriptionPlan,
      status: SubscriptionStatus.ACTIVE,
      maxEmployees,
      trialEndsAt: undefined,
      renewsAt,
    };

    await org.save();

    const transactionId = `txn_zimyo_${Date.now()}`;

    return {
      success: true,
      message: `Successfully upgraded to ${dto.plan.toUpperCase()} Plan!`,
      subscription: org.subscription,
      invoice: {
        transactionId,
        plan: dto.plan,
        billingCycle: dto.billingCycle || 'monthly',
        amount: price,
        currency: 'INR',
        paymentMethod: dto.paymentMethod || 'Razorpay Gateway Simulation',
        date: new Date(),
        status: 'PAID',
      },
    };
  }
}

