import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import {
  Candidate,
  CandidateSchema,
} from 'src/candidate/entities/candidate.entity';
import { CandidateService } from 'src/candidate/candidate.service';
import { CandidateApplicationSchema } from 'src/candidate-application/entities/candidate-application.entity';
import { PermissionService } from 'src/permissions/permission.service';
import {
  PermissionUserSchema,
  PermissionsUserModel,
} from 'src/permissions/entities/permission.entity';
@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: Candidate.name,
        schema: CandidateSchema,
      },
      { name: 'CandidateApplication', schema: CandidateApplicationSchema },
      { name: PermissionsUserModel.name, schema: PermissionUserSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, CandidateService, PermissionService],
})
export class UserModule {}
