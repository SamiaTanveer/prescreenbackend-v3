import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { FeedbackObject } from 'src/utils/classes';

export class CandidateFeedbackDto {
  @ApiProperty({
    description: 'candidate id',
    example: '6536da1550d3307ff6e2ca2e',
  })
  @IsNotEmpty()
  candidate: string;

  @ApiProperty({
    description: 'Exam id',
    example: '6536da1550d3307ff6e2ca2e',
  })
  @IsNotEmpty()
  exam: string;

  @ApiProperty({
    type: FeedbackObject,
  })
  feedback: FeedbackObject;
}
