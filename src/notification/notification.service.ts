import { Injectable } from '@nestjs/common';
// import { CreateNotificationDto } from './dto/create-notification.dto';
// import { EventsGateway } from 'src/gateway/events.gateway';

@Injectable()
export class NotificationService {
  // async create(createNotificationDto: CreateNotificationDto) {
  //   const createdNot = await this.notification.create({
  //     data: {
  //       message: createNotificationDto.notification,
  //       Author: { connect: { id: createNotificationDto.authorId } },
  //       Conversation: { connect: { id: createNotificationDto.conversationID } },
  //     },
  //   });
  //   this.eventGateway.sendNotification(createdNot);
  //   return createdNot;
  // }
}
