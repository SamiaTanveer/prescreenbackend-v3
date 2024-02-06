import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/user/entities/user.entity';

@Schema({ timestamps: true })
export class Request extends Document {
  @Prop({ enum: ['benefit', 'category', 'skill'] })
  type: string;
  // @Prop()
  // title: string;
  // @Prop()
  // description: string;
  // @Prop()
  // name: string;
  // @Prop({
  //   type: {
  //     url: String,
  //     path: String,
  //     originalname: String,
  //   },
  // })
  // icon: {
  //   url: string;
  //   path: string;
  //   originalname: string;
  // };
  // @Prop()
  // skillTitle: string;
  @Prop({ enum: ['accepted', 'pending', 'rejected'] })
  requestStatus: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  requestedBy: User;

  @Prop({
    type: {
      title: String,
      description: String,
      name: String,
      icon: { url: String, path: String, originalname: String },
      skillTitle: String,
    },
  })
  requestField: {
    title: string;
    description: string;
    name: string;
    icon: {
      url: string;
      path: string;
      originalname: string;
    };
    skillTitle: string;
  };
}
export const RequestSchema = SchemaFactory.createForClass(Request);

// Async pre-save middleware
// RequestSchema.pre('save', async function (this: Request, next) {
//   // Add dynamic fields based on the type
//   if (this.type === 'benefit') {
//     this.requestField = {
//       title: String,
//       description: String,
//     };
//   } else if (this.type === 'category') {
//     console.log('inside category');
//     this.requestField = {
//       name: String,
//       icon: {
//         url: String,
//         path: String,
//         originalname: String,
//       },
//     };
//   } else if (this.type === 'skill') {
//     this.requestField = {
//       skillTitle: String,
//     };
//   }

//   // Continue with the save operation if validation passes
//   next();
// });

// // Async pre-save middleware
// RequestSchema.pre('save', async function (this: Request, next) {
//   if (this.type === 'benefit' && (!this.title || !this.description)) {
//     throw new Error('Title and description are required for type "benefit".');
//   } else if (this.type === 'category' && (!this.name || !this.icon)) {
//     throw new Error('Name and icon are required for type "category".');
//   } else if (this.type === 'skill' && !this.skillTitle) {
//     throw new Error('Title is required for type "skill".');
//   }

//   // Continue with the save operation if validation passes
//   next();
// });

//-----------------------------------------
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, Schema as MongooseSchema } from 'mongoose';
// import { User } from 'src/user/entities/user.entity';

// @Schema({ timestamps: true })
// export class Request extends Document {
//   @Prop({ enum: ['benefit', 'category'] })
//   type: string;

//   @Prop()
//   title: string;

//   @Prop()
//   description: string;

//   @Prop()
//   name: string;

//   @Prop({
//     type: {
//       url: String,
//       path: String,
//       originalname: String,
//     },
//   })
//   icon: {
//     url: string;
//     path: string;
//     originalname: string;
//   };

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
//   user: User;
// }
// export const RequestSchema = SchemaFactory.createForClass(Request);

// // Async pre-save middleware
// RequestSchema.pre('save', async function (this: Request, next) {
//   if (this.type === 'benefit' && (!this.title || !this.description)) {
//     throw new Error('Title and description are required for type "benefit".');
//   } else if (this.type === 'category' && (!this.name || !this.icon)) {
//     throw new Error('Name and icon are required for type "category".');
//   }

//   // Continue with the save operation if validation passes
//   next();
// });

// --------------------------------------
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import mongoose, { Document } from 'mongoose';
// import { User } from 'src/user/entities/user.entity';
// import { HookNextFunction } from 'mongoose';

// @Schema()
// export class Request extends Document {
//   @Prop({ enum: ['benefit', 'category'] })
//   type: string;

//   @Prop()
//   title: string;

//   @Prop()
//   description: string;

//   @Prop()
//   name: string;

//   @Prop()
//   icon: string;

//   @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
//   user: User;

//   // Async pre-save middleware
//   @Schema().pre('save')
//   async validateType(next: HookNextFunction) {
//     if (this.type === 'benefit' && (!this.title || !this.description)) {
//       throw new Error('Title and description are required for type "benefit".');
//     } else if (this.type === 'category' && (!this.name || !this.icon)) {
//       throw new Error('Name and icon are required for type "category".');
//     }

//     // Continue with the save operation if validation passes
//     next();
//   }
// }

// export const RequestSchema = SchemaFactory.createForClass(Request);
