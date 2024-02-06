import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Exam } from 'src/exam/entities/exam.entity';
// import { User } from 'src/user/entities/user.schema';

@Schema()
export class CandidateFeedback {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  candidate: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' })
  exam: Exam;
  @Prop([
    {
      feedbackQuestion: String,
      rating: Number,
      suggestion: String,
    },
  ])
  feedbacks: {
    feedbackQuestion: string;
    rating: number;
    suggestion: string;
  }[];
}

export const CandidateFeedbackSchema =
  SchemaFactory.createForClass(CandidateFeedback);
