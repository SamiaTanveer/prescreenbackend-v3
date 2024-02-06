import { PartialType } from '@nestjs/swagger';
import { CreateTestDto } from './CreateTest.dto';

export class UpdateTestDto extends PartialType(CreateTestDto) {}
