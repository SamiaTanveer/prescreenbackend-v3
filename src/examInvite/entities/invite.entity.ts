import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Job } from 'src/job/entities/job.entity';

@Schema()
export class AssessmentInvite {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job' })
  job: Job;

  @Prop()
  email: string;

  @Prop()
  expiryTime: Date;

  @Prop({ unique: true })
  identifier: string;
}

export const AssessmentInviteSchema =
  SchemaFactory.createForClass(AssessmentInvite);
