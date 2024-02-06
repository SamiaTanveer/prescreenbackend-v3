import { PartialType } from '@nestjs/swagger';
import { CreateFeedbackFormDto } from './create-feedback.dto';

export class UpdateFeedbackDto extends PartialType(CreateFeedbackFormDto) {}
