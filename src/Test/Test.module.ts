import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { Test } from 'mocha';
import { TestSchema } from './entities/Test.entity';
import { TestController } from './Test.controller';
import { TestService } from './Test.service';
import {
  PermissionUserSchema,
  PermissionsUserModel,
} from 'src/permissions/entities/permission.entity';
import { PermissionService } from 'src/permissions/permission.service';
import {
  CompanyAssessment,
  CompanyAssessmentSchema,
} from 'src/companyAssessment/entities/companyAssessment.entity';
import { McqService } from 'src/mcq/mcq.service';
import { MCQ, McqSchema } from 'src/mcq/entities/mcq.entity';
import { CodingQuestionsService } from 'src/coding-question/coding-question.service';
import {
  CodingQuestion,
  CodingQuestionSchema,
} from 'src/coding-question/entities/coding-question.entity';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import {
  companySubscription,
  companySubscriptionSchema,
} from 'src/company-subscription/entities/company-subscription.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Test.name, schema: TestSchema },
      // {
      //   name: CandidateApplication.name,
      //   schema: CandidateApplicationSchema,
      // },
      // {
      //   name: User.name,
      //   schema: UserSchema,
      // },
      // {
      //   name: Job.name,
      //   schema: jobSchema,
      // },
      { name: MCQ.name, schema: McqSchema },
      { name: CodingQuestion.name, schema: CodingQuestionSchema },
      {
        name: PermissionsUserModel.name,
        schema: PermissionUserSchema,
      },
      {
        name: companySubscription.name,
        schema: companySubscriptionSchema,
      },
      {
        name: CompanyAssessment.name,
        schema: CompanyAssessmentSchema,
      },
    ]),
    CloudinaryModule,
    AuthModule,
    UserModule,
    ConfigModule,
  ],
  controllers: [TestController],
  providers: [
    TestService,
    PermissionService,
    SubPlanRestrictionsService,
    McqService,
    CodingQuestionsService,
  ],
})
export class TestModule {}
