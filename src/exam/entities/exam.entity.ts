import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Company } from 'src/company/entities/company.entity';
import { Difficulty } from '../dto/create-exam.dto';

@Schema({ timestamps: true })
export class Exam extends Document {
  @Prop({ unique: true })
  title: string;

  @Prop({ enum: ['general', 'private'] })
  examType: string;

  @Prop()
  description: string;

  @Prop()
  totalTime: number;

  @Prop()
  language: string;

  // @Prop()
  // totalMarks: number;

  @Prop()
  passingPercent: number;

  @Prop()
  mcqDifficultyComposition: Difficulty;

  @Prop()
  codingDifficultyComposition: Difficulty;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }])
  tags: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company' })
  createdBy: Company;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
