import { PartialType } from '@nestjs/swagger';
import { CreateCouponDto } from './create-discount.dto';

// export class UpdateDiscountDto  {}
export class UpdateDiscountDto extends PartialType(CreateCouponDto) {}
