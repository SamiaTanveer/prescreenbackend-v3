import { Module } from '@nestjs/common';
import { McqService } from './mcq.service';
import { McqController } from './mcq.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MCQ, McqSchema } from './entities/mcq.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CompanyGuard } from 'src/auth/jwt.company.guard';
import {
  companySubscription,
  companySubscriptionSchema,
} from 'src/company-subscription/entities/company-subscription.entity';
import { SubPlanRestrictionsModule } from 'src/sub-plan-restrictions/sub-plan-restrictions.module';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import { PermissionService } from 'src/permissions/permission.service';
import {
  PermissionUserSchema,
  PermissionsUserModel,
} from 'src/permissions/entities/permission.entity';
import { Test, TestSchema } from 'src/Test/entities/Test.entity';
import { TestService } from 'src/Test/Test.service';
import {
  CompanyAssessment,
  CompanyAssessmentSchema,
} from 'src/companyAssessment/entities/companyAssessment.entity';
import { CodingQuestion } from 'src/utils/classes';
import { CodingQuestionSchema } from 'src/coding-question/entities/coding-question.entity';
import { CodingQuestionsService } from 'src/coding-question/coding-question.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MCQ.name,
        schema: McqSchema,
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
        name: Test.name,
        schema: TestSchema,
      },
      {
        name: CompanyAssessment.name,
        schema: CompanyAssessmentSchema,
      },
      {
        name: CodingQuestion.name,
        schema: CodingQuestionSchema,
      },
    ]),
    AuthModule,
    SubPlanRestrictionsModule,
  ],
  controllers: [McqController],
  providers: [
    McqService,
    SubPlanRestrictionsService,
    CompanyGuard,
    PermissionService,
    CodingQuestionsService,
  ],
})
export class McqModule {}
