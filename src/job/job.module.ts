import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { Job, jobSchema } from './entities/job.entity';
import { CandidateApplicationService } from 'src/candidate-application/candidate-application.service';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from 'src/candidate-application/entities/candidate-application.entity';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import {
  companySubscription,
  companySubscriptionSchema,
} from 'src/company-subscription/entities/company-subscription.entity';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import {
  Candidate,
  CandidateSchema,
} from 'src/candidate/entities/candidate.entity';
import { CandidateService } from 'src/candidate/candidate.service';
import { MailingService } from 'src/mailing/mailing.service';
import {
  PermissionUserSchema,
  PermissionsUserModel,
} from 'src/permissions/entities/permission.entity';
import { PermissionService } from 'src/permissions/permission.service';
import { JwtService } from '@nestjs/jwt';
import {
  Category,
  CategorySchema,
} from 'src/categories/entities/category.entity';
// import {
//   Connections,
//   ConnectionsSchema,
// } from 'src/webgateway/entities/gateway.entity';
// import { EventsGateway } from 'src/webgateway/events.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: jobSchema },
      { name: CandidateApplication.name, schema: CandidateApplicationSchema },
      { name: companySubscription.name, schema: companySubscriptionSchema },
      { name: User.name, schema: UserSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: Category.name, schema: CategorySchema },
      // { name: Connections.name, schema: ConnectionsSchema },
      { name: PermissionsUserModel.name, schema: PermissionUserSchema },
    ]),
    AuthModule,
    PassportModule,
  ],
  controllers: [JobController],
  providers: [
    JobService,
    CandidateApplicationService,
    SubPlanRestrictionsService,
    UserService,
    MailingService,
    CandidateService,
    JobService,
    PermissionService,
    // EventsGateway,
    JwtService,
  ],
})
export class JobModule {}
