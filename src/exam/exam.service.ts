import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import mongoose, { Model } from 'mongoose';
import { Exam } from './entities/exam.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ExamPaginationDto } from 'src/utils/classes';
import { setSortStage } from 'src/utils/funtions';

@Injectable()
export class ExamService {
  constructor(@InjectModel(Exam.name) private ExamModel: Model<Exam>) {}

  async create(dto: CreateExamDto) {
    const createdQuestion = new this.ExamModel(dto);
    return createdQuestion.save();
  }

  async findAll(query: ExamPaginationDto) {
    let result;

    const { page, limit, title, language, tag, sort } = query;
    const sortStage: any = {};
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      // console.log(arraySort);

      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }
      // console.log(sortStage);

      result = await this.ExamModel.aggregate([
        {
          $lookup: {
            from: 'tags',
            let: {
              tagIds: '$tags',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$_id', '$$tagIds'],
                  },
                },
              },
            ],
            as: 'tags',
          },
        },
        ...(title
          ? [
              {
                $match: { title: { $regex: title, $options: 'i' } },
              },
            ]
          : []),
        ...(language
          ? [
              {
                $match: { language: { $regex: language, $options: 'i' } },
              },
            ]
          : []),
        ...(tag
          ? [
              {
                $addFields: {
                  tags: {
                    $filter: {
                      input: '$tags',
                      as: 'tag',
                      cond: {
                        $regexMatch: {
                          input: '$$tag.tagName',
                          regex: tag,
                          options: 'i',
                        },
                      },
                    },
                  },
                },
              },
            ]
          : []),
        ...(tag
          ? [
              {
                $match: {
                  tags: {
                    $ne: [],
                  },
                },
              },
            ]
          : []),
        {
          $facet: {
            exams: [
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [
              { $skip: skip },
              { $limit: +limit },
              { $count: 'count' },
            ],
          },
        },
      ]);
    } else {
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }
      // console.log(sortStage);
      result = await this.ExamModel.aggregate([
        {
          $lookup: {
            from: 'tags',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags',
          },
        },
        ...(title
          ? [
              {
                $match: { title: { $regex: title, $options: 'i' } },
              },
            ]
          : []),
        {
          $facet: {
            exams: [...(Object.keys(sortStage).length > 0 ? [sortStage] : [])],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const exams = result[0].exams;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      exams: exams,
      total: totalDocs,
    };
  }

  async findCompanyGeneral(id: string, query: ExamPaginationDto) {
    let result;
    const matchStage: any = {
      $or: [
        { createdBy: new mongoose.Types.ObjectId(id) },
        { examType: 'general' },
      ],
    };
    const { page, limit, title, language, tag, sort } = query;
    const sortStage: any = {};
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }

      result = await this.ExamModel.aggregate([
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: 'tags',
            let: {
              tagIds: '$tags',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$_id', '$$tagIds'],
                  },
                },
              },
            ],
            as: 'tags',
          },
        },
        ...(title
          ? [
              {
                $match: { title: { $regex: title, $options: 'i' } },
              },
            ]
          : []),
        ...(language
          ? [
              {
                $match: { language: { $regex: language, $options: 'i' } },
              },
            ]
          : []),
        ...(tag
          ? [
              {
                $addFields: {
                  tags: {
                    $filter: {
                      input: '$tags',
                      as: 'tag',
                      cond: {
                        $regexMatch: {
                          input: '$$tag.tagName',
                          regex: tag,
                          options: 'i',
                        },
                      },
                    },
                  },
                },
              },
            ]
          : []),
        ...(tag
          ? [
              {
                $match: {
                  tags: {
                    $ne: [],
                  },
                },
              },
            ]
          : []),
        {
          $facet: {
            exams: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
              { $count: 'count' },
            ],
          },
        },
      ]);
    } else {
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }
      result = await this.ExamModel.aggregate([
        {
          $lookup: {
            from: 'tags',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags',
          },
        },
        ...(title
          ? [
              {
                $match: { title: { $regex: title, $options: 'i' } },
              },
            ]
          : []),
        {
          $facet: {
            exams: [
              { $match: matchStage },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
          },
        },
      ]);
    }

    const exams = result[0].exams;
    // console.log(exams);
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
    return {
      exams: exams.length == 0 ? [] : exams,
      total: totalDocs,
    };
  }

  async findByCompany(id: string, query: ExamPaginationDto) {
    let result;
    const matchStage: any = {
      createdBy: new mongoose.Types.ObjectId(id),
    };
    const { page, limit, title, language, tag, sort } = query;
    const sortStage: any = {};
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }
      result = await this.ExamModel.aggregate([
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: 'tags',
            let: {
              tagIds: '$tags',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$_id', '$$tagIds'],
                  },
                },
              },
            ],
            as: 'tags',
          },
        },
        ...(title
          ? [
              {
                $match: { title: { $regex: title, $options: 'i' } },
              },
            ]
          : []),
        ...(language
          ? [
              {
                $match: { language: { $regex: language, $options: 'i' } },
              },
            ]
          : []),
        ...(tag
          ? [
              {
                $addFields: {
                  tags: {
                    $filter: {
                      input: '$tags',
                      as: 'tag',
                      cond: {
                        $regexMatch: {
                          input: '$$tag.tagName',
                          regex: tag,
                          options: 'i',
                        },
                      },
                    },
                  },
                },
              },
            ]
          : []),
        ...(tag
          ? [
              {
                $match: {
                  tags: {
                    $ne: [],
                  },
                },
              },
            ]
          : []),
        {
          $facet: {
            exams: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
              { $count: 'count' },
            ],
          },
        },
      ]);
    } else {
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }
      result = await this.ExamModel.aggregate([
        {
          $lookup: {
            from: 'tags',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags',
          },
        },
        ...(title
          ? [
              {
                $match: { title: { $regex: title, $options: 'i' } },
              },
            ]
          : []),
        {
          $facet: {
            exams: [
              { $match: matchStage },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    }
    const exams = result[0].exams;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    // if (exams.length == 0) {
    //   throw new NotFoundException('Company has no Exams');
    // }
    return {
      exams: exams.length == 0 ? [] : exams,
      total: totalDocs,
    };
  }

  async findOne(id: string) {
    const Exam = await this.ExamModel.findOne({
      _id: id,
    });

    if (!Exam) {
      throw new NotFoundException('Exam not found');
    }

    return Exam;
  }

  async update(id: string, userid: string, updateExamDto: UpdateExamDto) {
    const updatedQuestion = await this.ExamModel.findOneAndUpdate(
      { _id: id, createdBy: userid },
      updateExamDto,
      { new: true },
    );

    if (!updatedQuestion) {
      throw new ConflictException('Unauthorized editing or invalid id');
    }
    return updatedQuestion;
  }

  async remove(id: string, userid: string) {
    const isDeleted = await this.ExamModel.findOneAndDelete({
      _id: id,
      createdBy: userid,
    });

    if (!isDeleted) {
      throw new ConflictException('Unauthorized Deletion or invalid id');
    }

    return {
      message: 'Exam deleted Successfully',
    };
  }

  async findById(id: string) {
    return await this.ExamModel.findById(id);
  }
}
