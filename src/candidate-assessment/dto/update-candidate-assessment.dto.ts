import { PartialType } from '@nestjs/swagger';
import { UpdateCandidateAssessment } from './updateAssessment.dto';

export class UpdateCandidateAssessmentDto extends PartialType(
  UpdateCandidateAssessment,
) {}
