import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { Discount } from './entities/discount.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  CreateLimitedDiscountDto,
  CreateCouponDto,
  CreateNormalDiscountDto,
} from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import {
  PricingEntity,
  SubscriptionPlan,
} from 'src/subscription-plan/entities/subscription-plan.entity';
import { CouponDiscountDto } from 'src/subscription-plan/dto/create-subscription-plan.dto';
// import { User } from 'src/user/entities/user.schema';

@Injectable()
export class DiscountService {
  constructor(
    @InjectModel('Discount')
    private readonly discountModel: Model<Discount>,
    @InjectModel('SubscriptionPlan')
    private readonly planModel: Model<SubscriptionPlan>,
    // @InjectModel('User')
    // private readonly userModel: Model<User>,
  ) {}
  async createLimitedDiscount(dto: CreateLimitedDiscountDto) {
    const {
      start_date,
      end_date,
      SubscriptionPlan,
      // type,
      percentage,
      max_users,
      // couponCode,
    } = dto;
    // console.log(dto);
    const existingDiscount = await this.discountModel.findOne({
      percentage,
      type: 'limited',
    });

    if (existingDiscount) {
      throw new BadRequestException(
        `A Limited discount with percentage ${percentage} already exists.`,
      );
    }

    // start date cannot be before current date
    if (start_date < new Date()) {
      throw new BadRequestException(
        'Start date cannot be before the current date',
      );
    }

    // end date cannot be before start date
    if (end_date <= start_date) {
      throw new BadRequestException('End date must be after the start date');
    }

    const createdGeneralDiscount = await this.discountModel.create({
      percentage,
      start_date,
      end_date,
      type: 'limited',
      // couponCode,
      max_users,
      SubscriptionPlan,
    });

    if (!createdGeneralDiscount) {
      throw new BadRequestException('Unable to create discount');
    }

    return createdGeneralDiscount;
  }

  async createDiiscount(dto: CreateNormalDiscountDto[]) {
    const createdDiscounts = await this.discountModel.insertMany(dto);

    if (!createdDiscounts) {
      throw new BadRequestException('cannot create discounts');
    }
    // console.log('created discounts....', createdDiscounts);
    return createdDiscounts;
  }
  async createCoupon(dto: CreateCouponDto) {
    const {
      SubscriptionPlan,
      couponCode,
      end_date,
      max_users,
      percentage,
      start_date,
      assignedCompanyUsers,
    } = dto;
    const oldCoupon = await this.discountModel.findOne({
      couponCode,
    });
    if (oldCoupon) {
      throw new ConflictException(
        `The Coupon Code ${couponCode} already exists`,
      );
    }

    // start date cannot be before current date
    if (start_date < new Date()) {
      throw new BadRequestException(
        'Start date cannot be before the current date',
      );
    }

    // end date cannot be before start date
    if (end_date <= start_date) {
      throw new BadRequestException('End date must be after the start date');
    }
    const createdGeneralDiscount = await this.discountModel.create({
      percentage,
      start_date,
      end_date,
      type: 'Coupon',
      SubscriptionPlan,
      couponCode,
      max_users,
    });
    if (
      createdGeneralDiscount &&
      assignedCompanyUsers &&
      Array.isArray(assignedCompanyUsers)
    ) {
      createdGeneralDiscount.assignedCompanyUsers = assignedCompanyUsers;
      await createdGeneralDiscount.save();

      return createdGeneralDiscount;
    }
    return null;
  }
  async createCoupons(dtoArr: CreateCouponDto[]) {
    const couponsToCreate = [];
    // Validate and prepare coupon objects
    for (const dto of dtoArr) {
      const {
        start_date,
        end_date,
        percentage,
        SubscriptionPlan,
        cycleName,
        couponCode,
        max_users,
        assignedCompanyUsers,
      } = dto;

      // const oldCoupon = await this.discountModel.findOne({ couponCode });
      // if (oldCoupon) {
      //   throw new ConflictException(
      //     `The Coupon Code ${couponCode} already exists`,
      //   );
      // }

      // if (start_date < new Date()) {
      //   throw new BadRequestException(
      //     'Start date cannot be before the current date',
      //   );
      // }

      // if (end_date <= start_date) {
      //   throw new BadRequestException('End date must be after the start date');
      // }

      couponsToCreate.push({
        percentage,
        start_date,
        end_date,
        type: 'Coupon',
        SubscriptionPlan,
        couponCode,
        cycleName,
        max_users,
        assignedCompanyUsers: Array.isArray(assignedCompanyUsers)
          ? assignedCompanyUsers
          : [],
      });
    }

    // Create coupons if no validation error occurred
    if (couponsToCreate.length > 0) {
      const createdCoupons =
        await this.discountModel.insertMany(couponsToCreate);

      // console.log('created coupons.....', createdCoupons);
      return createdCoupons;
    }

    return [];
  }

  async checkUniqueCouponsCodes(dtoArr: CouponDiscountDto[]) {
    for (const dto of dtoArr) {
      const { start_date, end_date, couponCode } = dto;

      const oldCoupon = await this.discountModel.findOne({ couponCode });
      if (oldCoupon) {
        throw new ConflictException(
          `The Coupon Code ${couponCode} already exists`,
        );
      }

      if (start_date < new Date()) {
        throw new BadRequestException(
          'Start date cannot be before the current date',
        );
      }

      if (end_date <= start_date) {
        throw new BadRequestException('End date must be after the start date');
      }
    }
  }

  async findAllCoupons() {
    return this.discountModel.find({ type: 'Coupon' }).populate({
      path: 'assignedCompanyUsers',
      select: 'name email userType isEmailVerified subscriptionPlan',
      populate: {
        path: 'subscriptionPlan',
        select:
          'company subscriptionEndDate subscriptionStartDate subscriptionStatus featuresUsed',
        populate: {
          path: 'SubscriptionPlan',
          select: 'planTitle description featuresAllowed',
        },
      },
    });
  }
  async findSpecificCoupons(planid: string) {
    return this.discountModel.find({
      type: 'Coupon',
      SubscriptionPlan: planid,
    });
    // .populate({
    //   path: 'assignedCompanyUsers',
    //   select: 'name email userType isEmailVerified subscriptionPlan',
    //   populate: {
    //     path: 'subscriptionPlan',
    //     select:
    //       'company subscriptionEndDate subscriptionStartDate subscriptionStatus featuresUsed',
    //     populate: {
    //       path: 'SubscriptionPlan',
    //       select: 'planTitle description featuresAllowed',
    //     },
    //   },
    // });
  }
  async findAllLimited() {
    return this.discountModel.find({ type: 'limited' }).populate({
      path: 'assignedCompanyUsers',
      select: 'name email userType isEmailVerified subscriptionPlan',
      populate: {
        path: 'subscriptionPlan',
        select:
          'company subscriptionEndDate subscriptionStartDate subscriptionStatus featuresUsed',
        populate: {
          path: 'SubscriptionPlan',
          select: 'planTitle description featuresAllowed',
        },
      },
    });
  }
  async findAllNormal() {
    return this.discountModel.find({ type: 'Discount' }).populate({
      path: 'assignedCompanyUsers',
      select: 'name email userType isEmailVerified subscriptionPlan',
      populate: {
        path: 'subscriptionPlan',
        select:
          'company subscriptionEndDate subscriptionStartDate subscriptionStatus featuresUsed',
        populate: {
          path: 'SubscriptionPlan',
          select: 'planTitle description featuresAllowed',
        },
      },
    });
  }
  async findAll() {
    return this.discountModel.find().populate({
      path: 'assignedCompanyUsers',
      select: 'name email userType isEmailVerified subscriptionPlan',
      populate: {
        path: 'subscriptionPlan',
        select:
          'company subscriptionEndDate subscriptionStartDate subscriptionStatus featuresUsed',
        populate: {
          path: 'SubscriptionPlan',
          select: 'planTitle description featuresAllowed',
        },
      },
    });
  }
  async findDiscountsByPlan(planid: string) {
    return this.discountModel.find({ SubscriptionPlan: planid }).populate({
      path: 'assignedCompanyUsers',
      select: 'name email userType isEmailVerified subscriptionPlan',
      populate: {
        path: 'subscriptionPlan',
        select:
          'company subscriptionEndDate subscriptionStartDate subscriptionStatus featuresUsed',
        populate: {
          path: 'SubscriptionPlan',
          select: 'planTitle description featuresAllowed',
        },
      },
    });
  }

  async findOne(id: string) {
    const discountFound = await this.discountModel.findById(id).populate({
      path: 'assignedCompanyUsers',
      select: 'name email userType isEmailVerified subscriptionPlan',
      populate: {
        path: 'subscriptionPlan',
        populate: {
          path: 'SubscriptionPlan',
          select: 'planTitle description featuresAllowed',
        },
      },
    });

    if (!discountFound) {
      throw new NotFoundException('No Discount found');
    }
    return discountFound;
  }

  async findDiscount(id: string, cycleName: string) {
    console.log(id, cycleName);
    const discountFound = await this.discountModel.findOne({
      _id: id,
      cycleName,
    });
    // .populate({
    //   path: 'assignedCompanyUsers',
    //   select: 'name email userType isEmailVerified subscriptionPlan',
    //   populate: {
    //     path: 'subscriptionPlan',
    //     populate: {
    //       path: 'SubscriptionPlan',
    //       select: 'planTitle description featuresAllowed',
    //     },
    //   },
    // });

    if (!discountFound) {
      throw new NotFoundException('No Discount found');
    }
    return discountFound;
  }

  async update(discountFound: any, dto: UpdateDiscountDto) {
    // if it is coupon
    if (
      discountFound.type === 'Coupon' &&
      Array.isArray(dto.assignedCompanyUsers) &&
      dto.assignedCompanyUsers.length > 0
    ) {
      console.log('inside company users');
      // getting ids from dto.assignedCompanyUsers and update the discountFound doc
      const allAssignedUsers = [
        ...dto.assignedCompanyUsers,
        ...discountFound.assignedCompanyUsers.map((user: any) =>
          user._id.toString(),
        ),
      ];
      const uniqueIds = Array.from(new Set(allAssignedUsers));
      // console.log(uniqueIds);
      dto.assignedCompanyUsers = uniqueIds;
      const isUpdated = await this.discountModel
        .findByIdAndUpdate(discountFound._id, dto, { new: true })
        .exec();

      if (!isUpdated) {
        throw new BadRequestException('invalid id or something of');
      }

      return isUpdated;
    }
    const isUpdated = await this.discountModel
      .findByIdAndUpdate(discountFound._id, dto, { new: true })
      .exec();

    if (!isUpdated) {
      throw new BadRequestException('invalid id or something of');
    }

    return isUpdated;
  }

  // async updateNormalDiscounts(
  //   discounts: {
  //     cycleName: string;
  //     type: string;
  //     percentage: number;
  //     SubscriptionPlan: string;
  //   }[],
  //   planid: string,
  // ): Promise<any> {
  //   const updatedData = [];

  //   for (const discount of discounts) {
  //     const filter = {
  //       SubscriptionPlan: planid,
  //       type: 'Discount',
  //       cycleName: discount.cycleName,
  //     };

  //     const foundone = await this.discountModel
  //       .findOne({ SubscriptionPlan: planid, type: 'Discount' })
  //       .exec();

  //     console.log('find oasdane', foundone);

  //     const update = {
  //       $set: discount,
  //     };

  //     const options = {
  //       new: true, // Return the modified document rather than the original
  //     };

  //     const updatedDocument = await this.discountModel
  //       .findOneAndUpdate(filter, update, options)
  //       .exec();

  //     if (updatedDocument) {
  //       updatedData.push(updatedDocument);
  //     }
  //   }

  //   return updatedData;
  // }

  async updateNormalDiscounts(
    discounts: {
      cycleName: string;
      type: string;
      percentage: number;
      SubscriptionPlan: string;
    }[],
    planid: string,
  ): Promise<any> {
    const updateOperations = discounts.map((discount) => ({
      updateOne: {
        filter: {
          $and: [
            { SubscriptionPlan: planid },
            { type: 'Discount' },
            { cycleName: discount.cycleName },
          ],
        },
        update: { $set: { ...discount } },
      },
    }));
    // console.log(
    //   'update operations',
    //   updateOperations.map((item: any) => {
    //     console.log(item.updateOne.filter, item.updateOne.update);
    //     return {
    //       filteris: item.updateOne.filter,
    //       toUpdate: item.updateOne.update,
    //     };
    //   }),
    // );

    return this.discountModel.bulkWrite(updateOperations);
  }
  async updateCoupons(
    coupons: {
      cycleName: string;
      type: string;
      percentage: number;
      SubscriptionPlan: any;
      start_date: Date;
      end_date: Date;
      couponCode: string;
      max_users: number;
      assignedCompanyUsers: string[] | undefined;
    }[],
    planid: string,
  ): Promise<any> {
    // for (const coupon of coupons) {
    //   const foundone = await this.discountModel
    //     .findOne({
    //       SubscriptionPlan: planid,
    //       type: 'Coupon',
    //       cycleName: coupon.cycleName,
    //     })
    //     .exec();

    //   console.log('find oasdane', foundone);
    // }
    const updateOperations = coupons.map((coupon) => ({
      updateOne: {
        filter: {
          $and: [
            { SubscriptionPlan: planid },
            { type: 'Coupon' },
            { cycleName: coupon.cycleName },
          ],
        },
        update: { $set: { ...coupon } },
      },
    }));

    return this.discountModel.bulkWrite(updateOperations);
  }
  async isCouponsExist(couponCode: string, planid: string) {
    const found = await this.discountModel
      .findOne({ couponCode, SubscriptionPlan: planid })
      .exec();

    if (!found) {
      return false;
    }
    return true;
  }
  async remove(id: string) {
    return this.discountModel.findByIdAndRemove(id).exec();
  }
  async removeManyByids(ids: string[]) {
    const result = await this.discountModel
      .deleteMany({ _id: { $in: ids } })
      .exec();
    if (!result) {
      throw new BadRequestException('Unable to delete discounts by IDs');
    }
  }

  async removeByPlanId(planid: string) {
    const allDeleted = await this.discountModel
      .deleteMany({
        SubscriptionPlan: planid,
        type: { $in: ['Discount', 'Coupon'] },
      })
      .exec();

    if (!allDeleted) {
      throw new BadRequestException('Unable to delete associated disounts');
    }
    return allDeleted;
  }

  async deleteCouponsByplanid(planid: string) {
    const condition = {
      type: 'Coupon',
      SubscriptionPlan: planid,
    };

    const result = await this.discountModel.deleteMany(condition);
    if (!result) {
      throw new BadRequestException('unable to delete coupons by planid');
    }
    return {
      message: `${result.deletedCount} discounts deleted successfully.`,
    };
  }
}
