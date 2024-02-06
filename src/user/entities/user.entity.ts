import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Candidate } from 'src/candidate/entities/candidate.entity';
import { companySubscription } from 'src/company-subscription/entities/company-subscription.entity';
import { Company } from 'src/company/entities/company.entity';
import { companyTeamsEnums } from 'src/utils/classes';
@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop()
  name: string;
  @Prop({ unique: true, message: 'User with this email is already here' })
  email: string;
  @Prop()
  password: string;
  @Prop({ default: false })
  isSocialLogin: boolean;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company' })
  company: Company;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' })
  candidate: Candidate;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'companySubscription' })
  subscriptionPlan: companySubscription;
  @Prop({
    type: String,
    enum: [
      'company',
      companyTeamsEnums.member1,
      companyTeamsEnums.member2,
      'candidate',
      'superAdmin',
    ],
  })
  userType: string;
  @Prop()
  lastLogin: Date;
  @Prop()
  otp: string;
  @Prop()
  expiresAt: number;
  @Prop({ type: Boolean, default: false })
  isEmailVerified: boolean;
  @Prop({ type: Boolean, default: false })
  isBlocked: boolean;
  @Prop({ type: Boolean, default: false })
  isActive: boolean;
}
export const UserSchema = SchemaFactory.createForClass(User);
