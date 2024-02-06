import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
enum EmploymentTypeEnum {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  REMOTE = 'remote',
  INTERNSHIP = 'internship',
  CONTRACT = 'contract',
}
export class CreateJobDto {
  @ApiProperty({
    example: 'MERN Stack Developer',
    description: 'Job Title',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: ['full-time', 'remote'],
    type: [String],
    description: '[full-time, part-time, remote, internship, contract]',
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(EmploymentTypeEnum, { each: true })
  employmentType: string[];

  @ApiProperty({
    example: '1000',
    description: 'Salary range in this format',
  })
  @ApiPropertyOptional()
  @IsNotEmpty()
  MinSalaryRange: string;

  @ApiProperty({
    example: '4000',
    description: 'Salary range in this format',
  })
  @ApiPropertyOptional()
  @IsNotEmpty()
  MaxSalaryRange: string;

  @ApiProperty({
    description: 'Deadlne of Job application',
  })
  @ApiPropertyOptional()
  @IsNotEmpty()
  applicationDeadline: Date;

  @ApiProperty({
    type: [String],
    example: ['658d5d446cb5afca3091d11d'],
    description: 'ref id of categories',
  })
  categories: string[];

  @ApiProperty({
    type: [String],
    example: ['658d5d6c6cb5afca3091d126'],
    description: 'ref id of the required skills',
  })
  requiredSkills: string[];

  @ApiProperty({
    example: 'This is description',
    description: 'Job Description',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'this is responsibilites',
    description: 'responsibilites descriptions',
  })
  @IsNotEmpty()
  responsibilities: string;

  @ApiProperty({
    example: 'who you are description',
    description: 'who you are description here',
  })
  @IsNotEmpty()
  whoYouAre: string;

  @ApiProperty({
    example: 'Nice to haves description',
    description: 'Nice to have descriptions here',
  })
  @IsNotEmpty()
  niceToHave: string;

  @ApiProperty({
    type: [String],
    example: ['658d5d606cb5afca3091d122'],
    description: 'ref id of the benefits included',
  })
  benefits: string[];

  @ApiProperty({
    example: 'Fsd Pakistan',
    description: 'Job location',
  })
  @ApiPropertyOptional()
  @IsNotEmpty()
  location: string;

  // @ApiProperty({
  //   example: 'onsite',
  //   description: '[onsite, remote, hybrid]',
  // })
  // @ApiPropertyOptional()
  // @IsNotEmpty()
  // jobType: string;

  @ApiHideProperty()
  jobStatus: string;

  @ApiProperty({
    example: '6537592a552324cffd18e864',
    description: 'ref id for the Assessment',
  })
  @IsNotEmpty()
  @IsString()
  companyAssessment: string;

  @ApiHideProperty()
  @IsOptional()
  applications: string[];

  @ApiHideProperty()
  createdBy: string | CreatedBY;

  @ApiHideProperty()
  updatedBy: string;
}

export class CreatedBY {
  company: { name: string; _id: string; email: string; industry: string };
}
