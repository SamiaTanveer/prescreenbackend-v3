import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Test } from 'src/Test/entities/Test.entity';
// import { Job } from 'src/job/entities/job.entity';
import { User } from 'src/user/entities/user.entity';

@Schema({ timestamps: true })
export class CompanyAssessment extends Document {
  @Prop({ unique: true })
  name: string;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job' })
  // job: Job;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }])
  tests: Test[];

  // more fields to come in future

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  updatedBy: User;
}

export const CompanyAssessmentSchema =
  SchemaFactory.createForClass(CompanyAssessment);
