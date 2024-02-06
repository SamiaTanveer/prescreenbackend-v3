import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AssessmentFeedback,
  AssessmentFeedbackFeedbackSchema,
} from './entities/assessment-feedback.entity';
import { AssessmentFeedbackController } from './assessment-feedback.controller';
import { AssessmentFeedbackService } from './assessment-feedback.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: AssessmentFeedback.name,
        schema: AssessmentFeedbackFeedbackSchema,
      },
    ]),
  ],
  controllers: [AssessmentFeedbackController],
  providers: [AssessmentFeedbackService],
})
export class AssessmentFeedbackModule {}
