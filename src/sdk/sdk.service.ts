import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SdkEntity } from './entities/sdk.entity';

@Injectable()
export class SdkService {
  constructor(
    @InjectModel(SdkEntity.name) private sdkModel: Model<SdkEntity>,
  ) {}

  async createkey(dto: any) {
    const created = await this.sdkModel.create(dto);

    if (!created) {
      throw new BadRequestException('unable to generate apikey');
    }

    return created;
  }

  async findOneByApiKey(key: string) {
    return await this.sdkModel.findOne({ apiKey: key }).populate({
      path: 'companyUser',
      select: 'name email company',
      populate: { path: 'company', select: 'website ' },
    });
  }
  async findOneByUserid(userid: string) {
    return await this.sdkModel.findOne({ companyUser: userid });
  }
}
