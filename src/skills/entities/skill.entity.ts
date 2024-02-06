import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
// import { User } from 'src/user/entities/user.entity';

@Schema({ timestamps: true })
export class Skill extends Document {
  @Prop({ unique: true, message: 'Skill with this title already exists' })
  title: string;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  // updatedBy: User;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  // createdBy: User;
}
export const SkillSchema = SchemaFactory.createForClass(Skill);
