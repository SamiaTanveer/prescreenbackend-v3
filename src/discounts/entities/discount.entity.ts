import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { SubscriptionPlan } from 'src/subscription-plan/entities/subscription-plan.entity';

@Schema()
export class Discount extends Document {
  @Prop()
  percentage: number;

  @Prop()
  start_date: Date;

  @Prop()
  end_date: Date;

  @Prop()
  max_users: number;

  @Prop()
  CouponUsed: number;

  @Prop({ default: 'Discount', enum: ['Discount', 'Coupon', 'limited'] })
  type: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' })
  SubscriptionPlan: SubscriptionPlan;

  // Properties related to COUPONS
  @Prop()
  couponCode: string;

  // monthly, quarterly, annual
  @Prop()
  cycleName: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  assignedCompanyUsers: string[];
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);
