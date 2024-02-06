import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateTestDto {
  @ApiProperty({
    example: 'Basic Coding Knowledge',
    description: 'Test name',
  })
  @IsString()
  testName: string;

  @ApiProperty({
    example: 'Mcq',
    description: 'Mcq, codingQuestion etc',
  })
  @IsString()
  testType: string;

  @ApiProperty({
    example: '652194b0b14d13342cb3c77e',
    description: 'ref id of tag',
  })
  @IsString()
  tag: string;

  @ApiProperty({
    example: 'javascript',
    description: 'lanugage name',
  })
  @IsString()
  language: string;

  @ApiPropertyOptional({
    example: 'description for the test',
    description: 'description for the test',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiHideProperty()
  type: string;

  @ApiProperty({
    example: 10,
    description: 'Easy Composition for type of test',
  })
  @IsNumber()
  compositionEasy: number;

  @ApiProperty({
    example: 20,
    description: 'medium Composition for type of test',
  })
  @IsNumber()
  compositionMedium: number;

  @ApiProperty({
    example: 30,
    description: 'hard Composition for type of test',
  })
  @IsNumber()
  compositionHard: number;

  @ApiProperty({
    example: 30,
    description: 'total Time for the Test(minutes)',
  })
  @IsNumber()
  totalTime: number;

  @ApiProperty({
    example: 60,
    description: 'percentage to pass Test',
  })
  @IsNumber()
  passingPercentage: number;

  @ApiHideProperty()
  createdBy: string;

  @ApiHideProperty()
  @IsOptional()
  updatedBy: string;
}

export class CreateManualTestDto {
  @ApiProperty({
    example: 'Basic Coding Knowledge',
    description: 'Test name',
  })
  @IsString()
  testName: string;

  @ApiProperty({
    example: 'Mcq',
    description: 'Mcq, codingQuestion etc',
  })
  @IsString()
  testType: string;

  @ApiProperty({
    example: '652194b0b14d13342cb3c77e',
    description: 'ref id of tag',
  })
  @IsString()
  tag: string;

  @ApiProperty({
    example: 'javascript',
    description: 'lanugage name',
  })
  @IsString()
  language: string;

  @ApiPropertyOptional({
    example: 'description for the test',
    description: 'description for the test',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiHideProperty()
  type: string;

  @ApiProperty()
  @IsArray()
  customQuestions: string[];

  @ApiHideProperty()
  customQuestionsType: string;

  @ApiProperty({
    example: 30,
    description: 'total Time for the Test(minutes)',
  })
  @IsNumber()
  totalTime: number;

  @ApiProperty({
    example: 60,
    description: 'percentage to pass Test',
  })
  @IsNumber()
  passingPercentage: number;

  @ApiHideProperty()
  createdBy: string;

  @ApiHideProperty()
  @IsOptional()
  updatedBy: string;
}
