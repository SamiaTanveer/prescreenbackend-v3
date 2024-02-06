import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponDiscountDto } from './create-subscription-plan.dto';
import {
  ArrayMinSize,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PricingEntity } from '../entities/subscription-plan.entity';

export class UpdateSubscriptionPlanDto {
  @ApiProperty({
    example: 'basic',
    description: 'basic, standard, or premium',
  })
  @IsNotEmpty()
  @IsString()
  planTitle: string;

  @ApiProperty({
    example: 'this is plan description',
    description: 'plan description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: {
      mcqsBank: false,
      codingBank: false,
      testsBank: false,
      testsAllowed: 'Unlimited',
      assessmentsAllowed: 'Unlimited',
      jobsAllowed: 'Unlimited',
      invitesAllowed: 'Unlimited',
    },
    description: 'Features allowed in the plan',
  })
  @IsNotEmpty()
  @IsObject()
  featuresAllowed: {
    mcqsBank: boolean;
    codingBank: boolean;
    testBank: boolean;
    testsAllowed: string;
    assessmentsAllowed: string;
    jobsAllowed: string;
    invitesAllowed: string;
  };

  @ApiProperty({
    example: 10,
    description: 'Monthly Price',
  })
  @IsNumber()
  priceMonthly: number;

  @ApiProperty({
    type: [PricingEntity],
    example: [
      { cycleName: 'annual', percentage: 3, price: 120, cycle: 12 },
      { cycleName: 'quaterly', percentage: 4, price: 30, cycle: 3 },
      { cycleName: 'biannual', percentage: 6, price: 60, cycle: 6 },
      { cycleName: 'monthly', percentage: 0, price: 10, cycle: 1 },
    ],
    description: 'Discount objects',
  })
  @ValidateNested({ each: true })
  @Type(() => PricingEntity)
  @IsNotEmpty()
  @ArrayMinSize(1)
  pricing: PricingEntity[];

  @ApiPropertyOptional({
    type: [CouponDiscountDto],
    example: [
      {
        cycle: '6596a1525b3ee9e9c2a1a754',
        percentage: 4,
        start_date: new Date(),
        end_date: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days added
        couponCode: 'newcode',
        max_users: 100,
      },
      {
        cycle: '6596a15c5b3ee9e9c2a1a757',
        percentage: 10,
        start_date: new Date(),
        end_date: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days added
        couponCode: 'codeNew',
        max_users: 120,
      },
    ],
    description: 'Coupon objects',
  })
  coupons?: CouponDiscountDto[];
}
