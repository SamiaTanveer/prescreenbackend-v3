import { PartialType } from '@nestjs/swagger';
import { CreateCompanyAssessmentDto } from './create-company-assessment.dto';

export class UpdateComAssessmentDto extends PartialType(
  CreateCompanyAssessmentDto,
) {}
