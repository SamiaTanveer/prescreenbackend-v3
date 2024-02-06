import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { Discount } from 'src/discounts/entities/discount.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionPlanDto } from 'src/utils/classes';
import { setSortStageAssessments } from 'src/utils/funtions';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    @InjectModel(SubscriptionPlan.name)
    private SubscriptionPlanModel: Model<SubscriptionPlan>,
    @InjectModel(Discount.name)
    private discountModel: Model<Discount>,
  ) {}

  async checkPlanTitleUniqueness(planTitle: string): Promise<void> {
    const existingPlan = await this.SubscriptionPlanModel.findOne({
      planTitle: new RegExp(`^${planTitle}$`, 'i'),
    });

    if (existingPlan) {
      throw new ConflictException('Plan title must be unique');
    }
  }

  async create(dto: {
    planTitle: string;
    description: string;
    featuresAllowed: any;
    pricing: any[];
    priceMonthly: number;
  }) {
    // console.log(dto);
    const { planTitle, description, featuresAllowed, pricing, priceMonthly } =
      dto;

    // CHECK IF PLAN TITLE IS UNIQUE
    await this.checkPlanTitleUniqueness(dto.planTitle);
    // CREATE PLAN NOW
    const plan = await this.SubscriptionPlanModel.create({
      planTitle,
      description,
      featuresAllowed,
      pricing,
      priceMonthly,
    });
    if (!plan) {
      throw new BadRequestException('Cannot create plan');
    }
    // console.log('plan', plan);
    return plan;
  }

  async findAll(query: SubscriptionPlanDto) {
    const { page, limit, coupon, isActive, sort, title } = query;
    const matchStage: any = {};
    const sortStage: any = {};
    if (title) {
      matchStage.planTitle = { $regex: title, $options: 'i' };
    }
    if (isActive) {
      matchStage.isActive = isActive == 'true' ? true : false;
    }
    // console.log('subscription service plan....', matchStage);
    if (sort) {
      sortStage['$sort'] = setSortStageAssessments(sort);
    }
    // console.log('sortStage....', sortStage);
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      const pipeLine = [
        { $match: matchStage },
        {
          $unwind: '$pricing',
        },
        {
          $group: {
            _id: '$_id',
            planTitle: {
              $first: '$planTitle',
            },
            priceMonthly: {
              $first: '$priceMonthly',
            },
            isActive: {
              $first: '$isActive',
            },
            cycles: {
              $push: {
                cycleName: '$pricing.cycleName',
                percentage: '$pricing.percentage',
              },
            },
          },
        },
        {
          $lookup: {
            from: 'discounts',
            localField: '_id',
            foreignField: 'SubscriptionPlan',
            as: 'discounts',
          },
        },
        {
          $addFields: {
            coupon: {
              $cond: {
                if: {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$discounts',
                          as: 'discount',
                          cond: {
                            $eq: ['$$discount.type', 'Coupon'],
                          },
                        },
                      },
                    },
                    0,
                  ],
                },
                then: true,
                else: false,
              },
            },
          },
        },
        ...(coupon
          ? [
              {
                $match: {
                  $expr: {
                    $cond: {
                      if: { $eq: [coupon, 'true'] },
                      then: { $eq: ['$coupon', true] },
                      else: { $eq: ['$coupon', false] },
                    },
                  },
                },
              },
            ]
          : []),
        {
          $project: {
            _id: 1,
            planTitle: 1,
            cycles: 1,
            coupon: 1,
            isActive: 1,
            priceMonthly: 1,
          },
        },
        {
          $facet: {
            plans: [
              { $skip: skip },
              { $limit: +limit },
              ...(sort ? [sortStage] : []),
            ],
            total: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ];

      const result = await this.SubscriptionPlanModel.aggregate(pipeLine);
      const plans = result[0].plans;
      const total = result[0].total.length > 0 ? result[0].total[0].count : 0;
      // console.log('planss..', plans);
      // console.log('total plans..', total);
      return { plans, total };
    }
  }

  findAllPaid() {
    return this.SubscriptionPlanModel.find({
      'pricing.0.price': { $ne: 0 },
      isActive: true,
    }).exec();
  }
  findAllActivePlans() {
    return this.SubscriptionPlanModel.find({
      isActive: true,
    })
      .select('planTitle')
      .exec();
  }

  async findActivePlans() {
    // const pipeLine = [
    //   {
    //     $match: {
    //       isActive: true,
    //     },
    //   },
    //   {
    //     $unwind: '$pricing',
    //   },
    //   {
    //     $group: {
    //       _id: '$pricing.billingCycle',
    //       plans: {
    //         $push: {
    //           _id: '$_id',
    //           planTitle: '$planTitle',
    //           description: '$description',
    //           isActive: '$isActive',
    //           featuresAllowed: '$featuresAllowed',
    //           pricing: '$pricing',
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       billingCycle: '$_id',
    //       plans: 1,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       data: {
    //         $push: {
    //           k: '$billingCycle',
    //           v: '$plans',
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $replaceRoot: {
    //       newRoot: {
    //         $arrayToObject: '$data',
    //       },
    //     },
    //   },
    // ];
    const pipeLine = [
      {
        $match: {
          isActive: true,
        },
      },
      {
        $unwind: '$pricing',
      },
      {
        $group: {
          _id: '$pricing.billingCycle',
          plans: {
            $push: {
              _id: '$_id',
              planTitle: '$planTitle',
              description: '$description',
              isActive: '$isActive',
              featuresAllowed: '$featuresAllowed',
              pricing: '$pricing',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          billingCycle: '$_id',
          plans: 1,
        },
      },
      {
        $lookup: {
          from: 'discounts',
          let: { planIds: '$plans._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$SubscriptionPlan', '$$planIds'] },
                    { $in: ['$type', ['limited', 'Discount']] },
                  ],
                },
              },
            },
          ],
          as: 'associatedDiscounts',
        },
      },
      {
        $addFields: {
          plans: {
            $map: {
              input: '$plans',
              as: 'plan',
              in: {
                $mergeObjects: [
                  '$$plan',
                  {
                    discounts: {
                      $filter: {
                        input: '$associatedDiscounts',
                        as: 'discount',
                        cond: {
                          $eq: ['$$discount.SubscriptionPlan', '$$plan._id'],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          type: {
            $cond: [
              {
                $eq: [
                  {
                    $size: {
                      $filter: {
                        input: '$associatedDiscounts',
                        as: 'discount',
                        cond: {
                          $in: ['$$discount.type', ['limited', 'Discount']],
                        },
                      },
                    },
                  },
                  { $size: '$associatedDiscounts' },
                ],
              },
              null,
              'Discount',
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          data: {
            $push: {
              k: '$billingCycle',
              v: {
                plans: '$plans',
                type: '$type',
              },
            },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $arrayToObject: '$data',
          },
        },
      },
    ];
    const result = await this.SubscriptionPlanModel.aggregate(pipeLine);
    const currentDate = new Date();
    for (const plan of result[0].yearly.plans) {
      const validLimitedDiscounts = plan.discounts.filter(
        (disc: any) =>
          disc.type === 'limited' &&
          new Date(disc.start_date) <= currentDate &&
          new Date(disc.end_date) >= currentDate,
      );
      const validDiscount = plan.discounts.find(
        (disc: any) => disc.type === 'Discount',
      );
      if (validLimitedDiscounts.length) {
        plan.discounts = validLimitedDiscounts;
      } else if (validDiscount) {
        plan.discounts = [validDiscount];
      } else {
        plan.discounts = [];
      }
      // console.log('again');
      // Apply the discount on the plan price
      const selectedDiscount = plan.discounts.length ? plan.discounts[0] : null;
      if (selectedDiscount) {
        const discountPercentage = selectedDiscount.percentage / 100;
        plan.pricing.price *= 1 - discountPercentage;
      }
    }
    // const sortByPrice = (a: any, b: any) => a.pricing.price - b.pricing.price;
    // const monthly = result[0].monthly.plans.sort(sortByPrice);
    // const yearly = result[0].yearly.plans.sort(sortByPrice);
    // result = [{ monthly, yearly }];
    // console.log(result);
    return result.length > 0 ? result.pop() : {};
  }

  async findActivePlansNew() {
    const pipeLine = [
      {
        $match: {
          isActive: true,
        },
      },
      {
        $unwind: '$pricing',
      },
      {
        $lookup: {
          from: 'discounts',
          let: {
            planId: '$_id',
            cycleName: '$pricing.cycleName',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$SubscriptionPlan', '$$planId'],
                    },
                    {
                      $eq: ['$type', 'Discount'],
                    },
                    {
                      $eq: ['$cycleName', '$$cycleName'],
                    },
                  ],
                },
              },
            },
          ],
          as: 'discounts',
        },
      },
      {
        $addFields: {
          'pricing.discountedPrice': {
            $cond: {
              if: {
                $isArray: '$discounts',
              },
              then: {
                $subtract: [
                  '$pricing.price',
                  {
                    $multiply: [
                      '$pricing.price',
                      {
                        $divide: [
                          {
                            $sum: '$discounts.percentage',
                          },
                          100,
                        ],
                      },
                    ],
                  },
                ],
              },
              else: '$pricing.price',
            },
          },
        },
      },
      {
        $group: {
          _id: '$pricing.cycleName',
          plans: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          cycleName: '$_id',
          plans: 1,
        },
      },
    ];
    const result = await this.SubscriptionPlanModel.aggregate(pipeLine);
    console.log('active plans..', result);
    // const currentDate = new Date();
    // for (const plan of result[0].yearly.plans) {
    //   const validLimitedDiscounts = plan.discounts.filter(
    //     (disc: any) =>
    //       disc.type === 'limited' &&
    //       new Date(disc.start_date) <= currentDate &&
    //       new Date(disc.end_date) >= currentDate,
    //   );
    //   const validDiscount = plan.discounts.find(
    //     (disc: any) => disc.type === 'Discount',
    //   );
    //   if (validLimitedDiscounts.length) {
    //     plan.discounts = validLimitedDiscounts;
    //   } else if (validDiscount) {
    //     plan.discounts = [validDiscount];
    //   } else {
    //     plan.discounts = [];
    //   }
    //   // console.log('again');
    //   // Apply the discount on the plan price
    //   const selectedDiscount = plan.discounts.length ? plan.discounts[0] : null;
    //   if (selectedDiscount) {
    //     const discountPercentage = selectedDiscount.percentage / 100;
    //     plan.pricing.price *= 1 - discountPercentage;
    //   }
    // }
    // // const sortByPrice = (a: any, b: any) => a.pricing.price - b.pricing.price;
    // // const monthly = result[0].monthly.plans.sort(sortByPrice);
    // // const yearly = result[0].yearly.plans.sort(sortByPrice);
    // // result = [{ monthly, yearly }];
    // // console.log(result);
    // return result.length > 0 ? result.pop() : {};
    const transformedResult: any = {};

    result.forEach((item) => {
      transformedResult[item.cycleName] = item.plans;
    });
    // console.log(transformedResult);
    return transformedResult;
  }

  async findById(id: string) {
    const plan = await this.SubscriptionPlanModel.findById(id).populate({
      path: 'discounts coupons',
    });
    console.log('plannsfsadmfs', plan);

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return plan;
  }

  async findFreePlan() {
    const plan = await this.SubscriptionPlanModel.findOne({
      isActive: true,
      pricing: {
        $all: [{ $elemMatch: { price: 0 } }],
      },
    });

    if (!plan) {
      throw new NotFoundException('Free Plan not found');
    }
    return plan;
  }

  async findOneWithSameTitle(planTitle: string, planid: string) {
    const existingPlan = await this.SubscriptionPlanModel.findOne({
      planTitle,
      _id: { $ne: planid },
    });

    if (existingPlan) {
      throw new BadRequestException('Plan title must be unique');
    }
  }

  async update(id: string, dto: UpdateSubscriptionPlanDto) {
    const updatedPlan = await this.SubscriptionPlanModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    ).populate('coupons');
    if (!updatedPlan) {
      throw new NotFoundException('Plan not found');
    }
    return updatedPlan;
  }

  async removeCouponsFromPlan(id: string) {
    const updatedPlan = await this.SubscriptionPlanModel.findByIdAndUpdate(
      id,
      { $set: { coupons: [] } },
      { new: true },
    );
    console.log('update plan/.........', updatedPlan);

    if (!updatedPlan) {
      throw new NotFoundException('Plan not found');
    }

    return updatedPlan;
  }
  async removeSpecifiedCouponsFromPlan(id: string, couponsToRemove: string[]) {
    const updatedPlan = await this.SubscriptionPlanModel.findByIdAndUpdate(
      id,
      { $pull: { coupons: { $in: couponsToRemove } } },
      { new: true },
    );

    if (!updatedPlan) {
      throw new NotFoundException('Plan not found');
    }

    return updatedPlan;
  }

  async updateDiscounts(
    id: string,
    dto: { discounts: string[]; coupons?: string[] },
  ) {
    if (dto.discounts.length > 0 && dto.coupons && dto.coupons.length > 0) {
      const updatedPlan = await this.SubscriptionPlanModel.findByIdAndUpdate(
        id,
        dto,
        { new: true },
      );
      if (!updatedPlan) {
        throw new NotFoundException('unable to update plan');
      }
      return updatedPlan;
    }
    if (dto.discounts.length > 0) {
      const updatedPlan = await this.SubscriptionPlanModel.findByIdAndUpdate(
        id,
        dto,
        { new: true },
      );
      if (!updatedPlan) {
        throw new NotFoundException('unable to update plan');
      }
      return updatedPlan;
    }
  }

  async updateOnlyCoupons(id: string, dto: { coupons: string[] }) {
    if (dto.coupons.length > 0 && dto.coupons && dto.coupons.length > 0) {
      const updatedPlan = await this.SubscriptionPlanModel.findByIdAndUpdate(
        id,
        dto,
        { new: true },
      );
      if (!updatedPlan) {
        throw new NotFoundException('unable to update plan');
      }
      return updatedPlan;
    }
  }

  async updateStatus(id: string, action: string) {
    const planFound = await this.SubscriptionPlanModel.findById(id);
    if (!planFound) {
      throw new NotFoundException('Plan not found');
    }
    const ActivePlans = await this.SubscriptionPlanModel.find({
      isActive: true,
    });

    if (action === 'deactivate') {
      planFound.isActive = false;
    } else if (action === 'activate') {
      if (ActivePlans.length >= 3) {
        throw new BadRequestException(
          "You can't have more than three active plans, deactivate one first",
        );
      }

      // now update the planFound to active
      planFound.isActive = true;
    }
    await planFound.save();
    return planFound;
  }

  async remove(id: string) {
    const isDeleted = await this.SubscriptionPlanModel.findByIdAndDelete(id);
    if (!isDeleted) {
      throw new NotFoundException('No Plan found');
    }

    return {
      message: 'Plan deleted Successfully',
    };
  }
}
