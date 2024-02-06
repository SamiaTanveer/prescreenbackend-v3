import { PartialType } from '@nestjs/swagger';
import { CreateCompanySubscriptionDto } from './create-company-subscription.dto';

export class UpdateCompanySubscriptionDto extends PartialType(
  CreateCompanySubscriptionDto,
) {}
