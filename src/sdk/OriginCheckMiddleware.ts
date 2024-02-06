import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SdkService } from './sdk.service';
import { SdkEntity } from './entities/sdk.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class OriginCheckMiddleware implements NestMiddleware {
  constructor(private readonly sdkService: SdkService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const apiKey = req.headers.authorization;
      if (!apiKey) {
        throw new Error('API key not provided');
      }

      const sdkDoc: SdkEntity | null =
        await this.sdkService.findOneByApiKey(apiKey);

      if (!sdkDoc) {
        throw new Error('Invalid API key');
      }

      // Assuming company website is stored in the 'company' field
      const companyUser: User = sdkDoc.companyUser as User;
      console.log('companyUser...', companyUser);
      console.log('origin...', req.headers.host);

      // Check if the origin matches the company website
      // if (
      //   req.headers.host &&
      //   !companyUser?.company?.website.includes(req.headers.host)
      // ) {
      //   throw new Error('Invalid origin');
      // }

      next();
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
}
