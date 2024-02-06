import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './entities/project.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { CandidateService } from 'src/candidate/candidate.service';
import {
  Candidate,
  CandidateSchema,
} from 'src/candidate/entities/candidate.entity';
import { User, UserSchema } from 'src/user/entities/user.entity';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from 'src/candidate-application/entities/candidate-application.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Project.name,
        schema: ProjectSchema,
      },
      {
        name: CandidateApplication.name,
        schema: CandidateApplicationSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Candidate.name,
        schema: CandidateSchema,
      },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService, CandidateService],
})
export class ProjectModule {}
