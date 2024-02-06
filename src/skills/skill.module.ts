import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UserModule } from 'src/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Skill, SkillSchema } from './entities/skill.entity';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { Job } from 'node-schedule';
import { jobSchema } from 'src/job/entities/job.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Skill.name, schema: SkillSchema },
      // {
      //   name: CandidateApplication.name,
      //   schema: CandidateApplicationSchema,
      // },
      // {
      //   name: User.name,
      //   schema: UserSchema,
      // },
      {
        name: Job.name,
        schema: jobSchema,
      },
    ]),
    CloudinaryModule,
    AuthModule,
    UserModule,
    ConfigModule,
  ],
  controllers: [SkillController],
  providers: [SkillService, ConfigService],
})
export class SkillModule {}
