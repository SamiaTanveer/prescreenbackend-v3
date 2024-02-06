import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class template {
  @ApiProperty({
    description: 'template language of question',
  })
  templatesLanguage: string;

  @ApiProperty({
    description: 'template of question',
  })
  template: string;
}
export class question {
  @ApiProperty({
    description: 'id of question',
  })
  _id: string;

  @ApiProperty({
    description: 'title of The question',
  })
  title: string;

  @ApiProperty({
    description: 'title of The question',
  })
  templates: template[];

  @ApiProperty({
    description: 'options of the mcq question',
  })
  options: string[];
}

export class codingQuestion {
  @ApiProperty({
    description: 'question',
    type: question,
  })
  question: question;

  @ApiPropertyOptional({
    description: 'Indicates whether the question is a coding question or not',
  })
  @IsOptional()
  isCodingQuestion?: boolean;

  @ApiProperty({
    description: 'question index',
  })
  @IsOptional()
  questionIndex: number;

  @ApiProperty({
    description: 'remaining time',
  })
  @IsOptional()
  remainingTime: number;

  @ApiProperty({
    description: 'Indicates whether the question ended or not',
  })
  @IsOptional()
  isFinished: boolean;
}

export class ExamMcqQuestion {
  @ApiProperty({
    description: 'question',
    type: question,
  })
  question: question;

  @ApiPropertyOptional({
    description: 'Indicates whether the question is a coding question or not',
  })
  @IsOptional()
  isCodingQuestion?: boolean;

  @ApiProperty({
    description: 'question index',
  })
  @IsOptional()
  questionIndex: number;

  @ApiProperty({
    description: 'remaining time',
  })
  @IsOptional()
  remainingTime: number;

  @ApiProperty({
    description: 'Indicates whether the question ended or not',
  })
  @IsOptional()
  isFinished: boolean;
}
