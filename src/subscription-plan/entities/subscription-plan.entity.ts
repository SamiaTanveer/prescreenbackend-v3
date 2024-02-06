import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';
import { Discount } from 'src/discounts/entities/discount.entity';

@Schema({
  timestamps: true,
})
export class SubscriptionPlan extends Document {
  @Prop({ unique: true })
  planTitle: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  priceMonthly: number;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Discount' }],
    default: [],
  })
  discounts: Discount[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Discount' }],
    default: [],
  })
  coupons: Discount[];

  @Prop({
    type: {
      mcqsBank: Boolean,
      codingBank: Boolean,
      testBank: Boolean,
      testsAllowed: { type: String },
      jobsAllowed: { type: String },
      assessmentsAllowed: { type: String },
      invitesAllowed: { type: String },
    },
  })
  featuresAllowed: {
    mcqsBank: boolean;
    codingBank: boolean;
    testBank: boolean;
    testsAllowed: string;
    jobsAllowed: string;
    assessmentsAllowed: string;
    invitesAllowed: string;
  };

  @Prop({
    type: [
      {
        cycleName: String,
        cycle: Number,
        price: Number,
        percentage: Number,
      },
    ],
    default: [],
  })
  pricing: PricingEntity[];

  // @Prop([
  //   {
  //     billingCycle: { type: String, enum: ['monthly', 'yearly'] },
  //     price: Number,
  //   },
  // ])
  // pricing: { billingCycle: string; price: number }[];
}

export const SubscriptionPlanSchema =
  SchemaFactory.createForClass(SubscriptionPlan);

export class PricingEntity {
  @ApiProperty()
  cycleName: string;
  @ApiProperty()
  cycle: number;
  @ApiProperty()
  price: number;
  @ApiProperty()
  percentage: number;
}
