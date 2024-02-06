import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
