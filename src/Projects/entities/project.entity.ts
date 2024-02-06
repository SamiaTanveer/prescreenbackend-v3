import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/user/entities/user.entity';

@Schema()
export class Project extends Document {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  liveUrl: string;

  @Prop({
    type: {
      url: String,
      path: String,
      originalname: String,
    },
  })
  projectPic: {
    url: string;
    path: string;
    originalname: string;
  };

  @Prop()
  skillsUsed: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
}
export const ProjectSchema = SchemaFactory.createForClass(Project);
