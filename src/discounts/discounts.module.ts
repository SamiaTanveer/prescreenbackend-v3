import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { DiscountController } from './discounts.controller';
import { DiscountService } from './discounts.service';
import { Discount, DiscountSchema } from './entities/discount.entity';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from 'src/subscription-plan/entities/subscription-plan.entity';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { SubscriptionPlanService } from 'src/subscription-plan/subscription-plan.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Discount.name,
        schema: DiscountSchema,
      },
      {
        name: SubscriptionPlan.name,
        schema: SubscriptionPlanSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [DiscountController],
  providers: [DiscountService, SubscriptionPlanService],
})
export class DiscountModule {}
