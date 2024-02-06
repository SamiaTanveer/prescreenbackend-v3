import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Benefit } from 'src/benefits/entities/benefit.entity';
import { CandidateApplication } from 'src/candidate-application/entities/candidate-application.entity';
import { Category } from 'src/categories/entities/category.entity';
import { CompanyAssessment } from 'src/companyAssessment/entities/companyAssessment.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { User } from 'src/user/entities/user.entity';

@Schema({ timestamps: true })
export class Job {
  @Prop()
  title: string;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  approvalStatus: string;

  @Prop({
    type: [String],
    enum: ['full-time', 'part-time', 'remote', 'internship', 'contract'],
  })
  employmentType: string[];

  @Prop()
  MinSalaryRange: string;

  @Prop()
  MaxSalaryRange: string;

  @Prop()
  applicationDeadline: Date;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }])
  categories: Category[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }])
  requiredSkills: Skill[];

  @Prop()
  description: string;
  @Prop()
  responsibilities: string;
  @Prop()
  whoYouAre: string;
  @Prop()
  niceToHave: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Benefit' }])
  benefits: Benefit[];

  @Prop()
  location: string;

  @Prop({
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  })
  jobStatus: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CompanyAssessment' })
  companyAssessment: CompanyAssessment;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'CandidateApplication' }])
  applications: CandidateApplication[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  updatedBy: User;
}
export const jobSchema = SchemaFactory.createForClass(Job);
