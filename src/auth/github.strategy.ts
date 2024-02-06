import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_SECRET,

      callbackURL: `${process.env.BACKEND_URL}/api/auth/github/redirect`,
      scope: ['public_profile', 'user:email', 'read:user'],
    });
  }

  async validate(accessToken: string, _refreshToken: string, profile: Profile) {
    //add check for null email
    return profile;
  }
}
