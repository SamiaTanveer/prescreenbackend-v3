import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  Put,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service';
import {
  CouponDiscountDto,
  CreateSubscriptionPlanDto,
  PlanDiscountDto,
} from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { DiscountService } from 'src/discounts/discounts.service';
import { BillingCycleService } from 'src/billingCycle/billingCycle.service';
import { PricingEntity } from './entities/subscription-plan.entity';
import { checkDuplicates } from 'src/utils/funtions';
import {
  SubPlanResponsePagination,
  SubscriptionPlanDto,
} from 'src/utils/classes';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Admin Subscription API')
@Controller('api/subscription-plan')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
export class SubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
    private readonly discountService: DiscountService,
    private readonly cycleService: BillingCycleService,
  ) {}

  // *************************** in use ***********************
  @Post('createPlan')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({
    summary: 'Create Manage subscription --- Creates a Subscription plan',
    description: 'Create a subscription plan',
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription plan Created',
  })
  async create(@Body() dto: CreateSubscriptionPlanDto) {
    // get fields for plan creation
    const {
      planTitle,
      description,
      featuresAllowed,
      priceMonthly,
      discounts,
      coupons,
    } = dto;
    // first check discounts array of objects for unique cycles
    const hasDuplicates = checkDuplicates(discounts, 'cycle');
    if (hasDuplicates) {
      throw new BadRequestException(
        'Discounts cannot be multiple on same billing cycle',
      );
    }
    // check for couponscode uniqueness
    if (coupons && priceMonthly !== 0) {
      await this.discountService.checkUniqueCouponsCodes(coupons);
      // check if two same name coupons are coming
      const hasDuplicates = checkDuplicates(coupons, 'couponCode');
      if (hasDuplicates) {
        throw new BadRequestException('Coupon names are not unique');
      }
    }
    const pricing: PricingEntity[] = [];
    let isMonthlyDiscount = false;
    if (discounts.length > 0) {
      // loop through discounts array and make up pricing array for the plan creation
      const discountPromises = discounts.map(
        async (discount: PlanDiscountDto) => {
          const cycleDetails = await this.cycleService.findById(discount.cycle);
          // check if monthly discount is there then make isMonthlyDiscount true
          if (cycleDetails.name === 'monthly') {
            isMonthlyDiscount = true;
          }
          // set fields for discounts to create them next after plan creation
          const price = priceMonthly * cycleDetails.cycle;
          return {
            cycleName: cycleDetails.name,
            cycle: cycleDetails.cycle,
            price,
            percentage: discount.percentage,
          };
        },
      );

      const resolvedDiscounts = await Promise.all(discountPromises);
      pricing.push(...resolvedDiscounts);
    }
    console.log('pricing array....created...', pricing);

    // now create the subscription plan with its data
    // console.log(isMonthlyDiscount);
    const planData = {
      pricing: !isMonthlyDiscount
        ? [
            ...pricing,
            {
              cycleName: 'monthly',
              cycle: 1,
              price: dto.priceMonthly,
              percentage: 0,
            },
          ]
        : pricing,
      planTitle,
      priceMonthly,
      description,
      featuresAllowed,
    };

    const planCreated = await this.subscriptionPlanService.create(planData);
    console.log('plan created...', planCreated);

    const planid = planCreated.id;

    // now make the discounts data to create discounts
    const discountsData = pricing.map(
      (
        price: { cycleName: string; cycle: number; price: number },
        index: number,
      ) => {
        return {
          cycleName: price.cycleName,
          type: 'Discount',
          percentage: discounts[index].percentage,
          SubscriptionPlan: planid,
        };
      },
    );
    console.log('discountsData....', discountsData);
    // now create the discounts with planid
    // if (discounts.length > 0) {
    //   console.log('discounts are present');
    const createdDiscounts =
      await this.discountService.createDiiscount(discountsData);
    console.log('created discounts....', createdDiscounts);
    // }
    // and create the coupons with planid(if coupons are there)
    if (coupons && coupons.length > 0 && priceMonthly !== 0) {
      console.log('coupons are present');
      const couponsDataPromises = coupons.map(
        async (coupon: CouponDiscountDto, index: number) => {
          const cycleDetails = await this.cycleService.findById(coupon.cycle);
          return {
            cycleName: cycleDetails.name,
            type: 'Coupon',
            percentage: coupons[index].percentage,
            SubscriptionPlan: planid,
            start_date: coupons[index].start_date,
            end_date: coupons[index].end_date,
            couponCode: coupons[index].couponCode,
            max_users: coupons[index].max_users,
            assignedCompanyUsers: coupons[index].assignedCompanyUsers
              ? coupons[index].assignedCompanyUsers
              : [],
          };
        },
      );

      const couponsData = await Promise.all(couponsDataPromises);
      console.log('coupons data....', couponsData);
      if (couponsData) {
        const createdCoupons =
          await this.discountService.createCoupons(couponsData);

        console.log('created Coupons....', createdCoupons);
        // now update the plan with discounts and coupons
        const planupdated = await this.subscriptionPlanService.updateDiscounts(
          planid,
          {
            discounts: createdDiscounts.map((dis) => dis.id),
            coupons: createdCoupons.map((dis) => dis.id),
          },
        );
        return planupdated;
      }
    }
    // if there is no coupons then update plan only using discounts
    const planupdated = await this.subscriptionPlanService.updateDiscounts(
      planid,
      {
        discounts: createdDiscounts.map((dis) => dis.id),
      },
    );
    return planupdated;

    // return planCreated;
  }
  // *************************** in use ***********************
  @Get('/allPlans')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({
    summary: 'Manage Subscription List --- all plans listing',
    description: 'Get all Plans',
  })
  @ApiResponse({
    status: 200,
    type: SubPlanResponsePagination,
  })
  findAll(@Query() query: SubscriptionPlanDto) {
    return this.subscriptionPlanService.findAll(query);
  }
  // *************************** in use ***********************
  @Get('/allPaidPlans')
  @ApiOperation({
    description: 'Get all Paid Plans from active ones',
  })
  @ApiResponse({
    status: 200,
  })
  findAllPaidPlans() {
    return this.subscriptionPlanService.findAllPaid();
  }
  // *************************** in use ***********************
  @Get('/activePlans')
  @ApiOperation({
    description: 'Get all active Plans... to show in dropdown',
  })
  @ApiResponse({
    status: 200,
  })
  findAllActivePlans() {
    return this.subscriptionPlanService.findAllActivePlans();
  }
  // *************************** in use ***********************
  @Get('/allActivePlans')
  @ApiOperation({ summary: 'Pricing/Plan --> show all subscriptions ' })
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({
    description: 'Get all active Plans',
  })
  @ApiResponse({
    status: 200,
  })
  async findActivePlans() {
    return this.subscriptionPlanService.findActivePlansNew();
  }

  @Get('/findFreePlan')
  @ApiOperation({
    summary: 'Get a free active plan',
    description: 'Get a free plan which is active',
  })
  @ApiResponse({
    status: 200,
  })
  async findFreePlan() {
    return this.subscriptionPlanService.findFreePlan();
  }
  // *************************** in use ***********************
  @Get('plan/:id')
  @ApiOperation({ summary: 'Get Plan By ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a Plan',
  })
  findById(@Param('id') id: string) {
    return this.subscriptionPlanService.findById(id);
  }
  // *************************** in use ***********************
  @Put('plan/:id')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({ summary: 'Edits the Plan' })
  @ApiResponse({
    status: 200,
    description: 'Returns an edited Plan',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionPlanDto,
  ) {
    console.log('******************* in side **********************');
    // checking for plan title already exists
    await this.subscriptionPlanService.findOneWithSameTitle(dto.planTitle, id);

    const {
      planTitle,
      description,
      featuresAllowed,
      priceMonthly,
      pricing,
      coupons,
    } = dto;
    // first check discounts array of objects for unique cycles
    const hasDuplicates = pricing && checkDuplicates(pricing, 'cycleName');
    if (hasDuplicates) {
      throw new BadRequestException(
        'Discounts cannot be multiple on same billing cycle',
      );
    }
    // check for couponscode uniqueness
    if (coupons && coupons.length > 1 && priceMonthly !== 0) {
      const hasDuplicates = pricing && checkDuplicates(coupons, 'couponCode');
      if (hasDuplicates) {
        throw new BadRequestException('Coupon Code are not unique');
      }
    }
    // loop through discounts array and make up pricing array for the plan updation
    let isMonthlyPresent = false;
    const newPricing = pricing.map((priceObj: PricingEntity) => {
      // set fields for discounts to create them next after plan creation
      if (priceObj.cycleName === 'monthly') {
        isMonthlyPresent = true;
      }
      const price = priceMonthly * priceObj.cycle;
      return {
        cycleName: priceObj.cycleName,
        cycle: priceObj.cycle,
        price,
        percentage: priceObj.percentage,
      };
    });

    console.log('pricing array created to send for updation', newPricing);

    // now create the subscription plan with its data
    const planData = {
      pricing: !isMonthlyPresent
        ? [
            ...newPricing,
            {
              cycleName: 'monthly',
              cycle: 1,
              price: dto.priceMonthly,
              percentage: 0,
            },
          ]
        : newPricing,
      planTitle,
      description,
      priceMonthly,
      featuresAllowed,
    };
    console.log('this is planData...', planData);

    const planUpdated = await this.subscriptionPlanService.update(id, planData);
    // const planid = planUpdated.id;

    // now make the discounts data to update discounts
    const discountsData = pricing.map((price: PricingEntity) => {
      return {
        cycleName: price.cycleName,
        type: 'Discount',
        percentage: price.percentage,
        SubscriptionPlan: id,
      };
    });
    console.log('discountsData....hydrated for updation....', discountsData);
    // now update the discounts with planid

    const updatedDiscounts = await this.discountService.updateNormalDiscounts(
      discountsData,
      id,
    );
    console.log('updated discounts....', updatedDiscounts);

    const newCouponsToCreate: any[] = [];

    // and create the coupons with planid(if coupons are there)
    if (coupons && coupons.length > 0 && priceMonthly !== 0) {
      console.log('coupons are present');
      const couponsDataPromises = coupons.map(
        async (coupon: CouponDiscountDto) => {
          const cycleDetails = await this.cycleService.findById(coupon.cycle);
          const isCouponExist = await this.discountService.isCouponsExist(
            coupon.couponCode,
            id,
          );
          if (!isCouponExist) {
            newCouponsToCreate.push({
              cycleName: cycleDetails.name,
              type: 'Coupon',
              percentage: coupon.percentage,
              SubscriptionPlan: id,
              start_date: coupon.start_date,
              end_date: coupon.end_date,
              couponCode: coupon.couponCode,
              max_users: coupon.max_users,
              assignedCompanyUsers: coupon.assignedCompanyUsers
                ? coupon.assignedCompanyUsers
                : [],
            });
          }
          return {
            cycleName: cycleDetails.name,
            type: 'Coupon',
            percentage: coupon.percentage,
            SubscriptionPlan: id,
            start_date: coupon.start_date,
            end_date: coupon.end_date,
            couponCode: coupon.couponCode,
            max_users: coupon.max_users,
            assignedCompanyUsers: coupon.assignedCompanyUsers
              ? coupon.assignedCompanyUsers
              : [],
          };
        },
      );

      const couponsData = await Promise.all(couponsDataPromises);
      console.log('this is couponsdata.......', couponsData);
      // 1. no coupons at create, but coupons in edit
      const couponArrLength = planUpdated.coupons.length;
      console.log('couponarr length...', couponArrLength === 0);
      console.log(
        'newCouponsToCreate length...',
        newCouponsToCreate.length === 0,
      );
      console.log(
        '3rd condition....',
        newCouponsToCreate.length > 0 && couponsData.length > 0,
      );

      if (couponArrLength === 0) {
        const createdCoupons =
          await this.discountService.createCoupons(newCouponsToCreate);

        console.log(
          'no coupons at create plan, but now they are coming....',
          createdCoupons,
        );
        // now update the plan with discounts and coupons
        const againUpdated =
          await this.subscriptionPlanService.updateOnlyCoupons(id, {
            coupons: createdCoupons.map((dis) => dis.id),
          });
        return againUpdated;
      }
      // 2. coupons at create, same coupons in edit
      if (newCouponsToCreate.length === 0) {
        const updatedCoupons = await this.discountService.updateCoupons(
          couponsData,
          id,
        );
        console.log(
          'same coupons are coming with update info....',
          updatedCoupons,
        );
        // return planUpdated;
      }
      // 3. coupons at create, now more coupons in edit
      if (newCouponsToCreate.length > 0 && couponsData.length > 0) {
        // first create the new coupons
        const createdCoupons =
          await this.discountService.createCoupons(newCouponsToCreate);

        console.log(
          'old coupons were there, but new coupons coming....',
          createdCoupons,
        );
        // now update the plan with coupons
        console.log(
          planUpdated.coupons.map((coupon) =>
            console.log('names...', coupon.toString()),
          ),
        );
        const planupdated =
          await this.subscriptionPlanService.updateOnlyCoupons(id, {
            coupons: [
              ...planUpdated.coupons.map((coupon) => coupon._id.toString()),
              ...createdCoupons.map((coupon) => coupon._id.toString()),
            ],
          });
        // now update the already present coupons

        const updatedCoupons = await this.discountService.updateCoupons(
          couponsData,
          id,
        );
        console.log(
          'now updating already coupons updated Coupons....',
          updatedCoupons,
        );
        // return planupdated;
      }

      // remove the extra removed coupons that are not coming from frontend
      // find already present couponsids
      const oldCouponsRemoveArr = planUpdated.coupons.filter(
        (planCoupon) =>
          !coupons.some(
            (coupon: any) => planCoupon.couponCode === coupon.couponCode,
          ),
      );

      console.log('coupons to remove.....', oldCouponsRemoveArr);
      if (oldCouponsRemoveArr.length > 0) {
        await this.discountService.removeManyByids(
          oldCouponsRemoveArr.map((coup) => coup._id),
        );
        // now remove those coupon ids from the plan also
        const againPlanUpdated =
          await this.subscriptionPlanService.removeSpecifiedCouponsFromPlan(
            id,
            oldCouponsRemoveArr.map((coup) => coup._id),
          );
        console.log('extra coupons deleted!');

        return againPlanUpdated;
      }
      console.log('nothing to be deleted');
      return planUpdated;
    }

    // if coupons come empty, then remove all the coupons docs and update the subscription plan object
    if (coupons?.length === 0) {
      await this.discountService.deleteCouponsByplanid(id);

      const againUpdated =
        await this.subscriptionPlanService.removeCouponsFromPlan(id);
      console.log('All coupons removed from plan successfully');
      return againUpdated;
    }
    return planUpdated;
  }
  // *************************** in use ***********************
  @Patch('plan/:id/:action')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiParam({
    description: 'activate or deactivate',
    name: 'action',
  })
  @ApiOperation({ summary: 'Activates/deactivates the plan' })
  updateStatus(@Param('id') id: string, @Param('action') action: string) {
    if (action !== 'deactivate' && action !== 'activate') {
      throw new BadRequestException(`Invalid Action ${action}`);
    }
    return this.subscriptionPlanService.updateStatus(id, action);
  }
  // *************************** in use ***********************
  @Delete('plan/:id')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({ summary: 'Delete a Plan by its id' })
  async remove(@Param('id') id: string) {
    const idDeleted = await this.subscriptionPlanService.remove(id);

    // now remove its discounts from discounts model
    const deletedDiscounts = await this.discountService.removeByPlanId(id);

    return { message: 'Plan Deleted Successfully' };
  }
}
