import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class CreateFeedbackFormDto {
  @ApiProperty({
    description: 'Feedback Questions for the feedback form',
    type: [String],
  })
  @IsArray()
  questions: string[];
  // @ApiProperty({
  //   example: 'The test was very good!',
  //   description: 'Feedback message for the exam',
  // })
  // @IsNotEmpty()
  // @IsString()
  // message: string;
  //   @ApiHideProperty()
  // this id is of company
  // @ApiProperty({
  //   description: 'company id',
  // })
  // @IsNotEmpty()
  // company: string;
  // This id is of LOGGED IN USER MODEL
  // @ApiHideProperty()
  // candidate: string;
  //   @ApiHideProperty()
  // @ApiProperty({
  //   description: 'Exam id',
  // })
  // @IsNotEmpty()
  // exam: string;
}
