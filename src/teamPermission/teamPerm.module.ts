import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Job, jobSchema } from 'src/job/entities/job.entity';
import {
  TeamPermission,
  TeamPermissionSchema,
} from './entities/teamPermission.entity';
import { TeamPermController } from './teamPerm.controller';
import { TeamPermissionService } from './teamPerm.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: TeamPermission.name,
        schema: TeamPermissionSchema,
      },
      { name: Job.name, schema: jobSchema },
    ]),
  ],
  controllers: [TeamPermController],
  providers: [TeamPermissionService],
})
export class TeamPermissionModule {}
