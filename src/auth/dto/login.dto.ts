import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class loginDto {
  @ApiProperty({
    example: 'saleem38482@gmail.com',
    description: 'The Email Address',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'saleem1234',
    description: 'Password for login',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
