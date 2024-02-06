import { PartialType } from '@nestjs/swagger';
import { CreateStudentAssessmentDto } from './create-student-assessment.dto';

export class UpdateStudentAssessmentDto extends PartialType(
  CreateStudentAssessmentDto,
) {}
