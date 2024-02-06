import { Module } from '@nestjs/common';
import { SubPlanRestrictionsService } from './sub-plan-restrictions.service';
// import { SubPlanRestrictionsController } from './sub-plan-restrictions.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  companySubscription,
  companySubscriptionSchema,
} from 'src/company-subscription/entities/company-subscription.entity';
import { User, UserSchema } from 'src/user/entities/user.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: companySubscription.name, schema: companySubscriptionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  // controllers: [SubPlanRestrictionsController],
  providers: [SubPlanRestrictionsService],
})
export class SubPlanRestrictionsModule {}
