import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({
    example: 'Javascript',
    description: 'Skill name',
  })
  @IsNotEmpty()
  title: string;

  // @ApiHideProperty()
  // createdBy: string;

  // @ApiHideProperty()
  // updatedBy: string;
}
