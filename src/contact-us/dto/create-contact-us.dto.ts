import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateContactUsDto {
  //name
  @ApiProperty({
    example: 'Toor Ahmad',
    description: 'Full Name',
  })
  @IsNotEmpty()
  name: string;

  //email
  @ApiProperty({
    example: 'someone@gmail.com',
    description: 'Company Email',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  //phone
  @ApiProperty({
    example: '+923008764803',
    description: 'Phone Number',
  })
  @IsNotEmpty()
  phone: string;

  //company name
  @ApiProperty({
    example: 'abc Company',
    description: 'Company Name',
  })
  @IsNotEmpty()
  companyname: string;

  //message
  @ApiProperty({
    example:
      'Hi, abc company or candidate .I am looking for job or run Company',
    description: 'Message',
  })
  @IsNotEmpty()
  message: string;
}
