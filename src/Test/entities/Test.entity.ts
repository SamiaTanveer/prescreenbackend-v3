import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { MCQ } from 'src/mcq/entities/mcq.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { User } from 'src/user/entities/user.entity';
import { CodingQuestion } from 'src/utils/classes';

@Schema({ timestamps: true })
export class Test extends Document {
  @Prop()
  testName: string;

  @Prop()
  testType: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' })
  tag: Tag;

  @Prop()
  language: string;

  @Prop()
  description: string;

  @Prop()
  compositionEasy: number;

  @Prop()
  compositionMedium: number;

  @Prop()
  compositionHard: number;

  @Prop({
    type: [{ type: String, refPath: 'customQuestionsType' }],
    default: undefined,
  })
  customQuestions: (MCQ | CodingQuestion)[];

  @Prop({ type: String, enum: ['MCQ', 'CodingQuestion'] })
  customQuestionsType: 'MCQ' | 'CodingQuestion';

  @Prop()
  totalTime: number;

  @Prop()
  passingPercentage: number;

  @Prop({ enum: ['private', 'general'] })
  type: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  updatedBy: User;
}
export const TestSchema = SchemaFactory.createForClass(Test);
