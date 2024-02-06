import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.Jwt_secret,
    });
  }

  async validate(payload: { id: string }) {
    const { id } = payload;

    const user = await this.UserModel.findById(id);

    if (!user) {
      throw new UnauthorizedException('Login first to access this page');
    }

    // console.log('strategy', user);
    return user;
  }
}
