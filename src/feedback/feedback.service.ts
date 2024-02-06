import { Injectable } from '@nestjs/common';
import { CreateFeedbackFormDto } from './dto/create-feedback.dto';
import { Model } from 'mongoose';
import { FeedbackForm } from './entities/feedback.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(FeedbackForm.name) private FeedbackModel: Model<FeedbackForm>,
  ) {}

  async create(dto: CreateFeedbackFormDto) {
    // console.log(dto);
    return await this.FeedbackModel.create(dto);
  }

  async findAll(page?: number, limit?: number): Promise<FeedbackForm[]> {
    let feedbacks;
    if (page && limit) {
      let skip = (page - 1) * limit;
      // Ensure skip is at least 0
      if (skip < 0) {
        skip = 0;
      }

      feedbacks = await this.FeedbackModel.find()
        .skip(skip)
        .limit(limit)
        .exec();
    } else {
      feedbacks = await this.FeedbackModel.find();
    }
    return feedbacks;
  }

  // async findOne(id: string): Promise<FeedbackForm | null> {
  //   const feebackFound = this.FeedbackModel.findById(id);

  //   if (!feebackFound) {
  //     throw new NotFoundException('No feedback found');
  //   }
  //   return feebackFound;
  // }

  async update(id: string, dto: CreateFeedbackFormDto) {
    // console.log(dto.questions);
    // return;
    const updatedFeeback = await this.FeedbackModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    // console.log(updatedFeeback);
    return updatedFeeback;
  }

  remove(id: string) {
    return this.FeedbackModel.findByIdAndDelete(id);
  }
}
