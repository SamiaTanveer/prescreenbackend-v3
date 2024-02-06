import { ApiProperty } from '@nestjs/swagger';
import { Picture } from 'src/utils/classes';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'coding',
    description: 'name of category',
  })
  categoryName: string;

  @ApiProperty({
    description: 'icon picture',
  })
  icon: Picture;

  // @ApiHideProperty()
  // createdBy: string;
}
