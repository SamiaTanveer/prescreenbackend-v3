// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, VerifyCallback } from 'passport-google-oauth20';
// import { config } from 'dotenv';
// // import tools from 'tools';

// config();

// @Injectable()
// export class CandidateGoogleStrategy extends PassportStrategy(
//   Strategy,
//   'candidategoogle',
// ) {
//   constructor() {
//     super({
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_SECRET,
//       callbackURL: 'http://localhost:3000/api/auth/google/redirect',
//       scope: ['email', 'profile'],
//       proxy: true,
//       // passReqToCallback: true,
//     });
//   }
//   async validate(
//     accessToken: string,
//     refreshToken: string,
//     // profile: Profile,
//     profile: any,
//     done: VerifyCallback,
//   ): Promise<any> {
//     const { name, emails, photos } = profile;
//     // console.log('profile', profile);
//     const user = {
//       email: emails[0].value,
//       firstName: name.givenName,
//       lastName: name.familyName,
//       picture: photos[0].value,
//       accessToken,
//     };
//     done(null, user);
//   }
// }
