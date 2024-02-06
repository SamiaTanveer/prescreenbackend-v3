import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Exam, ExamSchema } from './entities/exam.entity';
import { MCQ, McqSchema } from 'src/mcq/entities/mcq.entity';
import {
  CodingQuestion,
  CodingQuestionSchema,
} from 'src/coding-question/entities/coding-question.entity';
import { McqService } from 'src/mcq/mcq.service';
import { CodingQuestionsService } from 'src/coding-question/coding-question.service';
import {
  companySubscription,
  companySubscriptionSchema,
} from 'src/company-subscription/entities/company-subscription.entity';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import { PermissionUserSchema, PermissionsUserModel } from 'src/permissions/entities/permission.entity';
import { PermissionService } from 'src/permissions/permission.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: MCQ.name, schema: McqSchema },
      { name: CodingQuestion.name, schema: CodingQuestionSchema },
      { name: companySubscription.name, schema: companySubscriptionSchema },
      { name: PermissionsUserModel.name, schema: PermissionUserSchema },
    ]),
  ],
  controllers: [ExamController],
  providers: [
    ExamService,
    McqService,
    CodingQuestionsService,
    SubPlanRestrictionsService,
    PermissionService,
  ],
})
export class ExamModule {}
