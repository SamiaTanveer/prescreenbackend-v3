import {
  ApiHideProperty,
  ApiPropertyOptional,
  ApiProperty,
} from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Test } from 'src/Test/entities/Test.entity';

export class TestPointerDto {
  @ApiPropertyOptional()
  index?: number;

  @ApiPropertyOptional()
  current?: boolean;

  @ApiPropertyOptional()
  serverStartTime?: Date;

  @ApiPropertyOptional()
  expEndTime?: Date;

  @ApiPropertyOptional()
  clientStartTime?: Date;

  @ApiHideProperty()
  isFinished?: boolean;

  @ApiHideProperty()
  obtainPercentage?: number;

  @ApiHideProperty()
  quesAnswers?: QuesAnswersDto[];

  @ApiHideProperty()
  questSchemas?: string;

  @ApiHideProperty()
  testId: Test;
}

export class QuesAnswersDto {
  @ApiPropertyOptional()
  questionId: string;

  @ApiPropertyOptional()
  answer?: string;

  @ApiPropertyOptional()
  isCorrect?: boolean;

  @ApiPropertyOptional()
  timeTaken?: number;
}

export class CreateStudentAssessmentDto {
  @ApiProperty({
    description: 'The ID of the companyAssessment',
  })
  @IsNotEmpty()
  @IsString()
  companyAssessment: string;

  @ApiProperty({
    description: 'The ID of the job',
  })
  @IsNotEmpty()
  @IsString()
  job: string;

  @ApiHideProperty()
  AssessmentStartTime: Date;

  @ApiHideProperty()
  AssessmentExpEndTime: Date;

  @ApiHideProperty()
  attempts: number;

  // @ApiProperty({
  //   description: 'Status of the assessment',
  //   enum: ['pending', 'completed', 'passed', 'failed'],
  // })
  // @IsNotEmpty()
  // @IsEnum(['pending', 'completed', 'passed', 'failed'])
  // status: string;

  // @ApiProperty({
  //   description: 'Test pointers array details',
  //   type: [TestPointerDto],
  // })
  @ApiHideProperty()
  testPointers: TestPointerDto[];
}
