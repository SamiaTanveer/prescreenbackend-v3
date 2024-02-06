// import {
//   WebSocketGateway,
//   SubscribeMessage,
//   MessageBody,
// } from '@nestjs/websockets';
// import { GatewayService } from './gateway.service';
// import { CreateWebGatewayDto } from './dto/create-gateway.dto';
// // import { UpdateGatewayDto } from './dto/update-gateway.dto';

// @WebSocketGateway()
// export class GatewayGateway {
//   constructor(private readonly gatewayService: GatewayService) {}

//   @SubscribeMessage('createGateway')
//   create(@MessageBody() createGatewayDto: CreateWebGatewayDto) {
//     return this.gatewayService.create(createGatewayDto);
//   }
// }
