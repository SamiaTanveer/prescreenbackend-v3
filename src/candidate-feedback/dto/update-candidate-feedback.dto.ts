import { ApiProperty } from '@nestjs/swagger';
import { FeedbackObject } from 'src/utils/classes';

export class UpdateCandidateFeedbackDto {
  @ApiProperty({
    type: FeedbackObject,
  })
  feedback: FeedbackObject;
}
