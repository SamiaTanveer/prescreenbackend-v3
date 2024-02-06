import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Test } from 'src/Test/entities/Test.entity';
import { CompanyAssessment } from 'src/companyAssessment/entities/companyAssessment.entity';
import { Job } from 'src/job/entities/job.entity';
import { User } from 'src/user/entities/user.entity';
import { TestStatuses } from 'src/utils/classes';

@Schema({ timestamps: true })
export class StudentAssessment extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userCandidate: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CompanyAssessment' })
  companyAssessment: CompanyAssessment;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job' })
  job: Job;

  @Prop()
  score: number;

  @Prop()
  attempts: number;

  @Prop()
  AssessmentStartTime: Date;

  @Prop()
  AssessmentExpEndTime: Date;

  @Prop()
  assessmentFinished: boolean;

  @Prop({ enum: ['pending', 'completed', 'passed', 'failed'] })
  status: string;

  @Prop([
    {
      type: {
        testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
        index: { type: Number, default: 0 },
        current: { type: Boolean, default: false },
        score: { type: Number, default: 0 },
        serverStartTime: Date,
        clientStartTime: Date,
        expEndTime: Date,
        remainTime: Date,
        testStatus: { type: String, default: 'notStarted' },
        isFinished: { type: Boolean, default: false },
        obtainPercentage: { type: Number, default: 0 },
        quesAnswers: [
          {
            questionId: { type: String, default: '' },
            answer: { type: String, default: '' },
            isCorrect: { type: Boolean, default: false },
            timeTaken: { type: Number, default: 0 },
          },
        ],
        questSchemas: {
          type: String,
          // required: true,
          enum: ['MCQ', 'CodingQuestion'],
        },
      },
    },
  ])
  testPointers: {
    testId: { type: mongoose.Schema.Types.ObjectId; ref: 'Test' };
    index: {
      type: number;
      default: 0;
    };
    current: {
      type: boolean;
      default: false;
    };
    score: {
      type: number;
      default: 0;
    };
    serverStartTime: Date;
    clientStartTime: Date;
    expEndTime: Date;
    remainTime: Date;
    isFinished: {
      type: boolean;
      default: false;
    };
    testStatus: {
      type: string;
      enum: ['notStarted', 'resume', 'completed'];
      default: 'notStarted';
    };
    obtainPercentage: {
      type: number;
      default: 0;
    };

    quesAnswers: {
      questionId: {
        type: mongoose.Schema.Types.ObjectId;
        refPath: 'questSchemas';
      };
      answer: {
        type: string;
        default: '';
      };
      isCorrect: {
        type: boolean;
        default: false;
      };
      timeTaken: {
        type: number;
        default: 0;
      };
    }[];

    questSchemas: {
      type: string;
      required: true;
      enum: ['MCQ', 'CodingQuestion', ''];
    };
  }[];
}
export const StudentAssessmentSchema =
  SchemaFactory.createForClass(StudentAssessment);
