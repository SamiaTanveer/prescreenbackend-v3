import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CreateSubscriptionPlanDto } from 'src/subscription-plan/dto/create-subscription-plan.dto';

export class AuthUserDto {
  @ApiProperty({ description: 'Name of the user' })
  user: {
    email?: string;
    name: string;
    phone: string;
    _id: string;
    userType: string;
  };

  @ApiProperty({ description: 'subscribed plan of company' })
  subscriptionPlan: CreateSubscriptionPlanDto;

  @ApiProperty({ example: true, description: 'Verified user or not' })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Id of user' })
  userId: string;

  @ApiProperty({ description: 'Last Login info' })
  lastLogin: string;

  //   @ApiProperty({ description: 'Email of the user' })
  //   candidate: string;

  @ApiProperty({ description: 'User login type' })
  @IsNotEmpty()
  isSocialLogin: string;
}
