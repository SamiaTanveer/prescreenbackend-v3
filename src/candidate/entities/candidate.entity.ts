import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Project } from 'src/Projects/entities/project.entity';
import { User } from 'src/user/entities/user.entity';

@Schema({ timestamps: true })
export class Candidate extends Document {
  @Prop()
  name: string;
  @Prop()
  email: string;
  @Prop()
  phone: string;
  @Prop()
  gender: string;
  @Prop()
  DOB: Date;
  @Prop()
  country: string;
  @Prop()
  city: string;
  @Prop()
  address: string;
  @Prop()
  language: string[];
  @Prop()
  previousJobTitle: string;
  @Prop()
  linkedin: string;
  @Prop()
  instagram: string;
  @Prop()
  twitter: string;
  @Prop()
  facebook: string;
  @Prop()
  aboutMe: string;
  @Prop()
  portfolioSite: string;
  @Prop()
  addInfo: string;
  @Prop({
    type: {
      url: String,
      path: String,
      originalname: String,
    },
  })
  cvUrl: {
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
  coverLetterUrl: {
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
  avatar: {
    url: string;
    path: string;
    originalname: string;
  };

  @Prop({ type: [{ name: String, proficiencyLevel: Number }] })
  skills: {
    name: string;
    proficiencyLevel: number;
  }[];

  @Prop({
    type: [
      {
        degree: String,
        description: String,
        fieldOfStudy: String,
        institute: String,
        startDate: String,
        endDate: String,
        currentlyStudying: Boolean,
      },
    ],
  })
  educationDetails: {
    degree: string;
    description: string;
    fieldOfStudy: string;
    institute: string;
    startDate: string;
    endDate: string;
    currentlyStudying: boolean;
  }[];

  @Prop({
    type: [
      {
        title: String,
        companyName: String,
        currentlyWorking: Boolean,
        description: String,
        employmentType: String,
        endDate: String,
        location: String,
        jobType: String,
        startDate: String,
      },
    ],
  })
  experiences: {
    title: string;
    companyName: string;
    currentlyWorking: boolean;
    description: string;
    employmentType: string;
    location: string;
    jobType: string;
    startDate: string;
    endDate: string;
  }[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }])
  projects: Project[];

  @Prop({
    type: String,
    enum: ['openToOpportunities', 'notLooking'],
    default: 'notLooking',
  })
  jobSeekingStatus: string;
}
export const CandidateSchema = SchemaFactory.createForClass(Candidate);
