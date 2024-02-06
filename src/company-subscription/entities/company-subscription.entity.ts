import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { SubscriptionPlan } from 'src/subscription-plan/entities/subscription-plan.entity';
import { User } from 'src/user/entities/user.entity';

@Schema({ timestamps: true })
export class companySubscription extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  company: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' })
  SubscriptionPlan: SubscriptionPlan;

  @Prop({
    type: Object,
    default: {
      mcqsBank: false,
      codingBank: false,
      testsBank: false,
      testsAllowed: 'Unlimited',
      assessmentsAllowed: 'Unlimited',
      jobsAllowed: 'Unlimited',
      invitesAllowed: 'Unlimited',
    },
  })
  featuresAllowed: {
    mcqsBank: boolean;
    codingBank: boolean;
    testBank: boolean;
    testsAllowed: string;
    assessmentsAllowed: string;
    jobsAllowed: string;
    invitesAllowed: string;
  };

  @Prop({
    type: Object,
    default: {
      // mcqsBank: false,
      // codingBank: false,
      // examBank: false,
      testsAllowed: '0',
      assessmentsAllowed: '0',
      jobsAllowed: '0',
      invitesUsed: '0',
    },
  })
  featuresUsed: {
    testsUsed: string;
    assessmentsUsed: string;
    jobsUsed: string;
    invitesUsed: string;
  };

  @Prop({ type: Object })
  billingInformation?: {
    cardNumber: string;
    cardHolderName: string;
  };

  @Prop()
  subscriptionStartDate: Date;

  @Prop()
  subscriptionEndDate?: Date;

  @Prop({
    type: String,
    enum: ['active', 'inActive', 'expired'],
  })
  subscriptionStatus: string;

  @Prop({ default: [] })
  paymentIntentIds?: string[];
}

export const companySubscriptionSchema =
  SchemaFactory.createForClass(companySubscription);
