import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateNewUserDto {
  @ApiProperty({ description: 'Name of the user' })
  @IsNotEmpty()
  @IsOptional()
  @MinLength(8)
  name: string;

  @ApiPropertyOptional({ description: 'Previous job title if any' })
  @IsOptional()
  previousJobTitle?: string;

  @ApiProperty({ description: 'Email of the user' })
  @IsEmail({}, { message: 'Please enter valid email' })
  email: string;

  @ApiProperty({ description: 'Password of the user' })
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password?: string;

  @IsNotEmpty()
  @IsOptional()
  candidate: string;

  @ApiHideProperty()
  @IsOptional()
  isSocialLogin: boolean;
}
