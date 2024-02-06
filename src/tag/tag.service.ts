import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Tag } from './entities/tag.entity';
import { MCQ } from 'src/mcq/entities/mcq.entity';
import { CodingQuestion } from 'src/coding-question/entities/coding-question.entity';
import { tagsPaginationDto } from 'src/utils/classes';
import { setSortStage, setSortStageTags } from 'src/utils/funtions';
import { Exam } from 'src/exam/entities/exam.entity';

@Injectable()
export class TagService {
  // codingQuestionModel: any;
  constructor(
    @InjectModel(Tag.name) private TagModel: Model<Tag>,
    @InjectModel(MCQ.name) private McqModel: Model<MCQ>,
    @InjectModel(CodingQuestion.name)
    private CodingModel: Model<CodingQuestion>,
    @InjectModel(Exam.name)
    private ExamModel: Model<Exam>,
  ) {}

  async create(dto: CreateTagDto) {
    // if a tag with similar name already exists
    const existingTag = await this.TagModel.findOne({
      tagName: { $regex: new RegExp(`^${dto.tagName}$`, 'i') },
    });

    if (existingTag) {
      throw new BadRequestException('Tag with similar name already exists');
    }

    return this.TagModel.create(dto);
  }
  async findAll(page?: number, limit?: number) {
    let result;
    const lookup1 = {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'candidateInfo',
      },
    };
    const lookup2 = {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'companyInfo',
      },
    };
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.TagModel.aggregate([
        {
          $facet: {
            tags: [lookup1, lookup2, { $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.TagModel.aggregate([
        {
          $facet: {
            tags: [lookup1, lookup2],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const tags = result[0].tags;
    // console.log('result', tags);
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      allTags: tags,
      total: totalDocs,
    };
  }

  async getTagsAnalytics(query: tagsPaginationDto) {
    let result;
    const lookupMcqs = {
      $lookup: {
        from: 'mcqs',
        localField: '_id',
        foreignField: 'tags',
        as: 'mcqCount',
      },
    };

    const lookupQuestions = {
      $lookup: {
        from: 'codingquestions',
        localField: '_id',
        foreignField: 'tags',
        as: 'codingQuestionCount',
      },
    };

    const lookupExams = {
      $lookup: {
        from: 'exams',
        localField: '_id',
        foreignField: 'tags',
        as: 'examsCount',
      },
    };

    const { page, limit, title, sort } = query;
    const sortStage: any = {};
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      if (sort) {
        sortStage['$sort'] = setSortStageTags(sort);
      }

      result = await this.TagModel.aggregate([
        ...(title
          ? [
              {
                $match: { tagName: { $regex: title, $options: 'i' } },
              },
            ]
          : []),
        {
          $facet: {
            tags: [
              lookupMcqs,
              lookupQuestions,
              lookupExams,
              { $skip: skip },
              { $limit: +limit },
              {
                $addFields: {
                  mcqCount: { $size: '$mcqCount' },
                  codingQuestionCount: { $size: '$codingQuestionCount' },
                  examsCount: { $size: '$examsCount' },
                },
              },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else {
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }
      result = await this.TagModel.aggregate([
        ...(title
          ? [
              {
                $match: { tagName: { $regex: title, $options: 'i' } },
              },
            ]
          : []),
        {
          $facet: {
            tags: [
              lookupMcqs,
              lookupQuestions,
              lookupExams,
              {
                $addFields: {
                  mcqCount: { $size: '$mcqCount' },
                  codingQuestionCount: { $size: '$codingQuestionCount' },
                  examsCount: { $size: '$examsCount' },
                },
              },
            ],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }

    const tags = result[0].tags;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
    return {
      allTags: tags,
      total: totalDocs,
    };
  }

  // async getTagsAnalytics(page?: number, limit?: number) {
  //   let result;
  //   if (page !== undefined && limit !== undefined) {
  //     let skip = (page - 1) * limit;
  //     if (skip < 0) {
  //       skip = 0;
  //     }
  //     result = await this.TagModel.aggregate([
  //       {
  //         $facet: {
  //           tags: [
  //             { $skip: skip },
  //             { $limit: +limit },
  //             {
  //               $lookup: {
  //                 from: 'mcqs', // Replace with collection name for mcqs
  //                 localField: '_id',
  //                 foreignField: 'tags',
  //                 as: 'mcqCount',
  //               },
  //             },
  //             {
  //               $lookup: {
  //                 from: 'codingquestions', // Replace with collection name for codingquestions
  //                 localField: '_id',
  //                 foreignField: 'tags',
  //                 as: 'codingQuestionCount',
  //               },
  //             },
  //             {
  //               $lookup: {
  //                 from: 'exams', // Replace with collection name for exams
  //                 localField: '_id',
  //                 foreignField: 'tags',
  //                 as: 'examsCount',
  //               },
  //             },
  //             {
  //               $addFields: {
  //                 mcqCount: { $size: '$mcqCount' },
  //                 codingQuestionCount: { $size: '$codingQuestionCount' },
  //                 examsCount: { $size: '$examsCount' },
  //               },
  //             },
  //           ],
  //           totalDocs: [{ $count: 'count' }],
  //         },
  //       },
  //     ]);
  //   } else {
  //     result = await this.TagModel.aggregate([
  //       {
  //         $facet: {
  //           tags: [
  //             {
  //               $lookup: {
  //                 from: 'mcqs', // Replace with collection name for mcqs
  //                 localField: '_id',
  //                 foreignField: 'tags',
  //                 as: 'mcqCount',
  //               },
  //             },
  //             {
  //               $lookup: {
  //                 from: 'codingquestions', // Replace with collection name for codingquestions
  //                 localField: '_id',
  //                 foreignField: 'tags',
  //                 as: 'codingQuestionCount',
  //               },
  //             },
  //             {
  //               $lookup: {
  //                 from: 'exams', // Replace with collection name for exams
  //                 localField: '_id',
  //                 foreignField: 'tags',
  //                 as: 'examsCount',
  //               },
  //             },
  //             {
  //               $addFields: {
  //                 mcqCount: { $size: '$mcqCount' },
  //                 codingQuestionCount: { $size: '$codingQuestionCount' },
  //                 examsCount: { $size: '$examsCount' },
  //               },
  //             },
  //           ],
  //           totalDocs: [{ $count: 'count' }],
  //         },
  //       },
  //     ]);
  //   }

  //   const tags = result[0].tags;
  //   const totalDocs =
  //     result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
  //   return {
  //     allTags: tags,
  //     total: totalDocs,
  //   };
  // }

  async findOne(id: string) {
    // console.log(userId);
    const tagFound = await this.TagModel.findOne({
      _id: id,
    }).populate({
      path: 'user',
      select: 'password lastLogin', // choosing required fields
      populate: {
        path: 'company',
        model: 'Company',
      },
    });

    if (!tagFound) {
      throw new NotFoundException('No Tag found');
    }
    return tagFound;
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    // console.log(updateTagDto);
    const isUpdated = await this.TagModel.findByIdAndUpdate(id, updateTagDto, {
      new: true,
    });

    if (!isUpdated) {
      throw new NotFoundException('No Tag found');
    }

    return {
      message: 'Tag Updated Successfully',
    };
  }

  async remove(id: string) {
    // Check if the tag is used in any MCQ, CodingQuestion, or Exam
    const usedInMCQ = await this.McqModel.find({ tags: id });
    const usedInCoding = await this.CodingModel.find({ tags: id });
    const usedInExams = await this.ExamModel.find({ tags: id });

    // Prepare a list of resources where the tag is used
    const usedInResources = [];
    if (usedInMCQ)
      usedInResources.push([
        ...usedInMCQ.map((item) => {
          return {
            id: item.id,
            title: item.title,
          };
        }),
      ]);
    if (usedInCoding)
      usedInResources.push([
        ...usedInCoding.map((item) => {
          return {
            id: item.id,
            title: item.title,
          };
        }),
      ]);
    if (usedInExams)
      usedInResources.push([
        ...usedInExams.map((item) => {
          return {
            id: item.id,
            title: item.title,
          };
        }),
      ]);

    // console.log('associations with tags', usedInResources);
    // console.log(usedInResources);
    // return true;
    const allArraysEmpty = usedInResources.every(
      (arr: any[]) => arr.length === 0,
    );
    if (!allArraysEmpty) {
      // The tag is used in some resources, return a response indicating where it's used
      throw new BadRequestException(
        'This tag cannot be deleted as it is being used',
      );
      // return {
      //   message: 'Tag is used in the following resources:',
      //   usedIn: usedInResources,
      // };
    } else {
      // The tag is not used in any resources, proceed with deletion
      const isDeleted = await this.TagModel.findByIdAndDelete(id);

      if (!isDeleted) {
        throw new NotFoundException('No Tag found');
      }

      return {
        message: 'Tag deleted Successfully',
      };
    }
  }
}
