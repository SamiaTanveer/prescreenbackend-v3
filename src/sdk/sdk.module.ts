import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { SdkService } from './sdk.service';
import { SdkController } from './sdk.controller';
import { SdkEntity, SdkSchema } from './entities/sdk.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ApiKeyMiddleware } from './apikeyvalidation.middleware';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { JobService } from 'src/job/job.service';
import { Job, jobSchema } from 'src/job/entities/job.entity';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from 'src/candidate-application/entities/candidate-application.entity';
import { AuthService } from 'src/auth/auth.service';
import { MailingService } from 'src/mailing/mailing.service';
import { UserService } from 'src/user/user.service';
import { OriginCheckMiddleware } from './OriginCheckMiddleware';
import {
  Candidate,
  CandidateSchema,
} from 'src/candidate/entities/candidate.entity';
import { CandidateService } from 'src/candidate/candidate.service';
import { CandidateApplicationService } from 'src/candidate-application/candidate-application.service';
import { CategorySchema } from 'src/categories/entities/category.entity';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('Jwt_secret'),
          signOptions: {
            expiresIn: config.get<string | number>('Jwt_exp'),
          },
        };
      },
    }),
    AuthModule,
    MongooseModule.forFeature([
      { name: SdkEntity.name, schema: SdkSchema },
      { name: User.name, schema: UserSchema },
      { name: Job.name, schema: jobSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: CandidateApplication.name, schema: CandidateApplicationSchema },
      { name: 'Category', schema: CategorySchema },
    ]),
  ],
  controllers: [SdkController],
  providers: [
    SdkService,
    JwtService,
    JwtStrategy,
    JobService,
    CandidateService,
    CandidateApplicationService,
    AuthService,
    MailingService,
    UserService,
  ],
})
export class SdkModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .exclude({ path: 'api/sdk/create-apikey', method: RequestMethod.POST })
      .forRoutes(
        { path: 'api/sdk/getallJobs', method: RequestMethod.POST },
        {
          path: 'api/sdk/applications/:jobid/RandomUserApplyJob',
          method: RequestMethod.POST,
        },
      )
      .apply(OriginCheckMiddleware)
      .exclude({ path: 'api/sdk/create-apikey', method: RequestMethod.POST })
      .forRoutes({ path: 'api/sdk/getAll', method: RequestMethod.ALL });
  }
}
