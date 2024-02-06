import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { StudentAssessment } from 'src/student-assessment/entities/student-assessment.entity';
import { User } from 'src/user/entities/user.entity';

@Schema({ timestamps: true })
export class AssessmentFeedback {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'StudentAssessment' })
  assessment: StudentAssessment;

  @Prop({ type: String })
  comments: string;

  @Prop({ type: Number })
  rating: number;
}

export const AssessmentFeedbackFeedbackSchema =
  SchemaFactory.createForClass(AssessmentFeedback);
