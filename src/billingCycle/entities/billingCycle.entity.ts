import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class BillingCycle extends Document {
  @Prop()
  name: string;

  @Prop()
  cycle: number;
}
export const BillingCycleSchema = SchemaFactory.createForClass(BillingCycle);

// @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'companySubscription' })
// subscriptionPlan: companySubscription;
