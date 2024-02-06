import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UserSchema } from '../user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { CompanyService } from 'src/company/company.service';
import { CompanySchema } from 'src/company/entities/company.entity';
import { CandidateSchema } from 'src/candidate/entities/candidate.entity';
import { CandidateService } from 'src/candidate/candidate.service';
import { MailingService } from 'src/mailing/mailing.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AppService } from 'src/app.service';
import { GoogleStrategy } from './google.strategy';
import { companySubscriptionSchema } from 'src/company-subscription/entities/company-subscription.entity';
import { CompanySubscriptionService } from 'src/company-subscription/company-subscription.service';
import { SubscriptionPlanService } from 'src/subscription-plan/subscription-plan.service';
import { SubscriptionPlanSchema } from 'src/subscription-plan/entities/subscription-plan.entity';
import { jobSchema } from 'src/job/entities/job.entity';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from 'src/candidate-application/entities/candidate-application.entity';
import { DiscountSchema } from 'src/discounts/entities/discount.entity';
import { CandidateApplicationService } from 'src/candidate-application/candidate-application.service';
import { JobService } from 'src/job/job.service';
import { CategorySchema } from 'src/categories/entities/category.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('Jwt_secret'),
          signOptions: {
            expiresIn: config.get<string | number>('Jwt_exp'),
          },
        };
      },
    }),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: CandidateApplication.name, schema: CandidateApplicationSchema },
      { name: 'Company', schema: CompanySchema },
      { name: 'Candidate', schema: CandidateSchema },
      { name: 'Job', schema: jobSchema },
      { name: 'Discount', schema: DiscountSchema },
      { name: 'companySubscription', schema: companySubscriptionSchema },
      { name: 'SubscriptionPlan', schema: SubscriptionPlanSchema },
      { name: 'CandidateApplication', schema: CandidateApplicationSchema },
      { name: 'Category', schema: CategorySchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    JwtStrategy,
    UserService,
    CompanyService,
    CandidateService,
    MailingService,
    JobService,
    CloudinaryService,
    AppService,
    CompanySubscriptionService,
    SubscriptionPlanService,
    CandidateApplicationService,
  ],

  exports: [JwtStrategy, PassportModule, GoogleStrategy],
})
export class AuthModule {}
