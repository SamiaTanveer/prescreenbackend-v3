import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBillingCycleDto {
  @ApiProperty({
    description: 'quaterly / monthly / yearly / 2 years / bi annual',
    example: 'quaterly',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({ description: 'cycle', example: 3 })
  @IsNotEmpty()
  @IsNumber()
  cycle: number;
}
