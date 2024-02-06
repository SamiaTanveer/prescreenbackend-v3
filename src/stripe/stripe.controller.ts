import {
  Controller,
  Inject,
  Post,
  Body,
  BadRequestException,
  UseGuards,
  ServiceUnavailableException,
  Req,
  Patch,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { STRIPE_CLIENT } from 'src/file/constant';
import Stripe from 'stripe';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PaymentDto } from 'src/utils/classes';
import { SubscriptionPlanService } from 'src/subscription-plan/subscription-plan.service';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from '@nestjs/passport';
import {
  PricingEntity,
  SubscriptionPlan,
} from 'src/subscription-plan/entities/subscription-plan.entity';
import { DiscountService } from 'src/discounts/discounts.service';
import { Discount } from 'src/discounts/entities/discount.entity';
import { CompanySubscriptionService } from 'src/company-subscription/company-subscription.service';
import { AuthReq } from 'src/types';
import { CompanyTeamGuard } from 'src/auth/jwt.team.guard';

@ApiTags('Stripe module API')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('api/stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly subPlanService: SubscriptionPlanService,
    private readonly userService: UserService,
    private readonly discountService: DiscountService,
    private readonly companySubscriptionService: CompanySubscriptionService,
    @Inject(STRIPE_CLIENT) private stripe: Stripe,
  ) {}

  @Post('create-payment-intent')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  async createPaymentIntent(
    @Body() dto: PaymentDto,
    // @Body() subdto: CreateCompanySubscriptionDto,
    @Req() req: AuthReq,
  ) {
    // console.log('create payment route .. userid..', userId);
    try {
      // find the subscription plan
      const subPlanFound = await this.subPlanService.findById(
        dto.SubscriptionPlan,
      );
      // console.log(dto, dto.couponCode);
      const paymentIntent = await this.CreateIntent(subPlanFound, dto);
      // when strip price is clear, then create companySubscriptionService
      const companySubscriptionDto = {
        company: req.user.id,
        SubscriptionPlan: dto.SubscriptionPlan,
        featuresAllowed: {
          mcqsBank: subPlanFound.featuresAllowed.mcqsBank,
          codingBank: subPlanFound.featuresAllowed.codingBank,
          testBank: subPlanFound.featuresAllowed.testBank,
          testsAllowed: subPlanFound.featuresAllowed.testsAllowed,
          assessmentsAllowed: subPlanFound.featuresAllowed.assessmentsAllowed,
          jobsAllowed: subPlanFound.featuresAllowed.jobsAllowed,
          invitesAllowed: subPlanFound.featuresAllowed.invitesAllowed,
        },
        featuresUsed: {
          testsUsed: '0',
          assessmentsUsed: '0',
          jobsUsed: '0',
          invitesUsed: '0',
        },
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(),
        planCycle: dto.planCycle,
        paymentIntentIds: paymentIntent && [paymentIntent.id],
        subscriptionStatus: 'active',
      };
      const isCreated = await this.companySubscriptionService.create(
        companySubscriptionDto,
      );
      if (!isCreated) {
        throw new BadRequestException(
          'Fail to create companySubscription model',
        );
      }
      if (paymentIntent && paymentIntent.client_secret) {
        return {
          intentId: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
        };
      }
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException(error.message);
    }
  }

  private CreateIntent = async (
    subPlanFound: SubscriptionPlan,
    dto: PaymentDto,
  ) => {
    // // find the subscription plan
    // const subPlanFound = await this.subPlanService.findById(
    //   dto.SubscriptionPlan,
    // );
    const price = await this.calculatePrice(
      subPlanFound,
      dto.planCycle,
      dto.couponCode,
    );
    console.log('price to pay...', price);

    if (price) {
      const paymentIntent = await this.stripeService.createPaymentIntent({
        price,
      });

      if (!paymentIntent) {
        throw new ServiceUnavailableException(
          'Failed to create a payment intent',
        );
      }
      return paymentIntent;
    }
  };

  async calculatePrice(
    subPlanFound: SubscriptionPlan,
    priceType: string,
    couponCode = 'noCoupon',
  ) {
    let discountedPrice = 0;
    // console.log('coupons coming...', couponCode);

    // console.log('subPlanFounded', subPlanFound);
    if (couponCode !== 'noCoupon' && subPlanFound.coupons.length > 0) {
      // If coupon is available then apply coupons discount
      // console.log('coupons are present in the plan...');
      const coupons = subPlanFound.coupons;

      // find the coupon from coupons array
      const couponFound = coupons.filter((coupon) => {
        if (
          coupon.cycleName === priceType &&
          coupon.couponCode === couponCode
        ) {
          return coupon;
        }
      });
      if (couponFound.length === 0) {
        throw new BadRequestException(
          'No coupon found with this code, try another',
        );
      }
      // mil gya coupon
      const priceObj = subPlanFound.pricing.find(
        (priceObj) => priceObj.cycleName === priceType,
      );
      const couponMila = couponFound[0];
      // check for max_users
      if (couponMila.max_users <= couponMila.CouponUsed) {
        throw new BadRequestException('Sorry this coupon is all used Up!');
      }
      // now check if a coupon is valid with date
      const isWithInDate = this.isWithinDateRange(couponMila);
      console.log(isWithInDate);
      if (!isWithInDate) {
        throw new BadRequestException('Sorry this coupon is expired');
      }

      // place the discount
      if (priceObj && couponMila) {
        discountedPrice = this.calculateDiscountedPrice(
          priceObj?.price,
          priceObj.percentage,
        );
        // console.log('discounted price...', discountedPrice);
        return discountedPrice;
      }
    } else if (couponCode === 'noCoupon') {
      // If coupon is not available then apply normal discount
      subPlanFound.pricing.forEach((priceObj: PricingEntity) => {
        if (priceObj.cycleName === priceType) {
          discountedPrice = this.calculateDiscountedPrice(
            priceObj.price,
            priceObj.percentage,
          );
        }
      });
      return discountedPrice;
    }
  }

  calculateDiscountedPrice(
    actualPrice: number,
    discountPercentage: number,
  ): number {
    // if (discountPercentage < 0 || discountPercentage > 100) {
    //   throw new Error('Discount percentage must be between 0 and 100.');
    // }

    const discountAmount = (actualPrice * discountPercentage) / 100;
    const discountedPrice = actualPrice - discountAmount;

    return discountedPrice;
  }

  // function to check if the discount is within range
  private isWithinDateRange(discount: Discount): boolean {
    const currentDate = new Date();
    // console.log(
    //   currentDate,
    //   discount.start_date,
    //   currentDate >= discount.start_date,
    // );
    // console.log(
    //   currentDate,
    //   discount.end_date,
    //   currentDate <= discount.end_date,
    // );
    return (
      currentDate >= discount.start_date && currentDate <= discount.end_date
    );
  }

  @Patch('update-payment-intent')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  async updatePaymentIntent(@Body() dto: PaymentDto, @Req() req: AuthReq) {
    try {
      // find the subscription plan
      const subPlanFound = await this.subPlanService.findById(
        dto.SubscriptionPlan,
      );

      //

      const paymentIntent = await this.CreateIntent(subPlanFound, dto);

      // find applied plan
      const appliedPlan = await this.companySubscriptionService.find(
        req.user.id,
      );

      // console.log('appliedPlan', appliedPlan);
      // console.log('  dto.SubscriptionPlan', subPlanFound.featuresAllowed);
      // Check unUsed available features
      let newtestsAllowed;
      if (subPlanFound.featuresAllowed.testsAllowed == 'Unlimited') {
        newtestsAllowed = 'Unlimited';
      } else if (appliedPlan.featuresAllowed.testsAllowed == 'Unlimited') {
        newtestsAllowed = subPlanFound.featuresAllowed.testsAllowed;
      } else {
        const unUsedTest =
          +appliedPlan.featuresAllowed.testsAllowed -
          +appliedPlan.featuresUsed.testsUsed;
        newtestsAllowed = (
          unUsedTest + +subPlanFound.featuresAllowed.testsAllowed
        ).toString();
      }

      let newassessmentsAllowed;
      if (subPlanFound.featuresAllowed.assessmentsAllowed == 'Unlimited') {
        newassessmentsAllowed = 'Unlimited';
      } else if (
        appliedPlan.featuresAllowed.assessmentsAllowed == 'Unlimited'
      ) {
        newassessmentsAllowed = subPlanFound.featuresAllowed.assessmentsAllowed;
      } else {
        const assessmentsAllowed = parseInt(
          appliedPlan?.featuresAllowed.assessmentsAllowed ?? '0',
          10,
        );
        const assessmentsUsed = parseInt(
          appliedPlan?.featuresUsed.assessmentsUsed ?? '0',
          10,
        );
        const unUsedassessments = assessmentsAllowed - assessmentsUsed;
        console.log(assessmentsAllowed, assessmentsUsed);
        const comingunassessments = parseInt(
          subPlanFound.featuresAllowed.testsAllowed,
          10,
        );
        console.log(assessmentsUsed);
        console.log(unUsedassessments);
        console.log(newassessmentsAllowed);
        newassessmentsAllowed = (
          unUsedassessments + comingunassessments
        ).toString();
      }

      let newjobsAllowed;
      if (subPlanFound.featuresAllowed.jobsAllowed == 'Unlimited') {
        newjobsAllowed = 'Unlimited';
      } else if (appliedPlan.featuresAllowed.jobsAllowed == 'Unlimited') {
        newjobsAllowed = subPlanFound.featuresAllowed.jobsAllowed;
      } else {
        const jobsAllowed = parseInt(
          appliedPlan?.featuresAllowed.jobsAllowed ?? '0',
          10,
        );
        const jobsUsed = parseInt(
          appliedPlan?.featuresUsed.jobsUsed ?? '0',
          10,
        );
        const unUsedjobs = jobsAllowed - jobsUsed;
        const comingJobs = parseInt(
          subPlanFound.featuresAllowed.testsAllowed,
          10,
        );
        newjobsAllowed = (unUsedjobs + comingJobs).toString();
      }

      let newInvites;
      if (subPlanFound.featuresAllowed.invitesAllowed == 'Unlimited') {
        newInvites = 'Unlimited';
      } else if (appliedPlan.featuresAllowed.invitesAllowed == 'Unlimited') {
        newInvites = subPlanFound.featuresAllowed.invitesAllowed;
      } else {
        const invitesAllowed = parseInt(
          appliedPlan?.featuresAllowed.invitesAllowed ?? '0',
          10,
        );
        const invitesUsed = parseInt(
          appliedPlan?.featuresUsed.invitesUsed ?? '0',
          10,
        );
        const unUsedInvites = invitesAllowed - invitesUsed;
        const comingInvites = parseInt(
          subPlanFound.featuresAllowed.testsAllowed,
          10,
        );
        newInvites = (unUsedInvites + comingInvites).toString();
      }

      // const newtestsAllowed = this.calculateNewAllowedValue(
      //   appliedPlan?.featuresAllowed.testsAllowed,
      //   appliedPlan?.featuresUsed.testsUsed,
      //   subPlanFound.featuresAllowed.testsAllowed,
      // );

      // const newassessmentsAllowed = this.calculateNewAllowedValue(
      //   appliedPlan?.featuresAllowed.assessmentsAllowed,
      //   appliedPlan?.featuresUsed.assessmentsUsed,
      //   subPlanFound.featuresAllowed.assessmentsAllowed,
      // );

      // const newjobsAllowed = this.calculateNewAllowedValue(
      //   appliedPlan?.featuresAllowed.jobsAllowed,
      //   appliedPlan?.featuresUsed.jobsUsed,
      //   subPlanFound.featuresAllowed.jobsAllowed,
      // );

      // const newInvites = this.calculateNewAllowedValue(
      //   appliedPlan?.featuresAllowed.invitesAllowed,
      //   appliedPlan?.featuresUsed.invitesUsed,
      //   subPlanFound.featuresAllowed.invitesAllowed,
      // );

      const companySubscriptionDto = {
        company: req.user.id,
        SubscriptionPlan: dto.SubscriptionPlan,
        featuresAllowed: {
          mcqsBank: subPlanFound.featuresAllowed.mcqsBank,
          codingBank: subPlanFound.featuresAllowed.codingBank,
          testBank: subPlanFound.featuresAllowed.testBank,
          testsAllowed: newtestsAllowed,
          assessmentsAllowed: newassessmentsAllowed,
          jobsAllowed: newjobsAllowed,
          invitesAllowed: newInvites,
        },
        featuresUsed: {
          testsUsed: '0',
          assessmentsUsed: '0',
          jobsUsed: '0',
          invitesUsed: '0',
        },
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(),
        planCycle: dto.planCycle,
        paymentIntentIds: paymentIntent && [paymentIntent.id],
        subscriptionStatus: 'active',
      };
      console.log('new dto...', companySubscriptionDto);
      const isUpdated = await this.companySubscriptionService.update(
        appliedPlan?.id,
        companySubscriptionDto,
      );
      if (!isUpdated) {
        throw new BadRequestException(
          'Fail to create companySubscription model',
        );
      }

      // now update the id of this subscription in user model
      // await this.userService.updateUser(req.user.id, {
      //   subscriptionPlan: subPlanFound.id,
      // });

      // if (paymentIntent && paymentIntent.client_secret) {
      //   return {
      //     intentId: paymentIntent.id,
      //     client_secret: paymentIntent.client_secret,
      //   };
      // }
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException(error.message);
    }
  }

  async calculateNewAllowedValue(
    appliedAllowed: string | undefined,
    appliedUsed: string | undefined,
    comingAllowed: string | undefined,
  ): Promise<string> {
    const allowed = parseInt(appliedAllowed ?? '0', 10);
    const used = parseInt(appliedUsed ?? '0', 10);
    const unUsed = allowed - used;
    const coming = parseInt(comingAllowed ?? '0', 10);
    const newAllowed = (unUsed + coming).toString();

    return newAllowed;
  }
}
