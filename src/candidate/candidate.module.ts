import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { Candidate, CandidateSchema } from './entities/candidate.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from 'src/candidate-application/entities/candidate-application.entity';
import { Company, CompanySchema } from 'src/company/entities/company.entity';
import { CompanyService } from 'src/company/company.service';
import { Job } from 'node-schedule';
import { jobSchema } from 'src/job/entities/job.entity';
import { UserService } from 'src/user/user.service';
import { ProjectService } from 'src/Projects/project.service';
import { Project, ProjectSchema } from 'src/Projects/entities/project.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Candidate.name,
        schema: CandidateSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      // {
      //   name: Company.name,
      //   schema: CompanySchema,
      // },
      {
        name: Job.name,
        schema: jobSchema,
      },
      {
        name: CandidateApplication.name,
        schema: CandidateApplicationSchema,
      },
      {
        name: Project.name,
        schema: ProjectSchema,
      },
    ]),
    CloudinaryModule,
    AuthModule,
    UserModule,
    PassportModule,
  ],
  controllers: [CandidateController],
  providers: [CandidateService, UserService, ProjectService],
})
export class CandidateModule {}
