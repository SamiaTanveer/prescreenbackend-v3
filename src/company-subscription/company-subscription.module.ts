import { Module } from '@nestjs/common';
import { CompanySubscriptionService } from './company-subscription.service';
import { CompanySubscriptionController } from './company-subscription.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  companySubscription,
  companySubscriptionSchema,
} from './entities/company-subscription.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from 'src/user/user.service';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { MailingService } from 'src/mailing/mailing.service';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from 'src/subscription-plan/entities/subscription-plan.entity';
import { SubscriptionPlanService } from 'src/subscription-plan/subscription-plan.service';
import { Discount } from 'src/discounts/entities/discount.entity';
import { DiscountSchema } from 'src/discounts/entities/discount.entity';

import { JwtService } from '@nestjs/jwt';
import { EventsGateway } from 'src/webgateway/events.gateway';
import {
  Connections,
  ConnectionsSchema,
} from 'src/webgateway/entities/gateway.entity';
import { CandidateService } from 'src/candidate/candidate.service';
import {
  Candidate,
  CandidateSchema,
} from 'src/candidate/entities/candidate.entity';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from 'src/candidate-application/entities/candidate-application.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: companySubscription.name, schema: companySubscriptionSchema },
      { name: User.name, schema: UserSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: CandidateApplication.name, schema: CandidateApplicationSchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
      {
        name: Discount.name,
        schema: DiscountSchema,
      },
    ]),
  ],
  controllers: [CompanySubscriptionController],
  providers: [
    CompanySubscriptionService,
    UserService,
    MailingService,
    CandidateService,
    SubscriptionPlanService,
    // EventsGateway,
    JwtService,
  ],
})
export class CompanySubscriptionModule {}
