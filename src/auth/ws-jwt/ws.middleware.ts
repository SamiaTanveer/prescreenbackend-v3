import { Socket } from 'socket.io';
import { WsJwtAuthGuard } from './ws-jwt.guard';

export type SocketIOMiddleware = (
  client: Socket,
  next: (err?: Error) => void,
) => void;

export const SocketAuthMiddleware = (): SocketIOMiddleware => {
  return (client: Socket, next) => {
    try {
      WsJwtAuthGuard.validateToken(client);
      next();
    } catch (error) {
      next(error);
    }
  };
};
