import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import  { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ContactUs extends Document {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  companyname: string;

  @Prop()
  message: string;
}

export const ContactUsSchema = SchemaFactory.createForClass(ContactUs);
