import {
  ApiProperty,
  ApiHideProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, MinLength, IsOptional } from 'class-validator';
export class CandidateDto {
  @ApiProperty({
    example: 'testing',
    description: 'The name of the candidate',
  })
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    example: 'testing@gmail.com',
    description: 'The email of the candidate',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter valid email' })
  email: string;
  @ApiProperty({
    example: '+923008648940',
    description: 'The phone number of the candidate',
  })
  @IsNotEmpty()
  phone: string;
  @ApiProperty({ example: 'male', description: 'The gender of the candidate' })
  @IsNotEmpty()
  gender: string;
  @ApiProperty({
    example: 'password',
    description: 'The password of the candidate',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
  @ApiHideProperty()
  @IsOptional()
  createdBy: string;
  @ApiProperty({
    example: 'true',
    description: 'isSocialLogin or not',
  })
  @ApiPropertyOptional()
  @IsOptional()
  isSocialLogin?: boolean;
}
