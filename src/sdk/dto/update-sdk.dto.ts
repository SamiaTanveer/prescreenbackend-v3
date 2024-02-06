import { PartialType } from '@nestjs/swagger';
import { CreateSdkDto } from './create-sdk.dto';

export class UpdateFeedbackDto extends PartialType(CreateSdkDto) {}
