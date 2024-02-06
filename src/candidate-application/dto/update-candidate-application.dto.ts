import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CandidateApplicationDto } from './create-candidate-application.dto';
import { IsOptional } from 'class-validator';

export class UpdateCandidateApplicationDto extends PartialType(
  CandidateApplicationDto,
) {
  @ApiProperty({ description: 'The id of the candidate Assessment' })
  @IsOptional()
  candidate_assessment?: string;
}
