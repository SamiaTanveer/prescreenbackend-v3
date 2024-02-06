import { Module, DynamicModule, Provider } from '@nestjs/common';
import { STRIPE_CLIENT } from 'src/file/constant';
import Stripe from 'stripe';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from 'src/subscription-plan/entities/subscription-plan.entity';
import { SubscriptionPlanService } from 'src/subscription-plan/subscription-plan.service';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthModule } from 'src/auth/auth.module';
import {
  DiscountSchema,
  Discount,
} from 'src/discounts/entities/discount.entity';
import { DiscountService } from 'src/discounts/discounts.service';
import { CompanySubscriptionService } from 'src/company-subscription/company-subscription.service';
import {
  companySubscription,
  companySubscriptionSchema,
} from 'src/company-subscription/entities/company-subscription.entity';
import { PermissionService } from 'src/permissions/permission.service';
import {
  PermissionUserSchema,
  PermissionsUserModel,
} from 'src/permissions/entities/permission.entity';
import {
  Candidate,
  CandidateSchema,
} from 'src/candidate/entities/candidate.entity';
import { CandidateService } from 'src/candidate/candidate.service';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from 'src/candidate-application/entities/candidate-application.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: SubscriptionPlan.name,
        schema: SubscriptionPlanSchema,
      },
      {
        name: Discount.name,
        schema: DiscountSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Discount.name,
        schema: DiscountSchema,
      },
      {
        name: companySubscription.name,
        schema: companySubscriptionSchema,
      },
      {
        name: PermissionsUserModel.name,
        schema: PermissionUserSchema,
      },
      {
        name: Candidate.name,
        schema: CandidateSchema,
      },
      {
        name: CandidateApplication.name,
        schema: CandidateApplicationSchema,
      },
    ]),
  ],
  controllers: [StripeController],
  providers: [
    StripeService,
    SubscriptionPlanService,
    UserService,
    DiscountService,
    CandidateService,
    CompanySubscriptionService,
    PermissionService,
  ],
})
export class StripeModule {
  static forRoot(apiKey: string, config: Stripe.StripeConfig): DynamicModule {
    const stripe = new Stripe(apiKey, config);

    const stripeProvider: Provider = {
      provide: STRIPE_CLIENT,
      useValue: stripe,
    };
    return {
      module: StripeModule,
      providers: [stripeProvider],
      exports: [stripeProvider],
      global: true,
    };
  }
}
