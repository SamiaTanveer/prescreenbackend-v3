import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  // TODO: why
  @ApiPropertyOptional({
    description: 'The id of tag',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  _id?: string;

  @ApiProperty({
    example: 'JavaScript',
    description: 'The name of tag',
  })
  @IsString()
  @IsNotEmpty()
  tagName: string;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  user: string;
  // createdBy: string;
}

export class TagsAnalytics extends CreateTagDto {
  @ApiProperty({ type: Number })
  mcqCount: number;
  @ApiProperty({ type: Number })
  codingQuestionCount: number;
  @ApiProperty({ type: Number })
  examsCount: number;
}
