import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QuestionType {
  @ApiProperty({
    description: 'ref id for the question',
  })
  @IsNotEmpty()
  @IsString()
  questionId: string;

  @ApiProperty({
    description: 'answer given by the candidate',
  })
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiProperty({
    description: 'Language',
  })
  @ApiPropertyOptional()
  @IsOptional()
  language?: string;
}

export class CreateCandidateAssessmentDto {
  @ApiProperty({
    description: 'The ID of the exam',
  })
  @IsNotEmpty()
  @IsString()
  exam: string;

  @ApiProperty({
    description: 'The ID of the job',
  })
  @IsNotEmpty()
  @IsString()
  job: string;

  @ApiHideProperty()
  // @ApiProperty({
  //   description: 'The answer to the question',
  // })
  mcqQuestions: string[];

  @ApiHideProperty()
  // @ApiProperty({
  //   description: 'The answer to the question',
  // })
  codingQuestions: string[];

  @ApiHideProperty()
  snapShots: string[];
}
