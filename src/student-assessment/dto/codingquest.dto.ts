import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class CodingQuestionType {
  @ApiProperty({
    description: 'ref id for the question',
  })
  @IsNotEmpty()
  @IsString()
  questionId: string;
  @ApiProperty({
    description: 'answer given by the candidate',
  })
  @IsNotEmpty()
  @IsString()
  answer: string;
  @ApiProperty({
    description: 'choosen language',
  })
  @IsNotEmpty()
  @IsString()
  language: string;
}
