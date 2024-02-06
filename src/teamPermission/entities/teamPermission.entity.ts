import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NewTemplatePerObj, UserRole } from 'src/utils/classes';

@Schema()
export class TeamPermission extends Document {
  @Prop({ enum: UserRole, required: true })
  roleTitle: string;

  @Prop()
  permissionsAllowed: NewTemplatePerObj;
}
export const TeamPermissionSchema =
  SchemaFactory.createForClass(TeamPermission);
