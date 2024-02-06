import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AssessmentFeedback } from './entities/assessment-feedback.entity';
import { AssessmentFeedbackDto } from './dto/create-assessment-feedback.dto';
import { UpdateAssessmentFeedbackDto } from './dto/update-assessment-feedback.dto';
import { feedbackPaginationDto } from 'src/utils/classes';
import { setSortStageFeedback } from 'src/utils/funtions';

@Injectable()
export class AssessmentFeedbackService {
  constructor(
    @InjectModel(AssessmentFeedback.name)
    private AssessmentFeedbackModel: Model<AssessmentFeedback>,
  ) {}
  async create(dto: AssessmentFeedbackDto): Promise<AssessmentFeedback> {
    console.log('assessment feedback dto..', dto);
    // // Create a new Assessment Feedback document
    const assessmentFeedback = await this.AssessmentFeedbackModel.create(dto);

    if (!assessmentFeedback) {
      throw new BadRequestException('unable to create assessment feedback');
    }
    return assessmentFeedback;
  }

  // sorting, searching on rating, comments(search, sorting)
  async findAll(query: feedbackPaginationDto) {
    let result;
    const matchStage: any = {};
    const { page, limit, rating, comments, sort } = query;
    if (rating !== undefined) {
      matchStage.rating = +rating;
    }
    if (comments !== undefined) {
      matchStage.comments = { $regex: comments, $options: 'i' };
    }
    // console.log(matchStage);

    if (page !== undefined && limit !== undefined) {
      const sortStage: any = {};
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      if (sort) {
        sortStage['$sort'] = setSortStageFeedback(sort);
      }

      result = await this.AssessmentFeedbackModel.aggregate([
        {
          $match: matchStage,
        },
        {
          $facet: {
            feedbacks: [
              {
                $match: matchStage,
              },
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [
              {
                $match: matchStage,
              },
              { $count: 'count' },
            ],
          },
        },
      ]);

      const feedbacks = result[0].feedbacks;
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

      return {
        allFeedbacks: feedbacks,
        total: totalDocs,
      };
    }
    // else {
    //   result = await this.AssessmentFeedbackModel.aggregate([
    //     {
    //       $facet: {
    //         feedbacks: [],
    //         totalDocs: [{ $count: 'count' }],
    //       },
    //     },
    //   ]);
    // }
  }

  async findOne(id: string) {
    const feedbackFound = await this.AssessmentFeedbackModel.findById(id);
    if (!feedbackFound) {
      throw new NotFoundException('No feedback found');
    }
    return feedbackFound;
  }

  async update(id: string, dto: UpdateAssessmentFeedbackDto) {
    // console.log(dto);
    const updated = await this.AssessmentFeedbackModel.findByIdAndUpdate(
      id,
      dto,
      { new: true, runValidators: true },
    );
    if (!updated) {
      throw new BadRequestException('Unable to update... kindly check id');
    }

    return updated;
  }

  async remove(id: string) {
    const isRemoved = await this.AssessmentFeedbackModel.findByIdAndDelete(id);

    if (!isRemoved) {
      throw new BadRequestException('Unable to delete..Kindly confirm id');
    }
    return { message: 'Feedback removed' };
  }
}
