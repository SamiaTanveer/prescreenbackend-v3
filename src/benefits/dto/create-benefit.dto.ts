import { ApiProperty } from '@nestjs/swagger';

export class CreateBenefitDto {
  @ApiProperty({
    example: 'title',
    description: 'title of perks',
  })
  title: string;

  @ApiProperty({
    example: 'perks',
    description: 'detail of perks',
  })
  description: string;

  // @ApiHideProperty()
  // createdBy: string;
}
