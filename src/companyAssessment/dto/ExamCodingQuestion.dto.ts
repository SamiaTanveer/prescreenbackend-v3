import { ApiProperty } from '@nestjs/swagger';

export class ExamCodingQuestion {
  @ApiProperty({
    description: 'id of question',
  })
  _id: string;

  @ApiProperty({
    description: 'The coding question data',
  })
  title: string;

  @ApiProperty({
    description: 'The description',
  })
  description: string;

  @ApiProperty({
    description: 'The challenge code',
  })
  challengeCode: string;

  // @ApiProperty({
  //   description: 'Indicates whether the question is a coding question',
  // })
  // isCodingQuestion: boolean;

  // @ApiProperty({
  //   description: 'Indicates whether the question ended or not',
  // })
  // isFinished: boolean;
}
