import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateNormalDiscountDto {
  @ApiProperty({
    description: 'discount for the plan',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  percentage: number;

  @ApiProperty({
    description: 'billing cycle discount is applied on',
    example: 'monthly',
  })
  @IsNotEmpty()
  @IsString()
  cycleName: string;

  @ApiHideProperty()
  type: string;

  @ApiHideProperty()
  SubscriptionPlan: string;
}
export class CreateLimitedDiscountDto {
  @ApiProperty({
    description: 'start date of discount',
    example: '2023-12-13T10:32:29.089+00:00',
  })
  @IsNotEmpty({ message: 'start_date cannot be empty' })
  start_date: Date;

  @ApiProperty({
    description: 'End date of discount',
    example: '2023-12-28T10:32:29.089+00:00',
  })
  @IsNotEmpty()
  end_date: Date;

  @ApiProperty({
    description: 'discount for the plan',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  percentage: number;

  @ApiProperty({
    description: 'billing cycle discount is applied on',
    example: 'monthly',
  })
  @IsNotEmpty()
  @IsString()
  cycleName: string;

  @ApiHideProperty()
  CouponUsed: number;

  @ApiHideProperty()
  type: string;

  @ApiProperty({
    description: 'Subscription plan ref id',
    example: '6536da1550d3307ff6e2ca2e',
  })
  @IsString()
  // @ApiHideProperty()
  SubscriptionPlan: string;

  @ApiProperty({
    description: 'max_users',
    example: 20,
  })
  @IsNotEmpty()
  @IsNumber()
  max_users: number;
}

export class CreateCouponDto {
  @ApiProperty({
    description: 'billing cycle discount is applied on',
    example: 'monthly',
  })
  @IsNotEmpty()
  @IsString()
  cycleName: string;

  @ApiProperty({
    description: 'start date of coupon',
    example: '2023-12-13T10:32:29.089+00:00',
  })
  @IsNotEmpty({ message: 'start_date cannot be empty' })
  start_date: Date;

  @ApiProperty({
    description: 'End date of coupon',
    example: '2023-12-28T10:32:29.089+00:00',
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

  // @ApiProperty({
  //   description: 'Subscription plan ref id',
  //   example: '6536da1550d3307ff6e2ca2e',
  // })
  // @IsString()
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
