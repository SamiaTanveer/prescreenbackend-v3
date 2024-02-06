import { PartialType } from '@nestjs/swagger';
import { AssessmentFeedbackDto } from './create-assessment-feedback.dto';

export class UpdateAssessmentFeedbackDto extends PartialType(
  AssessmentFeedbackDto,
) {}
