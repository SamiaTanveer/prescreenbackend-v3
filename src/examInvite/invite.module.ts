import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { MailingService } from 'src/mailing/mailing.service';
import { Job, jobSchema } from 'src/job/entities/job.entity';
import { CandidateApplicationService } from 'src/candidate-application/candidate-application.service';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from 'src/candidate-application/entities/candidate-application.entity';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import {
  companySubscription,
  companySubscriptionSchema,
} from 'src/company-subscription/entities/company-subscription.entity';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import {
  Candidate,
  CandidateSchema,
} from 'src/candidate/entities/candidate.entity';
import { JobService } from 'src/job/job.service';
import {
  PermissionUserSchema,
  PermissionsUserModel,
} from 'src/permissions/entities/permission.entity';
import { PermissionService } from 'src/permissions/permission.service';
import { JwtService } from '@nestjs/jwt';
import {
  Connections,
  ConnectionsSchema,
} from 'src/webgateway/entities/gateway.entity';
import { EventsGateway } from 'src/webgateway/events.gateway';
import {
  AssessmentInvite,
  AssessmentInviteSchema,
} from './entities/invite.entity';
import { CandidateService } from 'src/candidate/candidate.service';
import { CategorySchema } from 'src/categories/entities/category.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: AssessmentInvite.name, schema: AssessmentInviteSchema },
      { name: Job.name, schema: jobSchema },
      { name: CandidateApplication.name, schema: CandidateApplicationSchema },
      { name: User.name, schema: UserSchema },
      { name: companySubscription.name, schema: companySubscriptionSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: 'Category', schema: CategorySchema },
      // { name: Connections.name, schema: ConnectionsSchema },
      { name: PermissionsUserModel.name, schema: PermissionUserSchema },
    ]),
  ],
  controllers: [InviteController],
  providers: [
    InviteService,
    MailingService,
    CandidateApplicationService,
    UserService,
    SubPlanRestrictionsService,
    JobService,
    PermissionService,
    CandidateService,
    // EventsGateway,
    JwtService,
  ],
})
export class InviteModule {}
