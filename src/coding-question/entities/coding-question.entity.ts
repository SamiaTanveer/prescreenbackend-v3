import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Tag } from 'src/tag/entities/tag.entity';
import { User } from 'src/user/entities/user.entity';
import { Template } from 'src/utils/classes';
import { TestCase } from 'src/utils/types';

@Schema({ timestamps: true })
export class CodingQuestion extends Document {
  @Prop()
  title: string;

  @Prop({ enum: ['general', 'private'] })
  questionType: string;

  @Prop()
  description: string;

  @Prop()
  language: string;

  @Prop()
  templates: Template[];

  @Prop()
  functionName: string;

  @Prop([
    {
      input: String,
      output: String,
    },
  ])
  testCases: TestCase[];

  @Prop({ enum: ['easy', 'medium', 'hard'] })
  difficultyLevel: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' })
  tag: Tag;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  updatedBy: User;
}
export const CodingQuestionSchema =
  SchemaFactory.createForClass(CodingQuestion);
