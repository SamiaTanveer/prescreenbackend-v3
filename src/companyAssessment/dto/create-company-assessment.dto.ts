import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class Difficulty {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: '12' })
  easy: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: '20' })
  medium: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: '13' })
  hard: number;
}

export class CreateCompanyAssessmentDto {
  @ApiProperty({
    example: 'assessment name here',
    description: 'Assessment name here',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  // @ApiProperty({
  //   example: '656ef80118869b17ea5e16a0',
  //   description: 'Job you are hiring for ref id',
  // })
  // @IsNotEmpty()
  // @IsString()
  // job: string;

  @ApiProperty({
    example: ['refid1', 'refid 2'],
    description: 'ref ids of selected Tests',
  })
  @IsArray()
  tests: string[];

  @ApiHideProperty()
  createdBy: string;

  @ApiHideProperty()
  updatedBy: string;

  // more fields to come in future
}
