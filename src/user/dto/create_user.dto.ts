import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, MinLength, IsOptional } from 'class-validator';
export class CreateUserDto {
  @ApiProperty({ description: 'Name of the user' })
  @IsNotEmpty()
  @IsOptional()
  @MinLength(8)
  name?: string;
  @ApiProperty({ description: 'Email of the user' })
  @IsEmail({}, { message: 'Please enter valid email' })
  email: string;
  @ApiProperty({ description: 'Password of the user' })
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
  @IsNotEmpty()
  @IsOptional()
  company?: string;
  @IsNotEmpty()
  @IsOptional()
  candidate?: string;
  @IsNotEmpty()
  @IsOptional()
  subscriptionPlan?: string;
  @ApiHideProperty()
  @IsOptional()
  isSocialLogin?: boolean;
  @ApiHideProperty()
  @IsOptional()
  isBlocked?: boolean;
  @ApiHideProperty()
  @IsOptional()
  isActive?: boolean;
  @ApiHideProperty()
  @IsOptional()
  userType?: string;
  @ApiHideProperty()
  @IsOptional()
  isEmailVerified?: boolean;
  // @IsNotEmpty()
  // lastLogin: Date;
}
