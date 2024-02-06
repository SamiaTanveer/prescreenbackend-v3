import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';
import { Picture } from 'src/utils/classes';

export class UpdateCompanyyDto {
  @ApiProperty({
    description: 'Company logo',
  })
  @IsOptional()
  logo: Picture;

  @ApiProperty({
    description: 'Company banner',
  })
  @IsOptional()
  banner: Picture;

  @ApiProperty({
    example: 'Google',
    description: 'Company name',
  })
  @IsOptional()
  name: string;

  @ApiProperty({
    example: 'someone@company.com',
    description: 'Company Email',
  })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({
    example: 'Web3',
    description: 'Industry name in which your company falls',
  })
  @IsOptional()
  industry: string;

  @ApiProperty({
    description: 'Company phone',
  })
  @IsOptional()
  phone: string;

  @ApiProperty({
    example: 'https://company.com',
    description: 'Company Website',
  })
  @IsOptional()
  website: string;

  @ApiProperty({
    example: 'https://company.com/',
    description: 'Company Linkedin',
  })
  @IsOptional()
  linkedin: string;

  @ApiProperty({
    example: 'abc is a web3 company',
    description: 'Description for your company',
  })
  @IsOptional()
  description: string;

  @ApiProperty({
    example: 'more description',
    description: 'Any more content',
  })
  @IsOptional()
  content: string;

  @ApiProperty({
    example: '23 Aug, 2023',
    description: 'Fouded Date for company',
  })
  @IsOptional()
  foundedDate: string;

  @ApiProperty({
    description: '',
  })
  @IsOptional()
  _id?: string;

  @ApiProperty({
    example: '',
    description: 'Company address',
  })
  @IsOptional()
  address: string;

  @ApiProperty({
    example: 'New York',
    description: 'Company city',
  })
  @IsOptional()
  city: string;

  @ApiProperty({
    example: 'Pakistan',
    description: 'Company Country',
  })
  @IsOptional()
  country: string;

  @ApiProperty({
    description: 'Instagram Url',
  })
  @IsOptional()
  instagram: string;

  @ApiProperty({
    description: 'Twitter Url',
  })
  @IsOptional()
  twitter: string;

  @ApiProperty({
    description: 'Facebook Url',
  })
  @IsOptional()
  facebook: string;

  @ApiProperty({
    description: 'Company photos',
  })
  @IsOptional()
  photos: [Picture];
}
