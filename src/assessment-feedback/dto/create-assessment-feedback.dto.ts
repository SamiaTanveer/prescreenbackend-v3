import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class AssessmentFeedbackDto {
  @ApiHideProperty()
  user: string;

  @ApiProperty({
    description: 'assessment id',
    example: '6536da1550d3307ff6e2ca2e',
  })
  @IsNotEmpty()
  assessment: string;

  @ApiProperty({
    type: String,
  })
  comments: string;

  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  @Min(1, { message: 'Rating should be at least 1' })
  @Max(5, { message: 'Rating should be at most 5' })
  rating: number;
}
