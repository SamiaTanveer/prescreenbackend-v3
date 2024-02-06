import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
export class changePasswordDto {
  @ApiProperty({
    example: 'thisisnewpassword',
    description: 'provide new password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;

  @ApiProperty({
    example: 'toor@gmail.com',
    description: 'provide Email address',
  })
  @IsEmail({}, { message: 'Please Provide Valid Email' })
  @IsNotEmpty()
  email: string;
}
