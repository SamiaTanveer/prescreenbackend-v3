import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Job } from 'node-schedule';
import { CandidateApplication } from 'src/candidate-application/entities/candidate-application.entity';
import { CandidateAssessment } from 'src/candidate-assessment/entities/candidate-assessment.entity';
import { companySubscription } from 'src/company-subscription/entities/company-subscription.entity';
import { AssessmentInvite } from 'src/examInvite/entities/invite.entity';
import { User } from 'src/user/entities/user.entity';
import { Connections } from 'src/webgateway/entities/gateway.entity';

@Schema({
  timestamps: true,
})
export class Notifications {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Connections' })
  connection: Connections;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job' })
  job: Job;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CandidateApplication' })
  candidateApplication: CandidateApplication;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ExamInvite' })
  examInvite: AssessmentInvite;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CandidateAssessment' })
  candidateAssessement: CandidateAssessment;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'companySubscription' })
  companySubscription: companySubscription;
}

export const NotificationsSchema = SchemaFactory.createForClass(Notifications);
