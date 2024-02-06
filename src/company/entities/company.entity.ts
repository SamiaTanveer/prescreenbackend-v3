import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/user/entities/user.entity';

@Schema({ timestamps: true })
export class Company extends Document {
  @Prop({
    type: {
      url: String,
      path: String,
      originalname: String,
    },
  })
  logo: {
    url: string;
    path: string;
    originalname: string;
  };

  @Prop({
    type: {
      url: String,
      path: String,
      originalname: String,
    },
  })
  banner: {
    url: string;
    path: string;
    originalname: string;
  };

  @Prop({ unique: true })
  name: string;

  @Prop({ unique: true, message: 'User with this email already exists' })
  email: string;

  @Prop()
  industry: string;

  @Prop()
  phone: string;

  @Prop()
  website: string;

  @Prop({ default: '' })
  companyCategory: string;

  @Prop({ default: '' })
  linkedin: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  content: string;

  @Prop({ default: '' })
  foundedDate: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  city: string;

  @Prop({ default: '' })
  country: string;

  @Prop({ default: '' })
  instagram: string;

  @Prop({ default: '' })
  twitter: string;

  @Prop({ default: '' })
  facebook: string;

  @Prop({
    type: [
      {
        url: String,
        path: String,
        originalname: String,
      },
    ],
  })
  photos: {
    url: string;
    path: string;
    originalname: string;
  }[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;
}
export const CompanySchema = SchemaFactory.createForClass(Company);
