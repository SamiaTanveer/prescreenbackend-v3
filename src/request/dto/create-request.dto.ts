import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { RequestData } from 'src/utils/classes';

export class CreateRequestDto {
  @ApiProperty({
    example: 'benefit',
    description: 'benefit, category or skill',
  })
  type: string;

  @ApiProperty({
    // example: 'benefit',
    description: 'benefit, category or skill',
  })
  requestField: RequestData;

  @ApiHideProperty()
  requestStatus: string;

  @ApiHideProperty()
  requestedBy: string;
}
