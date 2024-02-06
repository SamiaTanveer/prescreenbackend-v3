import { Injectable } from '@nestjs/common';
import { CreateWebGatewayDto } from './dto/create-gateway.dto';
// import { UpdateGatewayDto } from './dto/update-gateway.dto';

@Injectable()
export class GatewayService {
  create(dto: CreateWebGatewayDto) {
    console.log(dto);
    return 'This action adds a new gateway';
  }
}
