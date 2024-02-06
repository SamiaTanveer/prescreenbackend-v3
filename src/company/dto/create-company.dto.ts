import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, MinLength, IsOptional } from 'class-validator';
import { Picture } from 'src/utils/classes';
// import { Picture } from 'src/utils/classes';

export class CompanyDto {
  @ApiProperty({
    example: 'Google',
    description: 'Company name',
  })
  @IsNotEmpty()
  name: string;

  // @ApiProperty({
  //   description: 'Company Logo',
  //   type: Picture,
  // })
  @ApiHideProperty()
  @IsOptional()
  logo: Picture;

  @ApiProperty({
    example: 'someone@gmail.com',
    description: 'Company Email',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Web3',
    description: 'Industry name in which your company falls',
  })
  @IsNotEmpty()
  industry: string;

  @ApiProperty({
    example: '+923008764803',
    description: 'Company phone',
  })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'http://mywebsite.pk',
    description: 'Company Website',
  })
  @IsNotEmpty()
  website: string;

  @ApiProperty({
    example: 'password',
    description: 'Password for the company',
  })
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiHideProperty()
  @IsOptional()
  createdBy: string;
}
