import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { Request, RequestSchema } from './entities/request.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionService } from 'src/permissions/permission.service';
import {
  PermissionUserSchema,
  PermissionsUserModel,
} from 'src/permissions/entities/permission.entity';
import { Benefit, BenefitSchema } from 'src/benefits/entities/benefit.entity';
import { BenefitsService } from 'src/benefits/benefits.service';
import { CategoriesService } from 'src/categories/categories.service';
import { Job, jobSchema } from 'src/job/entities/job.entity';
import {
  Category,
  CategorySchema,
} from 'src/categories/entities/category.entity';
import { Skill, SkillSchema } from 'src/skills/entities/skill.entity';
import { SkillService } from 'src/skills/skill.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Request.name,
        schema: RequestSchema,
      },
      {
        name: Benefit.name,
        schema: BenefitSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
      {
        name: Skill.name,
        schema: SkillSchema,
      },
      {
        name: Job.name,
        schema: jobSchema,
      },
      {
        name: PermissionsUserModel.name,
        schema: PermissionUserSchema,
      },
    ]),
  ],
  controllers: [RequestController],
  providers: [
    RequestService,
    BenefitsService,
    CategoriesService,
    SkillService,
    PermissionService,
  ],
})
export class RequestModule {}
