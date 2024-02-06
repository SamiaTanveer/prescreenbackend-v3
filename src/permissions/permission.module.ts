import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CompanyGuard } from 'src/auth/jwt.company.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import {
  PermissionUserSchema,
  PermissionsUserModel,
} from './entities/permission.entity';
import { UserService } from 'src/user/user.service';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { CandidateService } from 'src/candidate/candidate.service';
import {
  Candidate,
  CandidateSchema,
} from 'src/candidate/entities/candidate.entity';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from 'src/candidate-application/entities/candidate-application.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: PermissionsUserModel.name,
        schema: PermissionUserSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Candidate.name,
        schema: CandidateSchema,
      },
      {
        name: CandidateApplication.name,
        schema: CandidateApplicationSchema,
      },
    ]),
  ],
  controllers: [PermissionController],
  providers: [
    PermissionService,
    UserService,
    CompanyGuard,
    AdminGuard,
    CandidateService,
  ],
})
export class PermissionModule {}
