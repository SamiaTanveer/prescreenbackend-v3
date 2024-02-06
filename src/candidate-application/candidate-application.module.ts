import { Module } from '@nestjs/common';
import { CandidateApplicationService } from './candidate-application.service';
import { CandidateApplicationController } from './candidate-application.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from './entities/candidate-application.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JobService } from 'src/job/job.service';
import { Job, jobSchema } from 'src/job/entities/job.entity';
import { PermissionService } from 'src/permissions/permission.service';
import {
  PermissionUserSchema,
  PermissionsUserModel,
} from 'src/permissions/entities/permission.entity';
import { JwtService } from '@nestjs/jwt';
import {
  Connections,
  ConnectionsSchema,
} from 'src/webgateway/entities/gateway.entity';
import { EventsGateway } from 'src/webgateway/events.gateway';
import { CategorySchema } from 'src/categories/entities/category.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CandidateApplication.name, schema: CandidateApplicationSchema },
      { name: Job.name, schema: jobSchema },
      { name: PermissionsUserModel.name, schema: PermissionUserSchema },
      { name: 'Category', schema: CategorySchema },
      // { name: Connections.name, schema: ConnectionsSchema },
    ]),
    AuthModule,
    PassportModule,
  ],
  controllers: [CandidateApplicationController],
  providers: [
    CandidateApplicationService,
    JobService,
    PermissionService,
    // EventsGateway,
    JwtService,
  ],
})
export class CandidateApplicationModule {}
