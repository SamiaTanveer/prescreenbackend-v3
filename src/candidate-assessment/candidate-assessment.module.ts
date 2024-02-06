import { Module } from '@nestjs/common';
import { CandidateAssessmentService } from './candidate-assessment.service';
import { CandidateAssessmentController } from './candidate-assessment.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CandidateAssessment,
  CandidateAssessmentSchema,
} from './entities/candidate-assessment.entity';
import { CodingQuestionsService } from 'src/coding-question/coding-question.service';
import { McqService } from 'src/mcq/mcq.service';
import {
  CodingQuestion,
  CodingQuestionSchema,
} from 'src/coding-question/entities/coding-question.entity';
import { MCQ, McqSchema } from 'src/mcq/entities/mcq.entity';
import { McqModule } from 'src/mcq/mcq.module';
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
import { JobService } from 'src/job/job.service';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from 'src/candidate-application/entities/candidate-application.entity';
import { Job, jobSchema } from 'src/job/entities/job.entity';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { CandidateApplicationService } from 'src/candidate-application/candidate-application.service';
import {
  Connections,
  ConnectionsSchema,
} from 'src/webgateway/entities/gateway.entity';
import { EventsGateway } from 'src/webgateway/events.gateway';
import { ExamService } from 'src/exam/exam.service';
import { Exam } from 'src/exam/entities/exam.entity';
import { Test, TestSchema } from 'src/Test/entities/Test.entity';

@Module({
  imports: [
    AuthModule,
    McqModule,
    MongooseModule.forFeature([
      { name: CandidateAssessment.name, schema: CandidateAssessmentSchema },
      { name: Exam.name, schema: ExamService },
      { name: CodingQuestion.name, schema: CodingQuestionSchema },
      { name: MCQ.name, schema: McqSchema },
      { name: companySubscription.name, schema: companySubscriptionSchema },
      { name: PermissionsUserModel.name, schema: PermissionUserSchema },
      { name: Job.name, schema: jobSchema },
      { name: CandidateApplication.name, schema: CandidateApplicationSchema },
      { name: Test.name, schema: TestSchema },
      // { name: Connections.name, schema: ConnectionsSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CandidateAssessmentController],
  providers: [
    CandidateAssessmentService,
    ExamService,
    UserService,
    CodingQuestionsService,
    McqService,
    SubPlanRestrictionsService,
    PermissionService,
    JobService,
    // EventsGateway,
    JwtService,
    CandidateApplicationService,
  ],
})
export class CandidateAssessmentModule {}
