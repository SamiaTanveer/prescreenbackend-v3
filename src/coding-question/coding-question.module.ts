import { Module } from '@nestjs/common';
import {
  CodingQuestion,
  CodingQuestionSchema,
} from './entities/coding-question.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CodingQuestionsController } from './coding-question.controller';
import { CodingQuestionsService } from './coding-question.service';
import { AuthModule } from 'src/auth/auth.module';
import {
  companySubscription,
  companySubscriptionSchema,
} from 'src/company-subscription/entities/company-subscription.entity';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import {
  PermissionUserSchema,
  PermissionsUserModel,
} from 'src/permissions/entities/permission.entity';
import { PermissionService } from 'src/permissions/permission.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: CodingQuestion.name, schema: CodingQuestionSchema },
      {
        name: companySubscription.name,
        schema: companySubscriptionSchema,
      },
      {
        name: PermissionsUserModel.name,
        schema: PermissionUserSchema,
      },
    ]),
  ],
  controllers: [CodingQuestionsController],
  providers: [
    CodingQuestionsService,
    SubPlanRestrictionsService,
    PermissionService,
  ],
})
export class CodingQuestionModule {}
