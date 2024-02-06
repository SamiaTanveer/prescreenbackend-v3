import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class Pricing {
  @ApiProperty({ example: 'monthly', description: 'monthly or yearly' })
  @IsNotEmpty()
  @IsString()
  cycleName: string;

  @ApiProperty({ example: 12, description: 'number of months payable' })
  @IsNotEmpty()
  @IsString()
  cycle: number;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsString()
  price: number;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsString()
  percentage: number;
}
export class PlanDiscountDto {
  @ApiProperty({ example: 'refid', description: 'cycle refid' })
  @IsNotEmpty()
  @IsString()
  cycle: string;

  @ApiProperty({ example: 10, description: 'percentage for the discount' })
  @IsNotEmpty()
  @IsNumber()
  percentage: number;
}
export class CouponDiscountDto {
  @ApiProperty({ example: 'refid', description: 'cycle refid' })
  @IsNotEmpty()
  @IsString()
  cycle: string;

  @ApiProperty({
    description: 'start date of coupon',
    example: '2024-01-05T10:32:29.089+00:00',
  })
  @IsNotEmpty({ message: 'start_date cannot be empty' })
  start_date: Date;

  @ApiProperty({
    description: 'End date of coupon',
    example: '2024-01-05T10:32:29.089+00:00',
  })
  @IsNotEmpty()
  end_date: Date;

  @ApiProperty({
    description: 'coupon percentage for the plans',
    example: '10',
  })
  @IsNotEmpty()
  @IsNumber()
  percentage: number;

  @ApiHideProperty()
  type: string;

  @ApiHideProperty()
  SubscriptionPlan: string;

  @ApiProperty({
    description: 'coupon code',
    example: 'NewYearFest20',
  })
  @IsNotEmpty()
  couponCode: string;

  @ApiProperty({
    description: 'max_users',
    example: 20,
  })
  @IsNotEmpty()
  @IsNumber()
  max_users: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Array of user ref IDs',
    example: ['user_id_1', 'user_id_2'],
  })
  @IsArray()
  @IsOptional()
  assignedCompanyUsers?: string[];
}

export class CreateSubscriptionPlanDto {
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
      testBank: false,
      testsAllowed: 'Unlimited',
      assessmentsAllowed: '10',
      jobsAllowed: 'Unlimited',
      invitesAllowed: '10',
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
    jobsAllowed: string;
    assessmentsAllowed: string;
    invitesAllowed: string;
  };

  @ApiHideProperty()
  isActive: boolean;

  @ApiProperty({
    example: 12,
    description: 'Monthly Price',
  })
  @IsNumber()
  priceMonthly: number;

  @ApiProperty({
    type: [PlanDiscountDto],
    example: [
      { cycle: '6596a1525b3ee9e9c2a1a754', percentage: 4 },
      { cycle: '6596a15c5b3ee9e9c2a1a757', percentage: 2 },
      { cycle: '6596a1665b3ee9e9c2a1a75a', percentage: 6 },
      { cycle: '659a7516d2907718e3564e58', percentage: 3 },
    ],
    description: 'Discount objects',
  })
  @ValidateNested({ each: true })
  @Type(() => PlanDiscountDto)
  @IsNotEmpty()
  @ArrayMinSize(1)
  discounts: PlanDiscountDto[];

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
        percentage: 10,
        cycle: '6596a15c5b3ee9e9c2a1a757',
        start_date: new Date(),
        end_date: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days added
        couponCode: 'codeNew',
        max_users: 120,
      },
    ],
    description: 'Coupon objects',
  })
  coupons?: CouponDiscountDto[];

  // @ApiProperty({
  //   isArray: true,
  //   type: [Pricing],
  //   example: [
  //     { cycleName: 'monthly', price: 10, cycle: 3 },
  //     { cycleName: 'yearly', price: 100, cycle: 12 },
  //   ],
  //   description: 'Pricing options',
  // })
  // @IsNotEmpty()
  // @IsArray()
  @ApiHideProperty()
  pricing: Pricing[];

  // @ApiProperty({
  //   example: 12,
  //   description: 'Discount Percentage',
  // })
  // discountPercent: number;
}
