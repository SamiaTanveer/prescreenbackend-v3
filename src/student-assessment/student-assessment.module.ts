import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
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
import { ExamService } from 'src/exam/exam.service';
import { Exam } from 'src/exam/entities/exam.entity';
import {
  StudentAssessment,
  StudentAssessmentSchema,
} from './entities/student-assessment.entity';
import { StudentAssessmentController } from './student-assessment.controller';
import { StudentAssessmentService } from './student-assessment.service';
import {
  CompanyAssessment,
  CompanyAssessmentSchema,
} from 'src/companyAssessment/entities/companyAssessment.entity';
import { CompanyAssessmentService } from 'src/companyAssessment/companyAssessment.service';
import { Test, TestSchema } from 'src/Test/entities/Test.entity';
import { TestService } from 'src/Test/Test.service';
import { CandidateService } from 'src/candidate/candidate.service';
import {
  Candidate,
  CandidateSchema,
} from 'src/candidate/entities/candidate.entity';
import { CategorySchema } from 'src/categories/entities/category.entity';

@Module({
  imports: [
    AuthModule,
    McqModule,
    MongooseModule.forFeature([
      { name: StudentAssessment.name, schema: StudentAssessmentSchema },
      { name: CompanyAssessment.name, schema: CompanyAssessmentSchema },
      { name: Test.name, schema: TestSchema },
      { name: MCQ.name, schema: McqSchema },
      { name: CodingQuestion.name, schema: CodingQuestionSchema },
      { name: companySubscription.name, schema: companySubscriptionSchema },
      { name: PermissionsUserModel.name, schema: PermissionUserSchema },
      { name: Job.name, schema: jobSchema },
      { name: CandidateApplication.name, schema: CandidateApplicationSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: 'Category', schema: CategorySchema },
      // { name: Connections.name, schema: ConnectionsSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [StudentAssessmentController],
  providers: [
    StudentAssessmentService,
    CompanyAssessmentService,
    UserService,
    TestService,
    McqService,
    CandidateService,
    SubPlanRestrictionsService,
    PermissionService,
    JobService,
    // EventsGateway,
    JwtService,
    CandidateApplicationService,
    CodingQuestionsService,
  ],
})
export class StudentAssessmentModule {}
