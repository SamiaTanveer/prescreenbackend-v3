import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    example: 'viewed',
    description: 'applied viewed interviewing offered rejected',
  })
  @IsNotEmpty()
  status: string;
}
