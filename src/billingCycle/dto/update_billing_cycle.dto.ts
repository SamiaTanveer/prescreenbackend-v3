import { PartialType } from '@nestjs/swagger';
import { CreateBillingCycleDto } from './create_billing_cycle.dto';

export class UpdateBillingCycleDto extends PartialType(CreateBillingCycleDto) {}
