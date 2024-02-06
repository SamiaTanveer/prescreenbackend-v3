import { BadRequestException, UseFilters } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { WebsocketsExceptionFilter } from './ws-exception.filter';
import { Connections } from './entities/gateway.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server, WebSocket } from 'ws';
import { JwtService } from '@nestjs/jwt';
@WebSocketGateway(3005, {
  cors: {
    origin: '*',
    credentials: true,
  },
})
@UseFilters(new WebsocketsExceptionFilter())
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel(Connections.name) private connectionModel: Model<Connections>,
    private jwtService: JwtService,
  ) {}

  // Object to store connected clients and their roles
  public connectedClients: Map<string, WebSocket> = new Map();

  handleConnection(socket: WebSocket) {
    // this.server.clients.add()
    console.log('hello from');
    socket.on('message', async (message) => {
      // socket.removeAllListeners();

      //       const token = message.toString();
      //       console.log('this is token...', token);
      //       // set this token to connectedClient
      //       // get userid from token
      //       // this.connectedClients.set(token, socket);
      //       console.log(token.length);
      //       // jwt token length is like 241
      //       if (token.length < 80) {
      //         console.log('going to return to prevent loop....');
      //         return;
      //       }

      // set this token to connectedClients
      // get userid from token
      // console.log(process.env.Jwt_secret);
      console.log(typeof message);
      const token = message.toString();
      this.connectedClients.set(token, socket);
      if (this.connectedClients.get(token)) {
        console.log('going to return to prevent loop');
        return;
      }

      socket.send('connection established');
      try {
        const decodedToken = this.jwtService.verify(token, {
          secret: process.env.Jwt_secret,
        });

        // console.log('TokenData.....', decodedToken);
        this.connectedClients.set(token, socket);
        const userId = decodedToken.id;
        // console.log('userId', userId);

        // console.log(this.connectedClients.get(userId));
        if (this.connectedClients.get(userId)) {
          console.log('going to return to prevent loop');
          return;
        }

        const newConnection = new this.connectionModel({
          userId: userId,
          // socketId: socket.id,
        });
        await newConnection.save();
        console.log('newConnection...', newConnection);

        // now save the connection in connected Clients
        this.connectedClients.set(userId, socket);

        socket.send('connection success');
      } catch (error) {
        console.log(error);
        socket.close();
      }
    });
  }

  // TODO: concept of subscribingCompany for newUpdates

  @SubscribeMessage('test')
  async single(@MessageBody() data: any, @ConnectedSocket() client: WebSocket) {
    console.log('inside it test');
    client.send('this is only your response');
  }

  @SubscribeMessage('test1')
  async test1(@MessageBody() data: any) {
    console.log('inside it test111');
    // sending to specific user
    console.log(this.connectedClients.keys());
    const targetSocket = this.connectedClients.get('65180a56c3f19457f7e49a09');
    // TODO: HERREEEEE
    console.log(targetSocket?.readyState);
    if (targetSocket) {
      targetSocket.send('sent to you only...');
    } else {
      console.log('User not found or not connected');
    }
    console.log('test1....', data);
    // sending to all user --
    // now we can get keys from connectedClients and find all users to whom we want to send the message
  }

  @SubscribeMessage('test2')
  async toSpecificUser(
    @MessageBody() data: any,
    @ConnectedSocket() client: WebSocket,
  ) {
    console.log('inside it test2');
    // client.send('this is toSpecificUser response');
    // client.emit('message', {});
    for (const connectedClient of this.connectedClients) {
      // console.log(connectedClient);
      console.log('inside it test222');
      // connectedClient.send(`This is ToAllCompaniesAndAdmin response for user ${connectedClient.userId}`);
    }
    // this.server.clients.values.forEach((socket: any) => {
    //   console.log('socket.......', socket);
    //   // if (socket === 'kuchb') {
    //   //   console.log('enter in iffff');
    //   //   socket.send('this is toSpecificUser response');
    //   // }
    // });
  }

  @SubscribeMessage('test3')
  async ToAllCompaniesAndAdmin(
    @MessageBody() data: any,
    // @ConnectedSocket() client: WebSocket,
  ) {
    console.log('inside it test3');
    // client.send('this is ToAllCompaniesAndAdmin response');
    // client.emit('this is allUsers response');
    for (const connectedClient of this.server.clients) {
      connectedClient.send('this is ToAllCompaniesAndAdmin response');
    }
  }

  // @SubscribeMessage('test4')
  async ToAllCompanies(
    @MessageBody() token: any,
    @ConnectedSocket() client: WebSocket,
  ) {
    console.log('data', token);
    const decodedToken = this.jwtService.verify(token, {
      secret: process.env.Jwt_secret,
    });
    console.log('data.id>>', decodedToken);
    console.log('data.id', decodedToken.id);
    client.send('this is ToAllCompaniesAndAdmin response');
    // for (const connectedClient of this.server.clients) {
    //   connectedClient.send('this is ToAllCompaniesAndAdmin response');
    // }
  }

  // ********************************* SUPER ADMIN *******************************

  // Notify SuperAdmin for the company Subscriptiona
  @SubscribeMessage('companySubscription')
  companySubscriptionToAdmin() {
    const adminUserId = '6521604e9310ee3617afc352';
    const targetSocket = this.connectedClients.get(adminUserId);

    if (targetSocket) {
      // this.server.to(targetSocket).emit('companySubscription', notification);
      // .emit('companySubscription', 'Company subscribe for plan.');
      console.log('companySubscription sent');
    } else {
      // TODO: store notification in db
      throw new BadRequestException('Failed to send job notification');
    }
  }

  // Notify SuperAdmin for the company SubscriptionPlan updates
  @SubscribeMessage('companySubscription')
  subscriptionPlanUpdate(notification: string) {
    const adminUserId = '6521604e9310ee3617afc352';
    const targetSocket = this.connectedClients.get(adminUserId);

    if (targetSocket) {
      // this.server.to(targetSocket).emit('companySubscription', notification);
      // .emit('companySubscription', 'Company subscribe for plan.');
      console.log('companySubscription sent');
    } else {
      // TODO: store notification in db
      throw new BadRequestException('Failed to send job notification');
    }
  }

  // ************************* Notify to SpecificUser ************************

  // Notify Company for its candidate's application Apply
  @SubscribeMessage('candidateApply')
  candidateAppNotificationToComp() {
    const companyId = '6521604e9310ee3617afc352';
    const targetSocket = this.connectedClients.get(companyId);

    if (targetSocket) {
      // this.server
      //   .to(targetSocket)
      //   .emit(
      //     'candidateApplication',
      //     'A new candidateApplication has been created',
      //   );
      console.log('candidateApplication sent');
    } else {
      // TODO: store notification in db
      throw new BadRequestException('Failed to send job notification');
    }
  }

  // Notify Candidate for its candidate's application acceptance
  @SubscribeMessage('applicationAcceptance')
  async candidateAssessementToCand(
    @MessageBody() data: any,
    @ConnectedSocket() client: WebSocket,
  ) {
    // console.log('candidateAssessementData...', data.id);
    client.send('New CandidateAssessement created successfully.');
  }

  // Notify the Candidate for assessment invitation
  @SubscribeMessage('newExamInviteSent')
  examInviteNotificationToCand() {
    const candidateId = '6521604e9310ee3617afc352';
    const targetSocket = this.connectedClients.get(candidateId);

    if (targetSocket) {
      // this.server
      //   .to(targetSocket)
      //   .emit(
      //     'examInviteNotification',
      //     'A new examLink has been sent to you.Check your email.',
      //   );
      console.log('newJobNotification sent');
    } else {
      // TODO: store notification in db
      throw new BadRequestException('Failed to send job notification');
    }
  }

  // Notify Candidate for its candidate's application rejection
  @SubscribeMessage('applicationRejection')
  async rejectionToCand(
    @MessageBody() data: any,
    @ConnectedSocket() client: WebSocket,
  ) {
    // console.log('candidateAssessementData...', data.id);
    client.send('New CandidateAssessement created successfully.');
  }

  // Notify specific company for the coupon
  @SubscribeMessage('coupon')
  async couponToComp(
    @MessageBody() data: any,
    @ConnectedSocket() client: WebSocket,
  ) {
    client.send('New coupon created successfully.');
  }

  // ************************ Notify to multiple Users ************************

  // Notify SuperAdmin and all candidatese about new Job creation
  @SubscribeMessage('newJobNotification')
  sendNewJobNotificationToAdmin() {
    const adminUserId = '6521604e9310ee3617afc352';
    const targetSocket = this.connectedClients.get(adminUserId);

    if (targetSocket) {
      // this.server
      //   .to(targetSocket)
      //   .emit('newJobNotification', 'A new job has been created');
      console.log('newJobNotification sent');
    } else {
      // TODO: store notification in db
      throw new BadRequestException('Failed to send job notification');
    }
  }

  // Notify All companies on creation of limited discount
  @SubscribeMessage('discountCreation')
  async toAllComp(
    @MessageBody() data: any,
    @ConnectedSocket() client: WebSocket,
  ) {
    client.send('New discount offer on SubscritptionPlan.');
  }
}

// ------------------------------------
// import { BadRequestException, UseFilters, Logger } from '@nestjs/common';
// import {
//   SubscribeMessage,
//   WebSocketGateway,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   WebSocketServer,
//   MessageBody,
//   ConnectedSocket,
// } from '@nestjs/websockets';
// import { WebsocketsExceptionFilter } from './ws-exception.filter';
// import { Connections } from './entities/gateway.entity';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { JwtService } from '@nestjs/jwt';
// import { Server, WebSocket } from 'ws';
// @WebSocketGateway(3005, {
//   cors: {
//     origin: '*',
//     credentials: true,
//   },
// })
// @UseFilters(new WebsocketsExceptionFilter())
// export class EventsGateway {
//   @WebSocketServer()
//   server: Server;

//   constructor(
//     @InjectModel(Connections.name) private connectionModel: Model<Connections>,
//     private jwtService: JwtService,
//   ) {}

//   // Object to store connected clients and their roles
//   public connectedClients: Map<string, WebSocket> = new Map();

//   handleConnection(socket: WebSocket) {
//     // this.server.clients.add()
//     socket.on('message', async (message) => {
//       // socket.removeAllListeners();
//       // set this token to connectedClients
//       // get userid from token
//       // console.log(process.env.Jwt_secret);
//       console.log(typeof message);
//       const token = message.toString();
//       const clients = this.connectedClients.set(token, socket);
//       if (this.connectedClients.get(token)) {
//         console.log('going to return to prevent loop');
//         return;
//       }

//       // console.log('clients.....', clients);
//       // console.log('this is token...', token);
//       // console.log('this is socket...', socket);

//       // socket.send('connection established');
//       try {
//         // const decodedToken = this.jwtService.verify(token, {
//         //   secret: process.env.Jwt_secret,
//         // });
//         // console.log('TokenData.....', decodedToken);
//         // this.connectedClients.set(token, socket);
//         // const userId = decodedToken.id;
//         // console.log('userId', userId);
//         // console.log(this.connectedClients.get(userId));
//         // if (this.connectedClients.get(userId)) {
//         //   console.log('going to return to prevent loop');
//         //   return;
//         // }
//         // console.log(this.connectedClients.keys());

//         // const newConnection = new this.connectionModel({
//         //   userId: userId,
//         //   // socketId: socket.id,
//         // });
//         // await newConnection.save();
//         // console.log('newConnection...', newConnection);

//         // now save the connection in connected Clients
//         // this.connectedClients.set(userId, socket);
//         // console.log('keys....', this.connectedClients.keys());
//         socket.send('connection success');
//       } catch (error) {
//         console.log(error);
//         socket.close();
//       }
//     });
//   }

//   // handleDisconnect(client: Server) {
//   //   // Remove the client ID when they disconnect
//   //   // this.connectionModel.findOneAndDelete(
//   //   //   { socketId: client.id },
//   //   //   (err: any) => {
//   //   //     if (err) {
//   //   //       console.error('Error deleting connection from MongoDB:', err);
//   //   //     } else {
//   //   //       console.log('Client disconnected:', client.id);
//   //   //     }
//   //   //   },
//   //   // );
//   //   // this.connectedClients.delete(client.id);
//   //   // console.log('Client disconnected:', client.id);
//   // }

//   @SubscribeMessage('test1')
//   async test(@MessageBody() data: any, @ConnectedSocket() client: WebSocket) {
//     // console.log('this is client....', client);
//     // console.log(this.connectedClients.keys());
//     client.send('this is only your response');
//     // this.server.
//     // console.log('test1Data...', data);
//     // console.log(socket);
//   }

//   // ********************************* SUPER ADMIN *******************************

//   // Notify All companies on creation of limited discount

//   // Notify specific company for the coupon

//   // ********************************* CANDIDATES **********************************

//   // @SubscribeMessage('candidateAssessement')
//   // async candidateAssessementToComp(
//   //   @MessageBody() data: any,
//   //   @ConnectedSocket() client: WebSocket,
//   // ) {
//   //   // console.log(this.connectedClients.keys());
//   //   console.log('candidateAssessementData...', data);
//   //   // const userId =
//   //   // console.log(socket);
//   //   // try {
//   //   //   const decodedToken = this.jwtService.verify(token, {
//   //   //     secret: process.env.Jwt_secret,
//   //   //   });
//   //   //   // console.log('decoded Token....', decodedToken.id);
//   //   //   const userId = decodedToken.id;
//   //   //   // console.log(this.connectedClients.get(userId));
//   //   //   if (this.connectedClients.has(userId)) {
//   //   //     console.log('going to return to prevent loop');
//   //   //     return;
//   //   //   }

//   //   //   const newConnection = new this.connectionModel({
//   //   //     userId: userId,
//   //   //     // socketId: socket.id,
//   //   //   });
//   //   //   await newConnection.save();
//   //   //   // console.log('newConnection....', newConnection);

//   //   //   // now save the connection in connected Clients
//   //   //   this.connectedClients.set(userId, socket);
//   //   //   this.server.clients.add(userId);
//   //   //   // console.log(this.connectedClients.keys());
//   //   // } catch (error) {
//   //   //   console.log(error);
//   //   //   socket.close();
//   //   // }
//   // }

//   // Notify Company for its candidate's application submission
//   @SubscribeMessage('candidateAssessement')
//   async candidateAssessementToComp(
//     @MessageBody() data: any,
//     @ConnectedSocket() client: WebSocket,
//   ) {
//     console.log('candidateAssessementData...', data);
//     client.send('this is only candidateAssessement creation response');
//     // const candidateId = '6521604e9310ee3617afc352';
//     // const targetSocket = this.connectedClients.get(candidateId);

//     // if (targetSocket) {
//     //   // this.server
//     //   //   .to(targetSocket)
//     //   //   .emit('candidateAssessement', 'Candidate has atempted assessement.');
//     //   console.log('candidateAssessement sent');
//     // } else {
//     //   // TODO: store notification in db
//     //   throw new BadRequestException('Failed to send job notification');
//     // }
//   }

//   // Notify Company for its candidate's application Apply
//   @SubscribeMessage('candidateApplication')
//   candidateAppNotificationToComp() {
//     const companyId = '6521604e9310ee3617afc352';
//     const targetSocket = this.connectedClients.get(companyId);

//     if (targetSocket) {
//       // this.server
//       //   .to(targetSocket)
//       //   .emit(
//       //     'candidateApplication',
//       //     'A new candidateApplication has been created',
//       //   );
//       console.log('candidateApplication sent');
//     } else {
//       // TODO: store notification in db
//       throw new BadRequestException('Failed to send job notification');
//     }
//   }

//   // ********************************* COMPANY **********************************

//   // Notify SuperAdmin for the company Subscription
//   @SubscribeMessage('companySubscription')
//   companySubscriptionToAdmin(notification: string) {
//     const adminUserId = '6521604e9310ee3617afc352';
//     const targetSocket = this.connectedClients.get(adminUserId);

//     if (targetSocket) {
//       // this.server.to(targetSocket).emit('companySubscription', notification);
//       // .emit('companySubscription', 'Company subscribe for plan.');
//       console.log('companySubscription sent');
//     } else {
//       // TODO: store notification in db
//       throw new BadRequestException('Failed to send job notification');
//     }
//   }

//   // Send new Job Notification to ADMIN on JOB CREATION
//   @SubscribeMessage('newJobNotification')
//   sendNewJobNotificationToAdmin() {
//     const adminUserId = '6521604e9310ee3617afc352';
//     const targetSocket = this.connectedClients.get(adminUserId);
//     // console.log('connectedClients', this.connectedClients);
//     // console.log('adminSocket', targetSocket);

//     if (targetSocket) {
//       // this.server
//       //   .to(targetSocket)
//       //   .emit('newJobNotification', 'A new job has been created');
//       console.log('newJobNotification sent');
//     } else {
//       // TODO: store notification in db
//       throw new BadRequestException('Failed to send job notification');
//     }
//   }

//   // Notify the Candidate for assessment invitation
//   @SubscribeMessage('examInviteNotification')
//   examInviteNotificationToCand() {
//     const candidateId = '6521604e9310ee3617afc352';
//     const targetSocket = this.connectedClients.get(candidateId);

//     if (targetSocket) {
//       // this.server
//       //   .to(targetSocket)
//       //   .emit(
//       //     'examInviteNotification',
//       //     'A new examLink has been sent to you.Check your email.',
//       //   );
//       console.log('newJobNotification sent');
//     } else {
//       // TODO: store notification in db
//       throw new BadRequestException('Failed to send job notification');
//     }
//   }
// }
// // handleConnection(socket: WebSocket) {
// //   console.log('sdfasfasd');
// //   socket.once('message', (message) => {
// //     // socket.removeAllListeners();
// //     const token = message.toString();
// //     console.log('this is token....');
// //     // set this token to connectedClients
// //     // get userid from token
// //     // console.log(process.env.Jwt_secret);
// //     // try {
// //     //   const decodedToken = this.jwtService.verify(token, {
// //     //     secret: process.env.Jwt_secret,
// //     //   });
// //     //   // console.log('decoded Token....', decodedToken.id);
// //     //   // this.connectedClients.set(token, socket);
// //     //   const userId = decodedToken.id;

// //     //   // if (this.connectedClients.get(userId)) {
// //     //   //   console.log('going to return to prevent loop');
// //     //   //   return;
// //     //   // }

// //     //   const newConnection = new this.connectionModel({
// //     //     userId: userId,
// //     //     // socketId: socket.id,
// //     //   });
// //     //   await newConnection.save();
// //     //   // console.log('newConnection....', newConnection);

// //     //   // now save the connection in connected Clients
// //     //   this.connectedClients.set(userId, socket);
// //     // } catch (error) {
// //     //   console.log(error);
// //     //   socket.close();
// //     // }
// //     // this.server.clients.forEach((client) => {
// //     //   client.send(message);
// //     // });
// //   });
// // }

// // handleDisconnect(client: Server) {
// //   // Remove the client ID when they disconnect
// //   // this.connectionModel.findOneAndDelete(
// //   //   { socketId: client.id },
// //   //   (err: any) => {
// //   //     if (err) {
// //   //       console.error('Error deleting connection from MongoDB:', err);
// //   //     } else {
// //   //       console.log('Client disconnected:', client.id);
// //   //     }
// //   //   },
// //   // );
// //   // this.connectedClients.delete(client.id);
// //   // console.log('Client disconnected:', client.id);
// // }
