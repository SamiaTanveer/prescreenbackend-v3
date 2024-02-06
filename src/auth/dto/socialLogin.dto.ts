import { ApiProperty } from '@nestjs/swagger';
// import { IsEmail, IsNotEmpty } from 'class-validator';

export class socialLoginDto {
  @ApiProperty({
    example: 'someone@gmail.com',
    description: 'The Email Address',
  })
  //   @IsNotEmpty()
  //   @IsEmail()
  email: string;
}
