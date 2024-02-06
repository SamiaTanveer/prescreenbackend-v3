import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/user/entities/user.entity';

@Schema()
export class SdkEntity {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  companyUser: string | User;

  @Prop({ required: true, unique: true })
  apiKey: string;

  @Prop({ default: 0 })
  apiCalls: number;

  @Prop({ default: 100 })
  apiCallLimit: number;

  @Prop({ type: [Date], default: [] })
  apiCallTimestamps: Date[];

  @Prop({ default: Date.now() })
  startDate: Date;

  @Prop({ required: true })
  expirationDate: Date;
}

export const SdkSchema = SchemaFactory.createForClass(SdkEntity);
