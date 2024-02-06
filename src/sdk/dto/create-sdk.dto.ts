import { ApiProperty } from '@nestjs/swagger';

export class CreateSdkDto {
  @ApiProperty({
    description: 'Feedback Questions for the feedback form',
    type: [String],
  })
  questions: string[];
}
