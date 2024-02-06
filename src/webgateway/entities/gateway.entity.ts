// export class Gateway {}
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConnectionDocument = Connections & Document;

@Schema({
  timestamps: true,
})
export class Connections {
  @Prop({ required: true })
  userId: string;

  // @Prop({ required: true })
  // socketId: string;
}

export const ConnectionsSchema = SchemaFactory.createForClass(Connections);
