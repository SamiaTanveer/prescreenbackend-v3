import { IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

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

export class CreateExamDto {
  @ApiProperty({
    example: 'this is a Title',
    description: 'The title of the Exam.',
  })
  @IsNotEmpty()
  title: string;

  @ApiHideProperty()
  //   {
  //   example: 'general',
  //   description: 'general or private',
  // }
  // @IsNotEmpty()
  // @IsString()
  examType: string;

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
    example: '651531aed0e92404e54183d8',
    description: 'ref ids for tags',
  })
  // @IsString({ each: true })
  tag: string;

  // @ApiProperty({
  //   example: 'active',
  //   description: 'active or inactive',
  // })
  // status: string;

  @ApiHideProperty()
  @IsOptional()
  createdBy: string;
}
