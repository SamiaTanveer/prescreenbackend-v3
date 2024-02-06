import { PartialType } from '@nestjs/mapped-types';
import { CreateWebGatewayDto } from './create-gateway.dto';

export class UpdateWebGatewayDto extends PartialType(CreateWebGatewayDto) {
  id: number;
}
