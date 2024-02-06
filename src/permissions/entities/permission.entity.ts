import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { TeamPermission } from 'src/teamPermission/entities/teamPermission.entity';
import { User } from 'src/user/entities/user.entity';

@Schema()
export class PermissionsUserModel extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userCompany: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TeamPermission' })
  permission: TeamPermission;
}
export const PermissionUserSchema =
  SchemaFactory.createForClass(PermissionsUserModel);
