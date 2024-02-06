import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CandidateApplicationDto {
  @ApiHideProperty()
  // {example: 'applied',
  // description: 'applied viewed interviewing offered rejected'}
  @IsOptional()
  status: string;

  @ApiProperty({ description: 'The id of the Job' })
  @IsNotEmpty()
  job: string;
}
