import { PartialType } from '@nestjs/swagger';
import { CreateSubPlanRestrictionDto } from './create-sub-plan-restriction.dto';

export class UpdateSubPlanRestrictionDto extends PartialType(CreateSubPlanRestrictionDto) {}
