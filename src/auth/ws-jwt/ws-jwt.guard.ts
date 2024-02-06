import {
  CanActivate,
  ExecutionContext,
  Injectable,
  // Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();
    WsJwtAuthGuard.validateToken(client);
    return true;
  }

  // static validateToken(client: Socket) {
  //   const { authorization } = client.handshake.headers;
  //   Logger.log({ authorization });
  //   const token: string = authorization.split(' ')[1];
  //   const payload = verify(token, 'secretKey');
  //   return payload;
  // }
  static validateToken(client: Socket) {
    const { authorization } = client.handshake.headers;

    if (!authorization) {
      // Handle the case where authorization is undefined
      throw new UnauthorizedException('Authorization header is missing');
    }

    const tokenParts = authorization.split(' ');

    if (tokenParts.length !== 2) {
      // Handle the case where the authorization header format is incorrect
      throw new UnauthorizedException('Invalid authorization header format');
    }

    const token: string = tokenParts[1];
    const payload = verify(token, 'secretKey');
    console.log('payload', payload);
    return payload;
  }
}
