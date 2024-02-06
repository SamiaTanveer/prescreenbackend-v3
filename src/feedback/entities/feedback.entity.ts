import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class FeedbackForm {
  // @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  // company: string;

  // @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  // candidate: string;

  // @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }])
  // exam: Exam;

  @Prop()
  questions: string[];
}

export const FeedbackFormSchema = SchemaFactory.createForClass(FeedbackForm);
