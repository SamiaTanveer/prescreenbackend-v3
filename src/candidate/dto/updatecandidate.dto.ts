import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Picture } from 'src/utils/classes';

class SkillObj {
  @ApiProperty({ example: 'skillname', description: 'The name of the skill' })
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    example: 30,
    description: 'The proficiency level of the skill',
  })
  proficiencyLevel: number;
}
export class JobSeekingStatusDto {
  @ApiProperty({ example: 'notLooking', description: 'job seeking status' })
  @IsNotEmpty()
  @IsEnum(['activelyLooking', 'openToOpportunities', 'notLooking'])
  jobSeekingStatus: string;
}

class EducationDetail {
  @ApiProperty({ description: 'The degree obtained or currently studying for' })
  degree: string;
  @ApiProperty({ description: 'Description of the education details' })
  description: string;
  @ApiProperty({ description: 'The field of study for the education' })
  fieldOfStudy: string;
  @ApiProperty({ description: 'The institute where the education was pursued' })
  institute: string;
  @ApiProperty({ description: 'The start date of the education' })
  startDate: string;
  @ApiProperty({ description: 'The end date of the education' })
  @IsOptional()
  endDate: string;
  @ApiProperty({
    description:
      'Indicates if the candidate is currently studying for this degree',
  })
  currentlyStudying: boolean;
}

class Experience {
  @ApiProperty({ description: 'The title of the experience' })
  title: string;
  @ApiProperty({ description: 'The company name of the experience' })
  companyName: string;
  @ApiProperty({
    description:
      'Indicates if the candidate is currently working in this position',
  })
  currentlyWorking: boolean;
  @ApiProperty({ description: 'Description of the experience' })
  description: string;
  @ApiProperty({
    enum: ['full-time', 'part-time', 'remote', 'internship', 'contract'],
    description: 'The type of employment for the experience',
  })
  employmentType: string;
  @ApiProperty({ description: 'The location of the experience' })
  location: string;
  @ApiProperty({
    enum: ['onsite', 'remote', 'hybrid'],
    description: 'The type of job for the experience',
  })
  jobType: string;
  @ApiProperty({ description: 'The start date of the experience' })
  startDate: string;
  @ApiProperty({ description: 'The end date of the experience' })
  endDate: string;
}

export class UpdateCandidate {
  @ApiProperty({
    example: 'john Doe',
    description: 'The name of the candidate',
  })
  @IsOptional()
  name: string;
  @ApiProperty({
    example: 'johnDoe@xyz.abc',
    description: 'The email of the candidate',
  })
  @IsEmail()
  @IsOptional()
  email: string;
  @ApiProperty({
    example: 'password',
    description: 'The password of the candidate',
  })
  @IsEmail()
  @IsOptional()
  password: string;
  @ApiProperty({ description: 'The phone number of the candidate' })
  @IsOptional()
  phone: string;
  @ApiProperty({ example: 'male', description: 'The gender of the candidate' })
  @IsOptional()
  gender: string;
  @ApiProperty({
    example: new Date(),
    description: 'Date of Birth of candidate',
  })
  @IsOptional()
  DOB: Date;
  @ApiProperty({
    description: 'The address of the candidate',
  })
  @IsOptional()
  address: string;
  @ApiProperty({
    example: 'Faisalabad',
    description: 'The city of the candidate',
  })
  @IsOptional()
  city: string;
  @ApiProperty({
    example: 'Pakistan',
    description: 'The country of the candidate',
  })
  @IsOptional()
  country: string;
  @ApiProperty({ description: 'The country proficiency in languages' })
  @IsOptional()
  language: string[];
  @ApiProperty({ description: 'The nationality of the candidate' })
  @IsOptional()
  nationality: string;
  @ApiProperty({ description: 'Previous job title if any' })
  @IsOptional()
  previousJobTitle?: string;
  @ApiProperty({ description: 'The LinkedIn profile of the candidate' })
  @IsOptional()
  linkedin: string;
  @ApiProperty({ description: 'The instagram profile of the candidate' })
  @IsOptional()
  instagram: string;
  @ApiProperty({ description: 'The twitter profile of the candidate' })
  @IsOptional()
  twitter: string;
  @ApiProperty({ description: 'The facebook profile of the candidate' })
  @IsOptional()
  facebook: string;
  @ApiProperty({
    description: 'Additional Information to send to companies when applying',
  })
  @IsOptional()
  addInfo?: string;
  @ApiProperty({ description: 'The portfolio site of the candidate' })
  @IsOptional()
  portfolioSite: string;
  @ApiProperty({ description: 'The CV URL of the candidate' })
  @IsOptional()
  cvUrl: Picture;
  @ApiProperty({ description: 'The cover letter URL of the candidate' })
  @IsOptional()
  coverLetterUrl: Picture;
  @ApiProperty({ description: 'The avatar URL of the candidate' })
  @IsOptional()
  avatar: Picture;
  @ApiProperty({ type: SkillObj, description: 'The skills of the candidate' })
  @IsOptional()
  skills: SkillObj;
  @ApiProperty({
    type: EducationDetail,
    description: 'The education details of the candidate',
  })
  @IsOptional()
  educationDetails: EducationDetail;
  @ApiProperty({
    type: Experience,
    description: 'The experiences of the candidate',
  })
  @IsOptional()
  experiences: Experience;
}
export class CandidateInfoUpdate {
  @ApiPropertyOptional({
    example: 'john Doe',
    description: 'The name of the candidate',
  })
  @IsOptional()
  name: string;

  @ApiPropertyOptional({ description: 'The phone number of the candidate' })
  @IsOptional()
  phone: string;

  @ApiPropertyOptional({
    example: 'male',
    description: 'The gender of the candidate',
  })
  @IsOptional()
  gender: string;

  @ApiPropertyOptional({
    example: new Date(),
    description: 'Date of Birth of candidate',
  })
  @IsOptional()
  DOB: Date;

  @ApiPropertyOptional({
    example: 'Pakistan',
    description: 'The country of the candidate',
  })
  @IsOptional()
  country: string;

  @ApiPropertyOptional({
    example: 'Faisalabad',
    description: 'The city of the candidate',
  })
  @IsOptional()
  city: string;

  @ApiPropertyOptional({
    example: 'this is address',
    description: 'The address of the candidate',
  })
  @IsOptional()
  address: string;

  @ApiPropertyOptional({ description: 'The country proficiency in languages' })
  @IsOptional()
  language: string[];

  @ApiPropertyOptional({ description: 'The LinkedIn profile of the candidate' })
  @IsOptional()
  linkedin: string;

  @ApiPropertyOptional({
    description: 'The instagram profile of the candidate',
  })
  @IsOptional()
  instagram: string;

  @ApiPropertyOptional({ description: 'The twitter profile of the candidate' })
  @IsOptional()
  twitter: string;

  @ApiPropertyOptional({ description: 'The facebook profile of the candidate' })
  @IsOptional()
  facebook: string;

  @ApiPropertyOptional({ description: 'about me lines are here' })
  @IsOptional()
  aboutMe: string;

  @ApiPropertyOptional({ description: 'Previous job title if any' })
  @IsOptional()
  previousJobTitle: string;

  @ApiPropertyOptional({
    description: 'Additional Information to send to companies when applying',
  })
  @IsOptional()
  addInfo: string;

  @ApiPropertyOptional({ description: 'The portfolio site of the candidate' })
  @IsOptional()
  portfolioSite: string;

  @ApiPropertyOptional({ description: 'The CV URL of the candidate' })
  @IsOptional()
  cvUrl: Picture;

  // @ApiPropertyOptional({ description: 'The cover letter URL of the candidate' })
  // @IsOptional()
  // coverImg: Picture;

  @ApiPropertyOptional({ description: 'The avatar URL of the candidate' })
  @IsOptional()
  avatar: Picture;
}

export class Qualifications {
  @ApiPropertyOptional({
    type: [SkillObj],
    description: 'The skills of the candidate',
  })
  @IsOptional()
  skills: SkillObj[];
  @ApiPropertyOptional({
    type: EducationDetail,
    description: 'The education details of the candidate',
  })
  @IsOptional()
  educationDetails: EducationDetail;
  @ApiPropertyOptional({
    type: Experience,
    description: 'The experiences of the candidate',
  })
  @IsOptional()
  experiences: Experience;
}

export class UpdateLoginDetail {
  @ApiProperty({
    example: 'johnDoe@xyz.abc',
    description: 'The email of the candidate',
  })
  @IsEmail()
  @IsOptional()
  email: string;
  @ApiProperty({
    example: 'password',
    description: 'The password of the candidate',
  })
  @IsEmail()
  @IsOptional()
  password: string;
}
