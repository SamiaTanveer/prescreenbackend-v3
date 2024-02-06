import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdatePlanDto {
  @ApiProperty({
    description: 'Subscription plan ref id',
    example: '6536da1550d3307ff6e2ca2e',
  })
  @IsNotEmpty()
  SubscriptionPlan: string;

  @ApiProperty({
    description: 'monthly or yearly',
    example: 'monthly',
  })
  @IsNotEmpty()
  planCycle: string;

  @ApiHideProperty()
  subscriptionEndDate?: Date;

  @ApiHideProperty()
  subscriptionStartDate?: Date;

  @ApiPropertyOptional({ type: String, description: 'payment intent ID' })
  intentId?: string;
}
