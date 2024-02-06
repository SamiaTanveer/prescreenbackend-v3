import { PartialType } from '@nestjs/swagger';
import { CreateTeamPermDto } from './create-TeamPerm.dto';

export class UpdateTeamPermDto extends PartialType(CreateTeamPermDto) {}
