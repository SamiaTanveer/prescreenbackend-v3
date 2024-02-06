import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notifications,
  NotificationsSchema,
} from './entities/notification.entity';
import { WebGatewayModule } from 'src/webgateway/gateway.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Notifications.name,
        schema: NotificationsSchema,
      },
    ]),
    WebGatewayModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
