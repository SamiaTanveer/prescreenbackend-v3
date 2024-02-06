import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/user/entities/user.entity';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ type: String })
  categoryName: string;

  @Prop({
    type: {
      url: String,
      path: String,
      originalname: String,
    },
  })
  icon: {
    url: string;
    path: string;
    originalname: string;
  };

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;
}
export const CategorySchema = SchemaFactory.createForClass(Category);
