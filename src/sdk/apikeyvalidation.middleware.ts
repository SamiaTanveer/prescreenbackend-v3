import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SdkService } from './sdk.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(
    private readonly sdkService: SdkService,
    private readonly authservice: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers.authorization;
    // console.log(apiKey);

    // TODO:
    // rateLimit(number of requests per time)
    // routes to expose(jobsall, randomuserapply)

    if (!apiKey) {
      throw new BadRequestException('Api key is missing');
    }

    // Find the API key in the SdkEntity model
    const sdkInfo = await this.sdkService.findOneByApiKey(apiKey as string);

    if (!sdkInfo) {
      throw new BadRequestException('Api key is invalid');
    }

    // now check the token is valid
    // const isValid = await this.authservice.validateToken(apiKey);

    // if (!isValid) {
    //   throw new BadRequestException('Apikey is not valid');
    // }

    // also now match both keys from req and model
    if (apiKey != sdkInfo.apiKey) {
      throw new BadRequestException(
        'provided apikey doesnot matches with the authorized one',
      );
    }

    // Check rate limiting
    const currentTime = Date.now();
    const timeWindow = 3 * 60 * 1000; // 3 minutes
    const maxApiCalls = 5;
    // const maxApiCalls = sdkInfo.apiCallLimit;

    // Filter recent timestamps within the time window
    const recentApiCalls = sdkInfo.apiCallTimestamps.filter(
      (timestamp: any) => currentTime - timestamp < timeWindow,
    );
    console.log('recent api calls....', recentApiCalls);

    // Check if the number of recent API calls exceeds the limit
    if (recentApiCalls.length > maxApiCalls) {
      const waitTimeMinutes = timeWindow / (60 * 1000); // Convert milliseconds to minutes
      throw new BadRequestException(
        `API call limit exceeded. Try again after ${waitTimeMinutes} minutes`,
      );
    }

    // Update the timestamps and API call count
    sdkInfo.apiCallTimestamps = [...recentApiCalls, new Date(currentTime)];
    sdkInfo.apiCalls += 1;

    // Save the updated SDK information
    await sdkInfo.save();

    // console.log(sdkInfo);
    res.locals.sdkInfo = sdkInfo;
    next();
  }
}
