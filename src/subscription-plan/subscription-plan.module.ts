import { Module } from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service';
import { SubscriptionPlanController } from './subscription-plan.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from './entities/subscription-plan.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Discount } from 'src/discounts/entities/discount.entity';
import { DiscountSchema } from 'src/discounts/entities/discount.entity';
import { DiscountService } from 'src/discounts/discounts.service';
import {
  BillingCycle,
  BillingCycleSchema,
} from 'src/billingCycle/entities/billingCycle.entity';
import { BillingCycleService } from 'src/billingCycle/billingCycle.service';

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
        name: BillingCycle.name,
        schema: BillingCycleSchema,
      },
    ]),
  ],
  controllers: [SubscriptionPlanController],
  providers: [SubscriptionPlanService, DiscountService, BillingCycleService],
})
export class SubscriptionPlanModule {}
