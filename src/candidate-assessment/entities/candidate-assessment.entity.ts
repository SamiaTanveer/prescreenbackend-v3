import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { CodingQuestion } from 'src/coding-question/entities/coding-question.entity';
import { Exam } from 'src/exam/entities/exam.entity';
import { Job } from 'src/job/entities/job.entity';
import { MCQ } from 'src/mcq/entities/mcq.entity';

@Schema({ timestamps: true })
export class CandidateAssessment extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  candidate: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' })
  exam: Exam;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job' })
  job: Job;

  @Prop([
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MCQ',
      },
      answer: String,
      correct: Boolean,
    },
  ])
  mcqQuestions: {
    questionId: string;
    answer: string;
    correct: boolean;
  }[];

  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MCQ',
    },
  ])
  mcqs: MCQ[];

  @Prop([
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CodingQuestion',
      },
      answer: String,
      correct: Boolean,
    },
  ])
  codingQuestions: {
    questionId: string;
    answer: string;
    correct?: boolean;
  }[];

  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodingQuestion',
    },
  ])
  codings: CodingQuestion[];

  @Prop()
  score: number;

  @Prop({ enum: ['pending', 'completed', 'passed', 'failed'] })
  status: string;

  @Prop()
  feedback: string;
  @Prop({
    type: {
      index: Number,
      activeMcqs: Boolean,
      activeCoding: Boolean,
      // mcqtimeLeft: Number,
      totalTime: Number,
      isFinished: Boolean,
      attempts: Number,
      points: Number,
      obtainPercentage: Number,
      remainingTime: Number,
      individualTime: [Number],
      // individualTime: [[Number]],
    },
    default: {
      index: 0,
      // mcqtimeLeft: 0,
      activeMcqs: false,
      totalTime: 0,
      activeCoding: false,
      isFinished: false,
      attempts: 0,
      points: 0,
      obtainPercentage: 0,
      remainingTime: 0,
      individualTime: [0],
      // individualTime: [[]],
    },
  })
  testPointer: {
    index: number;
    // mcqtimeLeft: number;
    activeMcqs: boolean;
    activeCoding: boolean;
    totalTime: number;
    isFinished: boolean;
    attempts: number;
    points: number;
    obtainPercentage: number;
    remainingTime: number;
    individualTime: number[];
    // individualTime: number[][];
  };

  @Prop({ type: [String] })
  snapShots: string[];
}
export const CandidateAssessmentSchema =
  SchemaFactory.createForClass(CandidateAssessment);
