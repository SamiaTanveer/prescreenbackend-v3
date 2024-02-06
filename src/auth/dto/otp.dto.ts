import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class OtpDto {
  @ApiProperty({
    example: 'someone@gmail.com',
    description: 'The Email of the candidate',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please Provide Valid email' })
  email: string;

  @ApiProperty({
    example: '111222',
    description: 'OTP received in email',
  })
  @IsString()
  @IsNotEmpty()
  OTP: string;
}
