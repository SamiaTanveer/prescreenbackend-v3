import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/user/entities/user.entity';

@Schema()
export class Tag extends Document {
  @Prop()
  tagName: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
}
export const TagSchema = SchemaFactory.createForClass(Tag);
