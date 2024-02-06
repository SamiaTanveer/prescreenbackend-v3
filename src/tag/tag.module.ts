import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CompanyGuard } from 'src/auth/jwt.company.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { Tag, TagSchema } from './entities/tag.entity';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { MCQ, McqSchema } from 'src/mcq/entities/mcq.entity';
import {
  CodingQuestion,
  CodingQuestionSchema,
} from 'src/coding-question/entities/coding-question.entity';
import { Exam, ExamSchema } from 'src/exam/entities/exam.entity';
import { PermissionService } from 'src/permissions/permission.service';
import {
  PermissionUserSchema,
  PermissionsUserModel,
} from 'src/permissions/entities/permission.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Tag.name,
        schema: TagSchema,
      },
      {
        name: MCQ.name,
        schema: McqSchema,
      },
      {
        name: CodingQuestion.name,
        schema: CodingQuestionSchema,
      },
      {
        name: Exam.name,
        schema: ExamSchema,
      },
      {
        name: PermissionsUserModel.name,
        schema: PermissionUserSchema,
      },
    ]),
  ],
  controllers: [TagController],
  providers: [TagService, CompanyGuard, AdminGuard, PermissionService],
})
export class TagModule {}
