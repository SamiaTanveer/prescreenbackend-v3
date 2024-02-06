import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
// import { GatewayGateway } from './gateway.gateway';
import { EventsGateway } from './events.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Connections, ConnectionsSchema } from './entities/gateway.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Connections.name, schema: ConnectionsSchema },
    ]),
  ],

  providers: [GatewayService, EventsGateway, JwtService],
  exports: [EventsGateway],
})
export class WebGatewayModule {}
