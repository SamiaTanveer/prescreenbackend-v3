import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Difficulty {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: '12' })
  easy: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: '20' })
  medium: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: '13' })
  hard: number;
}

export class ExamDto {
  @ApiProperty({
    example: 'this is a id of exam',
    description: 'The id of the Exam.',
  })
  _id: string;

  @ApiProperty({
    example: 'this is a Title',
    description: 'The title of the Exam.',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Sample Description',
    description: 'The description of the Exam.',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '72',
    description: 'The passing percentage for the Exam.',
  })
  @IsNotEmpty()
  @IsNumber()
  passingPercent: number;

  // @ApiProperty({
  //   example: '23',
  //   description: 'Total marks of Exam',
  // })
  // @IsNotEmpty()
  // @IsNumber()
  // totalMarks: number;

  @ApiProperty({
    example: '30',
    description: 'Duration Minutes for Exam.',
  })
  @IsNotEmpty()
  @IsNumber()
  totalTime: number;

  @ApiProperty({
    example: 'Data Structures',
    description: 'Language for Exam.',
  })
  @IsNotEmpty()
  language: string;

  @ApiProperty({
    example: { easy: 5, medium: 10, hard: 12 },
    description: 'easy medium hard',
  })
  @IsObject()
  mcqDifficultyComposition: Difficulty;

  @ApiProperty({
    example: { easy: 5, medium: 10, hard: 12 },
    description: 'easy or medium or hard',
  })
  @IsObject()
  codingDifficultyComposition: Difficulty;

  @ApiProperty({
    example: ['651531aed0e92404e54183d8'],
    description: 'ref ids for tags',
  })
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({
    description: 'The id of the user',
  })
  @IsOptional()
  createdBy: string;
}
