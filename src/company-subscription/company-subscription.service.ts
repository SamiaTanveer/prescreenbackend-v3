import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCompanySubscriptionDto } from './dto/create-company-subscription.dto';
import { UpdateCompanySubscriptionDto } from './dto/update-company-subscription.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { companySubscription } from './entities/company-subscription.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CompanySubscriptionService {
  constructor(
    @InjectModel('companySubscription')
    private readonly companySubscriptionModel: Model<companySubscription>,
    private readonly userService: UserService,
  ) {}
  async create(dto: CreateCompanySubscriptionDto) {
    // console.log('dto...', dto);
    // const currentDate = new Date();
    // if (dto.planCycle === 'monthly') {
    //   currentDate.setMonth(currentDate.getMonth() + 1);
    //   dto.subscriptionEndDate = currentDate;
    // } else if (dto.planCycle === 'quaterly') {
    //   currentDate.setMonth(currentDate.getMonth() + 3);
    //   dto.subscriptionEndDate = currentDate;
    // } else if (dto.planCycle === 'biannual') {
    //   currentDate.setMonth(currentDate.getMonth() + 6);
    //   dto.subscriptionEndDate = currentDate;
    // } else if (dto.planCycle === 'yearly') {
    //   currentDate.setFullYear(currentDate.getFullYear() + 1);
    //   dto.subscriptionEndDate = currentDate;
    // } else {
    //   throw new BadRequestException('Plan type is invalid');
    // }

    // dto.company = req.user.id;
    dto.subscriptionStartDate = new Date();
    const CompanySubscription = (
      await this.companySubscriptionModel.create(dto)
    ).populate({ path: 'SubscriptionPlan' });
    return CompanySubscription;
  }
  // async create(dto: CreateCompanySubscriptionDto) {
  //   const CompanySubscription = (
  //     await this.companySubscriptionModel.create(dto)
  //   ).populate({ path: 'SubscriptionPlan' });
  //   return CompanySubscription;
  // }

  async findPlansToRenew(reminderDate: Date) {
    return await this.companySubscriptionModel
      .find({
        subscriptionEndDate: { $gte: reminderDate },
      })
      .populate({ path: 'company' });
  }

  async findPlansWithExpiredDeadlines(currentTime: Date) {
    return await this.companySubscriptionModel
      .find({
        subscriptionEndDate: { $lt: currentTime },
      })
      .populate({ path: 'company' });
  }

  async closePlans(compSubId: string) {
    // console.log('compSubId', compSubId);
    return this.companySubscriptionModel.findByIdAndUpdate(
      compSubId,
      { subscriptionStatus: 'expired' },
      { new: true },
    );
  }

  async findAll() {
    return this.companySubscriptionModel.find().populate({
      path: 'company SubscriptionPlan',
      select: 'name email isBlocked planTitle',
    });
  }

  async findOne(id: string) {
    const subFound = await this.companySubscriptionModel
      .findById(id)
      .populate({
        path: 'company',
        select: 'company featuresUsed isBlocked',
        populate: { path: 'company' },
      })
      .populate({ path: 'SubscriptionPlan' });

    if (!subFound) {
      throw new NotFoundException('Subscription not found');
    }
    return subFound;
  }

  async find(userid: string) {
    const isFound = await this.companySubscriptionModel
      .findOne({ company: userid })
      .populate({ path: 'SubscriptionPlan' });

    if (!isFound) {
      throw new BadRequestException('company subscription plan not found');
    }

    return isFound;
  }
  async findSingleSubPlan(userid: string) {
    const isFound = await this.companySubscriptionModel
      .findOne({ company: userid })
      .populate({ path: 'SubscriptionPlan' });

    // if (!isFound) {
    //   throw new BadRequestException('company subscription plan not found');
    // }

    return isFound;
  }

  async update(planId: string, dto: UpdateCompanySubscriptionDto) {
    dto.subscriptionStartDate = new Date();
    const currentDate = new Date();
    if (dto.planCycle === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
      dto.subscriptionEndDate = currentDate;
    } else if (dto.planCycle === 'quaterly') {
      currentDate.setMonth(currentDate.getMonth() + 3);
      dto.subscriptionEndDate = currentDate;
    } else if (dto.planCycle === 'biannual') {
      currentDate.setMonth(currentDate.getMonth() + 6);
      dto.subscriptionEndDate = currentDate;
    } else if (dto.planCycle === 'yearly') {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
      dto.subscriptionEndDate = currentDate;
    } else {
      throw new BadRequestException('Plan type is invalid');
    }

    const isUpdated = await this.companySubscriptionModel
      .findByIdAndUpdate(planId, dto, { new: true })
      .exec();

    if (!isUpdated) {
      throw new BadRequestException('invalid id or something');
    }

    if (dto.intentId && isUpdated.paymentIntentIds) {
      isUpdated.paymentIntentIds.push(dto.intentId);
      await isUpdated.save();
    }

    // console.log('isUpdated', isUpdated);
    return isUpdated;
  }

  async updateStatus(id: string, action: string) {
    console.log(id);
    const planFound = await this.companySubscriptionModel
      .findById(id)
      .populate({ path: 'SubscriptionPlan' });

    if (!planFound) {
      throw new NotFoundException('Plan not found');
    }

    // Check plan expiry date
    const currentDate = new Date();
    // currentDate.setHours(0, 0, 0, 0); // Set time to midnight

    const subscriptionEndDate = planFound.subscriptionEndDate;
    if (!subscriptionEndDate) {
      throw new BadRequestException('SubscriptionPlan has no end date');
    }
    if (planFound.SubscriptionPlan.pricing[0].price == 0) {
      throw new BadRequestException('Cannot update status of free Plan.');
    }

    // console.log(currentDate);
    // console.log(subscriptionEndDate);

    const planEndDate = new Date(subscriptionEndDate);
    // planEndDate.setHours(0, 0, 0, 0); // Set time to midnight

    if (planEndDate <= currentDate) {
      throw new ConflictException(
        'This Plan has expired, so the status cannot be changed.',
      );
    }

    const updatedPlan = await this.companySubscriptionModel.findByIdAndUpdate(
      id,
      { subscriptionStatus: action },
      { new: true },
    );

    if (!updatedPlan) {
      throw new NotFoundException('Plan failed to update');
    }

    // console.log(updatedPlan.subscriptionStatus);
    return updatedPlan;
  }

  // async updateStatus(id: string, action: string) {
  //   const planFound = await this.companySubscriptionModel.findByIdAndUpdate(id);
  //   if (!planFound) {
  //     throw new NotFoundException('Plan not found');
  //   }

  //   // Check plan expiry date
  //   const currentDate = new Date();
  //   console.log(currentDate);
  //   console.log(planFound.subscriptionEndDate);
  //   if (planFound.subscriptionEndDate == currentDate) {
  //     throw new ConflictException(
  //       'This Plan has been expired So cannot change status',
  //     );
  //   }
  //   console.log(action);
  //   const updatedPlan = await this.companySubscriptionModel.findByIdAndUpdate(
  //     id,
  //     { subscriptionStatus: action },
  //   );
  //   if (!updatedPlan) {
  //     throw new NotFoundException('Plan fail to update');
  //   }

  //   console.log(updatedPlan);
  //   return updatedPlan;
  // }

  async remove(id: string) {
    return this.companySubscriptionModel.findByIdAndRemove(id).exec();
  }
}
