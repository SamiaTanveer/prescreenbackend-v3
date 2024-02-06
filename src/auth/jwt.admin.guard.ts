import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const user = context.switchToHttp().getRequest().user;
    const { userType } = user;
    if (user && userType === 'superAdmin') {
      return true;
    }

    throw new UnauthorizedException('Super Admin privileges required');
  }
}
