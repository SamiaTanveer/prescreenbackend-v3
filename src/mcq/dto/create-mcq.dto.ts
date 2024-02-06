import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayMinSize,
  IsOptional,
  ArrayMaxSize,
} from 'class-validator';
import { CreateTagDto } from 'src/tag/dto/create-tag.dto';

export class CreateMCQDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Sample MCQ Question',
    description: 'The title of the MCQ',
  })
  title: string;

  @ApiHideProperty()
  questionType: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'description',
    description: 'extra information for the MCQ',
  })
  description: string;

  @ApiProperty({
    example: ['Option A', 'Option B', 'Option C', 'Option D'],
    description: 'Array of options for the MCQ',
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(2, { message: 'At least two options are required' })
  @ArrayMaxSize(10, { message: '10 Options can be given at least' })
  options: string[];

  @ApiProperty({
    example: 'Option A',
    description: 'The correct option for the MCQ',
  })
  @IsNotEmpty()
  @IsString()
  correctOption: string;

  @ApiProperty({
    example: 'easy',
    description: 'easy, medium or hard',
  })
  @IsNotEmpty()
  @IsString()
  difficultyLevel: string;

  @ApiProperty({
    example: 'JavaScript',
    description: 'Language MCQ falls in',
  })
  @IsNotEmpty()
  language: string;

  @ApiProperty({
    example: '652194b0b14d13342cb3c77e',
    description: 'ref id for tag',
  })
  // @IsString({ each: true })
  tag: string;

  @ApiHideProperty()
  createdBy: string;

  @ApiHideProperty()
  updatedBy: string;
}

// export class CreateMcqDtoArray {
//   @ValidateNested({ each: true })
//   @Type(() => CreateMCQDto)
//   mcqs: CreateMCQDto[];
// }

export class MCQDtoResponse {
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  questionType: string;
  @ApiProperty()
  question: string;
  @ApiProperty()
  options: string[];
  @ApiProperty()
  correctOption: string;
  @ApiProperty()
  difficultyLevel: string;
  @ApiProperty()
  language: string;
  @ApiProperty()
  tag: string;
  @ApiProperty()
  createdBy: string;
  @ApiProperty()
  updatedBy: string;
  @ApiProperty()
  _id: string;
}

export class ResponseMCQDto {
  @ApiProperty({ type: [MCQDtoResponse] })
  mcqQuestions: MCQDtoResponse[];

  @ApiProperty({ type: Number })
  total: number;
}
