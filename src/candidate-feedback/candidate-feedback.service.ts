import { Injectable, NotFoundException } from '@nestjs/common';
import { CandidateFeedbackDto } from './dto/create-candidate-feedback.dto';
import { UpdateCandidateFeedbackDto } from './dto/update-candidate-feedback.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CandidateFeedback } from './entities/candidate-feedback.entity';

@Injectable()
export class CandidateFeedbackService {
  constructor(
    @InjectModel(CandidateFeedback.name)
    private CandidateFeedbackModel: Model<CandidateFeedback>,
  ) {}
  async create(dto: CandidateFeedbackDto) {
    // console.log('candidate feedback', dto);
    const newFeedback = {
      feedbackQuestion: dto.feedback.feedbackQuestion,
      rating: dto.feedback.rating,
      suggestion: dto.feedback.suggestion,
    };

    // Create a new CandidateFeedback document
    const candidateFeedback = new this.CandidateFeedbackModel({
      candidate: dto.candidate,
      exam: dto.exam,
      feedbacks: [newFeedback],
    });
    const createdFeedback = await candidateFeedback.save();

    return createdFeedback;
  }

  async findAll(page?: number, limit?: number) {
    let result;

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.CandidateFeedbackModel.aggregate([
        {
          $facet: {
            feedbacks: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.CandidateFeedbackModel.aggregate([
        {
          $facet: {
            feedbacks: [],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const feedbacks = result[0].feedbacks;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      allFeedbacks: feedbacks,
      total: totalDocs,
    };
  }

  async findOne(id: string) {
    const feedbackFound = await this.CandidateFeedbackModel.findById(id);
    if (feedbackFound) {
      throw new NotFoundException('No feedback found');
    }
    return feedbackFound;
  }

  async update(id: string, dto: UpdateCandidateFeedbackDto) {
    // console.log(dto);
    const newFeedbackItem = {
      feedbackQuestion: dto.feedback.feedbackQuestion,
      rating: dto.feedback.rating,
      suggestion: dto.feedback.suggestion,
    };
    const updated = await this.CandidateFeedbackModel.findByIdAndUpdate(
      id,
      { $push: { feedbacks: newFeedbackItem } },
      { new: true, runValidators: true },
    );

    return updated;
  }

  remove(id: string) {
    return `This action removes a #${id} candidateFeedback`;
  }
}
