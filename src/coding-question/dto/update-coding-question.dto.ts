import { PartialType } from '@nestjs/swagger';
import { CodingQuestionDto } from './create-coding-question.dto';

export class UpdateCodingQuestionDto extends PartialType(CodingQuestionDto) {}
