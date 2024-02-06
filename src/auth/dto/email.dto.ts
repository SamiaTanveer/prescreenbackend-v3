import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmailDto {
  @ApiProperty({
    example: 'someone@gmail.com',
    description: 'The Email Address',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please Provide Valid email' })
  email: string;
}
