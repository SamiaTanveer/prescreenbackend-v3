import { PartialType } from '@nestjs/swagger';
import { UpdateCandidate } from './updatecandidate.dto';

export class UpdateCandidateDto extends PartialType(UpdateCandidate) {}
