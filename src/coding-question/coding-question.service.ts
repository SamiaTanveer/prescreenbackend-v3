import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CodingQuestionDto } from './dto/create-coding-question.dto';
import { CodingQuestion } from './entities/coding-question.entity';
import { UpdateCodingQuestionDto } from './dto/update-coding-question.dto';
import { CodingSearchDto } from './dto/searcCodingQuestion.dto';
import {
  CodingPaginationDto,
  QuestAdminPaginationDto,
  QuestPaginationDto,
  paginationDto,
} from 'src/utils/classes';
import { setSortStage } from 'src/utils/funtions';

@Injectable()
export class CodingQuestionsService {
  constructor(
    @InjectModel('CodingQuestion')
    private readonly codingQuestionModel: Model<CodingQuestion>,
  ) {}

  createQuestion(codingQuestionDto: CodingQuestionDto) {
    const createdQuestion = new this.codingQuestionModel(codingQuestionDto);
    return createdQuestion.save();
  }

  searchCodingQuestions(
    searchDto: CodingSearchDto,
  ): Promise<CodingQuestionDto[]> {
    const { difficultyLevel, language, tag, title, functionName } = searchDto;

    const query: any = {};

    if (title) {
      query['title'] = { $regex: title, $options: 'i' };
    }
    if (functionName) {
      query['functionName'] = { $regex: functionName };
    }

    if (language) {
      query['language'] = language;
    }

    if (difficultyLevel) {
      query['difficultyLevel'] = difficultyLevel;
    }

    // TODO: fix it according to tag
    if (tag) {
      query['tag'] = { $in: tag };
    }

    return this.codingQuestionModel.find(query);
  }

  async getAllQuestions(query: CodingPaginationDto) {
    let result;
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
      result = await this.codingQuestionModel.aggregate([
        {
          $lookup: {
            from: 'tags',
            localField: 'tag',
            foreignField: '_id',
            as: 'tags',
          },
        },
        {
          $unwind: {
            path: '$tags',
          },
        },
        ...(tag
          ? [
              {
                $match: {
                  'tags.tagName': {
                    $regex: tag,
                    $options: 'i',
                  },
                },
              },
            ]
          : []),
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
            questions: [
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);

      const questions = result[0].questions;
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

      return {
        codingQuestions: questions,
        total: totalDocs,
      };
    }
  }

  async companyGeneralquest(id: string, query: CodingPaginationDto) {
    let result;
    console.log(id);
    const matchStage: any = {
      $or: [
        { createdBy: new mongoose.Types.ObjectId(id) },
        { questionType: 'general' },
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

      result = await this.codingQuestionModel.aggregate([
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: 'tags',
            localField: 'tag',
            foreignField: '_id',
            as: 'tags',
          },
        },
        {
          $unwind: {
            path: '$tags',
          },
        },
        ...(tag
          ? [
              {
                $match: {
                  'tags.tagName': {
                    $regex: tag,
                    $options: 'i',
                  },
                },
              },
            ]
          : []),
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
            questions: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
      const questions = result[0].questions;
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
      if (questions.length === 0) {
        throw new NotFoundException('Company has no codingQuestions');
      }

      return {
        questions: questions,
        total: totalDocs,
      };
    }
    // else {
    //   if (sort) {
    //     sortStage['$sort'] = setSortStage(sort);
    //   }
    //   result = await this.codingQuestionModel.aggregate([
    //     {
    //       $lookup: {
    //         from: 'tags',
    //         localField: 'tags',
    //         foreignField: '_id',
    //         as: 'tags',
    //       },
    //     },
    //     ...(title
    //       ? [
    //           {
    //             $match: { title: { $regex: title, $options: 'i' } },
    //           },
    //         ]
    //       : []),
    //     {
    //       $facet: {
    //         questions: [
    //           { $match: matchStage },
    //           ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
    //         ],
    //       },
    //     },
    //   ]);
    // }
  }

  async getCodingQuestion(
    id: string,
    query: QuestPaginationDto,
    isCodingsAllowed: boolean,
  ) {
    let result;
    // isCodingsAllowed = false;
    const matchStage: any = isCodingsAllowed
      ? {
          $or: [
            { createdBy: new mongoose.Types.ObjectId(id) },
            { questionType: 'general' },
          ],
        }
      : {};
    if (!isCodingsAllowed) {
      matchStage.createdBy = new mongoose.Types.ObjectId(id);
    }
    const { page, limit, title, difficulty, createdBy } = query;
    if (difficulty) {
      matchStage.difficultyLevel = { $regex: difficulty, $options: 'i' };
    }

    if (createdBy === 'you') {
      matchStage.createdBy = new mongoose.Types.ObjectId(id);
    } else if (createdBy === 'library') {
      if (!isCodingsAllowed) {
        throw new BadRequestException('you cannot access the bank');
      }
      matchStage.questionType = 'general';
      matchStage.createdBy = { $ne: new mongoose.Types.ObjectId(id) };
    }
    console.log('coding questions match stage....', matchStage);
    if (page !== undefined && limit !== undefined) {
      // let skip = (page - 1) * limit;
      // if (skip < 0) {
      //   skip = 0;
      // }
      // console.log('page, limit....', sortStage);

      result = await this.codingQuestionModel.aggregate([
        {
          $match: matchStage,
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
            questions: [
              { $match: matchStage },
              // { $skip: skip },
              { $limit: +limit },
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
      const questions = result[0].questions;
      // console.log(result);
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
      return {
        questions: questions,
        total: totalDocs,
      };
    }
  }

  async getCodingsForAdmin(id: string, query: QuestAdminPaginationDto) {
    let result;
    const matchStage: any = {
      $or: [
        { createdBy: new mongoose.Types.ObjectId(id) },
        { questionType: 'general' },
        { questionType: 'private' },
      ],
    };
    const { page, limit, title, difficulty, createdBy } = query;
    if (difficulty) {
      matchStage.difficultyLevel = { $regex: difficulty, $options: 'i' };
    }

    if (createdBy === 'you') {
      matchStage.createdBy = new mongoose.Types.ObjectId(id);
    } else if (createdBy === 'companies') {
      matchStage.questionType = 'private';
    }
    console.log('admin match stage....', matchStage);
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      // console.log('page, limit....', sortStage);

      result = await this.codingQuestionModel.aggregate([
        {
          $match: matchStage,
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
            questions: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
      const questions = result[0].questions;
      // console.log(result);
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
      return {
        questions: questions,
        total: totalDocs,
      };
    }
  }

  async generalQuestions(id: string, query: CodingPaginationDto) {
    let result;
    const matchStage = {
      questionType: 'general',
      createdBy: { $ne: new mongoose.Types.ObjectId(id) },
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

      result = await this.codingQuestionModel.aggregate([
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
            questions: [
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

      result = await this.codingQuestionModel.aggregate([
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
            questions: [
              { $match: matchStage },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    }

    const questions = result[0].questions;

    const totalDocs =
      result[0].totalDocs && result[0].totalDocs.length > 0
        ? result[0].totalDocs[0].count
        : 0;

    return {
      codingQuestions: questions,
      total: totalDocs,
    };
  }

  async questByCompany(id: string, query: CodingPaginationDto) {
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

      result = await this.codingQuestionModel.aggregate([
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: 'tags',
            localField: 'tag',
            foreignField: '_id',
            as: 'tags',
          },
        },
        {
          $unwind: {
            path: '$tags',
          },
        },
        ...(tag
          ? [
              {
                $match: {
                  'tags.tagName': {
                    $regex: tag,
                    $options: 'i',
                  },
                },
              },
            ]
          : []),
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
            questions: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);

      const questions = result[0].questions;
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
      if (questions.lenght === 0) {
        throw new NotFoundException('Company has no codingQuestions');
      }

      console.log({
        codingQuestions: questions,
        total: totalDocs,
      });
      return {
        codingQuestions: questions,
        total: totalDocs,
      };
    }
    // else {
    //   if (sort) {
    //     sortStage['$sort'] = setSortStage(sort);
    //   }
    //   result = await this.codingQuestionModel.aggregate([
    //     {
    //       $lookup: {
    //         from: 'tags',
    //         localField: 'tags',
    //         foreignField: '_id',
    //         as: 'tags',
    //       },
    //     },
    //     ...(title
    //       ? [
    //           {
    //             $match: { title: { $regex: title, $options: 'i' } },
    //           },
    //         ]
    //       : []),
    //     {
    //       $facet: {
    //         questions: [
    //           { $match: matchStage },
    //           ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
    //         ],
    //         totalDocs: [{ $match: matchStage }, { $count: 'count' }],
    //       },
    //     },
    //   ]);
    // }
  }

  async getCodingQuestions(id: string, query: QuestPaginationDto) {
    let result;
    const matchStage: any = {};
    const { page, limit, title, difficulty, createdBy } = query;
    if (difficulty) {
      matchStage.difficultyLevel = { $regex: difficulty, $options: 'i' };
    }

    if (createdBy === 'you') {
      matchStage.createdBy = new mongoose.Types.ObjectId(id);
    } else if (createdBy === 'library') {
      matchStage.questionType = 'general';
    }
    console.log(matchStage);
    if (page !== undefined && limit !== undefined) {
      // let skip = (page - 1) * limit;
      // if (skip < 0) {
      //   skip = 0;
      // }
      // console.log('page, limit....', sortStage);

      result = await this.codingQuestionModel.aggregate([
        {
          $match: matchStage,
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
            questions: [
              { $match: matchStage },
              // { $skip: skip },
              { $limit: +limit },
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
      const questions = result[0].questions;
      // console.log(result);
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
      return {
        questions: questions,
        total: totalDocs,
      };
    }
  }

  async getQuestionById(id: string) {
    const question = await this.codingQuestionModel.findOne({ _id: id }).exec();

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async updateQuestion(
    userId: string,
    id: string,
    updateCodingQuestionDto: UpdateCodingQuestionDto,
  ) {
    const updatedQuestion = await this.codingQuestionModel.findOneAndUpdate(
      {
        _id: id,
        createdBy: userId,
      },
      updateCodingQuestionDto,
      { new: true },
    );

    if (!updatedQuestion) {
      throw new ConflictException('Unauthorized editing or invalid id');
    }
    return updatedQuestion;
  }

  async deleteQuestion(id: string, userid: string) {
    const deletedQuestion = await this.codingQuestionModel.findOneAndDelete({
      createdBy: userid,
      _id: id,
    });
    if (!deletedQuestion) {
      throw new ConflictException('Unauthorized Deletion or invalid id');
    }
    return { message: 'Coding Question deleted' };
  }

  async getTotalLength() {
    return (await this.codingQuestionModel.countDocuments()).toString();
  }

  // async getQuestionsByLangTags(language: string, tags: string[]) {
  //   const query: any = {
  //     $or: [
  //       { difficultyLevel: 'easy' },
  //       { difficultyLevel: 'medium' },
  //       { difficultyLevel: 'hard' },
  //     ],
  //   };
  //   if (language) {
  //     query['language'] = language;
  //   }

  //   // Check if tags array is provided and not empty
  //   if (tags && tags.length > 0) {
  //     // Find questions that have any of the provided tag
  //     query['tags'] = { $in: tags };
  //   }
  //   // console.log(query);

  //   const questions = await this.codingQuestionModel.find(query);

  //   const filteredQuestions = questions.reduce((result: any, question) => {
  //     // Group questions by difficulty level
  //     const difficultyLevel = question.difficultyLevel;
  //     if (!result[difficultyLevel]) {
  //       result[difficultyLevel] = { id: [], count: 0 };
  //     }
  //     result[difficultyLevel].id.push(question._id);
  //     result[difficultyLevel].count++;

  //     return result;
  //   }, {});
  //   // console.log('filtered questions', filteredQuestions);

  //   return {
  //     easy: filteredQuestions['easy'] || { id: [], count: 0 },
  //     medium: filteredQuestions['medium'] || { id: [], count: 0 },
  //     hard: filteredQuestions['hard'] || { id: [], count: 0 },
  //   };
  // }

  async getQuestionsByLangTagsCompGen(
    id: string,
    language: string,
    tags: string[],
  ) {
    const query: any = {
      $or: [{ createdBy: id }, { questionType: 'general' }],
      $and: [
        {
          $or: [
            { difficultyLevel: 'easy' },
            { difficultyLevel: 'medium' },
            { difficultyLevel: 'hard' },
          ],
        },
      ],
    };
    if (language) {
      query['language'] = language;
    }

    if (tags && tags.length > 0) {
      console.log(tags.length);
      // Find questions that have any of the provided tag
      query['tags'] = { $in: tags };
    }
    // Check if tags array is provided and not empty

    console.log('query????', query);
    const questions = await this.codingQuestionModel.find(query);

    const filteredQuestions = questions.reduce((result: any, question) => {
      // Group questions by difficulty level
      const difficultyLevel = question.difficultyLevel;
      if (!result[difficultyLevel]) {
        result[difficultyLevel] = { id: [], count: 0 };
      }
      result[difficultyLevel].id.push(question._id);
      result[difficultyLevel].count++;

      return result;
    }, {});
    // console.log('filtered questions', filteredQuestions);

    return {
      easy: filteredQuestions['easy'] || { id: [], count: 0 },
      medium: filteredQuestions['medium'] || { id: [], count: 0 },
      hard: filteredQuestions['hard'] || { id: [], count: 0 },
    };
  }

  async getQuestionsByLangTagsComp(
    id: string,
    language: string,
    tags: string[],
  ) {
    const query: any = {
      createdBy: id,
      $or: [
        { difficultyLevel: 'easy' },
        { difficultyLevel: 'medium' },
        { difficultyLevel: 'hard' },
      ],
    };
    if (language) {
      query['language'] = language;
    }

    // Check if tags array is provided and not empty
    if (tags && tags.length > 0) {
      // Find questions that have any of the provided tag
      query['tags'] = { $in: tags };
    }

    const questions = await this.codingQuestionModel.find(query);

    const filteredQuestions = questions.reduce((result: any, question) => {
      // Group questions by difficulty level
      const difficultyLevel = question.difficultyLevel;
      if (!result[difficultyLevel]) {
        result[difficultyLevel] = { id: [], count: 0 };
      }
      result[difficultyLevel].id.push(question._id);
      result[difficultyLevel].count++;

      return result;
    }, {});
    // console.log('filtered questions', filteredQuestions);

    return {
      easy: filteredQuestions['easy'] || { id: [], count: 0 },
      medium: filteredQuestions['medium'] || { id: [], count: 0 },
      hard: filteredQuestions['hard'] || { id: [], count: 0 },
    };
  }

  async getQuestionsByLangTagComp(id: string, language: string, tag: string) {
    const query: any = {
      createdBy: id,
      $or: [
        { difficultyLevel: 'easy' },
        { difficultyLevel: 'medium' },
        { difficultyLevel: 'hard' },
      ],
    };
    if (language) {
      query['language'] = language;
    }

    // Check if tags array is provided and not empty
    if (tag) {
      // Find questions that have any of the provided tag
      // TODO:
      query['tags'] = { $in: tag };
    }

    const questions = await this.codingQuestionModel.find(query);

    const filteredQuestions = questions.reduce((result: any, question) => {
      // Group questions by difficulty level
      const difficultyLevel = question.difficultyLevel;
      if (!result[difficultyLevel]) {
        result[difficultyLevel] = { id: [], count: 0 };
      }
      result[difficultyLevel].id.push(question._id);
      result[difficultyLevel].count++;

      return result;
    }, {});
    // console.log('filtered questions', filteredQuestions);

    return {
      easy: filteredQuestions['easy'] || { id: [], count: 0 },
      medium: filteredQuestions['medium'] || { id: [], count: 0 },
      hard: filteredQuestions['hard'] || { id: [], count: 0 },
    };
  }

  async getQuestionsByDiffTags(
    language: string,
    tags: string[],
    size: number[],
  ) {
    let questions = await this.codingQuestionModel.collection
      .aggregate([
        {
          $match: {
            language,
            tags: { $in: tags },
            difficultyLevel: { $in: ['easy', 'medium', 'hard'] },
          },
        },
        {
          $facet: {
            easyQuestions: [
              {
                $match: { difficultyLevel: 'easy' },
              },
              {
                $sample: { size: size[0] },
              },
              {
                $project: {
                  _id: 1,
                  language: 1,
                  difficultyLevel: 1,
                  // Add other properties for easy questions here
                },
              },
            ],
            mediumQuestions: [
              {
                $match: { difficultyLevel: 'medium' },
              },
              {
                $sample: { size: size[1] },
              },
              {
                $project: {
                  _id: 1,
                  language: 1,
                  difficultyLevel: 1,
                  // Add other properties for medium questions here
                },
              },
            ],
            hardQuestions: [
              {
                $match: { difficultyLevel: 'hard' },
              },
              {
                $sample: { size: size[2] },
              },
              {
                $project: {
                  _id: 1,
                  language: 1,
                  difficultyLevel: 1,
                  // Add other properties for hard questions here
                },
              },
            ],
          },
        },
        {
          $project: {
            allQuestions: {
              $concatArrays: [
                '$easyQuestions',
                '$mediumQuestions',
                '$hardQuestions',
              ],
            },
          },
        },
      ])
      .toArray();

    questions = questions[0].allQuestions.map((value: any) => value._id);
    // const questionIdsAsStrings = questions.map((value: any) => value._id.toString());

    return questions;
    // return questionIdsAsStrings;
  }

  async getQuestionsByDiffTagsCompGen(
    id: mongoose.Types.ObjectId,
    language: string,
    tag: mongoose.Types.ObjectId,
    size: number[],
  ) {
    let questions = await this.codingQuestionModel.aggregate([
      {
        $match: {
          $or: [{ createdBy: id }, { questionType: 'general' }],
          language: language,
          tag: tag,

          difficultyLevel: { $in: ['easy', 'medium', 'hard'] },
        },
      },
      {
        $facet: {
          easyQuestions: [
            {
              $match: { difficultyLevel: 'easy' },
            },
            {
              $sample: { size: size[0] },
            },
            {
              $project: {
                _id: 1,
                // language: 1,
                // difficultyLevel: 1,
                // Add other properties for easy questions here
              },
            },
          ],
          mediumQuestions: [
            {
              $match: { difficultyLevel: 'medium' },
            },
            {
              $sample: { size: size[1] },
            },
            {
              $project: {
                _id: 1,
                language: 1,
                difficultyLevel: 1,
                // Add other properties for medium questions here
              },
            },
          ],
          hardQuestions: [
            {
              $match: { difficultyLevel: 'hard' },
            },
            {
              $sample: { size: size[2] },
            },
            {
              $project: {
                _id: 1,
                language: 1,
                difficultyLevel: 1,
                // Add other properties for hard questions here
              },
            },
          ],
        },
      },
      {
        $project: {
          allQuestions: {
            $concatArrays: [
              '$easyQuestions',
              '$mediumQuestions',
              '$hardQuestions',
            ],
          },
        },
      },
    ]);
    questions = questions[0].allQuestions.map((value: any) => value._id);

    return questions;
  }

  async getQuestionsByDiffTagsComp(
    id: mongoose.Types.ObjectId,
    language: string,
    tag: mongoose.Types.ObjectId,
    size: number[],
  ) {
    let questions = await this.codingQuestionModel.collection
      .aggregate([
        {
          $match: {
            createdBy: id,
            language: language,
            tag: tag,
            // tag: { $in: [tags] },
            difficultyLevel: { $in: ['easy', 'medium', 'hard'] },
          },
        },
        {
          $facet: {
            easyQuestions: [
              {
                $match: { difficultyLevel: 'easy' },
              },
              {
                $sample: { size: size[0] },
              },
              {
                $project: {
                  _id: 1,
                  language: 1,
                  difficultyLevel: 1,
                  // Add other properties for easy questions here
                },
              },
            ],
            mediumQuestions: [
              {
                $match: { difficultyLevel: 'medium' },
              },
              {
                $sample: { size: size[1] },
              },
              {
                $project: {
                  _id: 1,
                  language: 1,
                  difficultyLevel: 1,
                  // Add other properties for medium questions here
                },
              },
            ],
            hardQuestions: [
              {
                $match: { difficultyLevel: 'hard' },
              },
              {
                $sample: { size: size[2] },
              },
              {
                $project: {
                  _id: 1,
                  language: 1,
                  difficultyLevel: 1,
                  // Add other properties for hard questions here
                },
              },
            ],
          },
        },
        {
          $project: {
            allQuestions: {
              $concatArrays: [
                '$easyQuestions',
                '$mediumQuestions',
                '$hardQuestions',
              ],
            },
          },
        },
      ])
      .toArray();

    questions = questions[0].allQuestions.map((value: any) => value._id);
    // const questionIdsAsStrings = questions.map((value: any) => value._id.toString());

    return questions;
    // return questionIdsAsStrings;
  }

  async getQuestionsByLangSingleTagCompGen(
    id: string,
    language: string,
    tag: string,
  ) {
    // console.log('id', id);
    const query: any = {
      $or: [{ createdBy: id }, { questionType: 'general' }],
      $and: [
        {
          $or: [
            { difficultyLevel: 'easy' },
            { difficultyLevel: 'medium' },
            { difficultyLevel: 'hard' },
          ],
        },
      ],
    };
    if (language) {
      query['language'] = language;
    }

    // Check if tags array is provided
    if (tag) {
      // Find questions that have any of the provided tag
      // TODO: fix according to tag
      query['tag'] = { $in: tag };
    }
    console.log('query', query);

    const questions = await this.codingQuestionModel.find(query);

    const filteredQuestions = questions.reduce((result: any, question) => {
      // Group questions by difficulty level
      const difficultyLevel = question.difficultyLevel;
      if (!result[difficultyLevel]) {
        result[difficultyLevel] = { id: [], count: 0 };
      }
      result[difficultyLevel].id.push(question._id);
      result[difficultyLevel].count++;

      return result;
    }, {});
    // console.log('filtered questions', filteredQuestions);

    return {
      easy: filteredQuestions['easy'] || { id: [], count: 0 },
      medium: filteredQuestions['medium'] || { id: [], count: 0 },
      hard: filteredQuestions['hard'] || { id: [], count: 0 },
    };
  }

  async getQuestionsByLangSingleTagComp(
    id: string,
    language: string,
    tag: string,
  ) {
    console.log('id', id);
    const query: any = {
      createdBy: id,
      $or: [
        { difficultyLevel: 'easy' },
        { difficultyLevel: 'medium' },
        { difficultyLevel: 'hard' },
      ],
    };
    if (language) {
      query['language'] = language;
    }

    // Check if tags array is provided and not empty
    if (tag) {
      // Find questions that have any of the provided tag
      // TODO: fix according to tag
      query['tag'] = { $in: tag };
    }
    console.log('query', query);

    const questions = await this.codingQuestionModel.find(query);

    const filteredQuestions = questions.reduce((result: any, question) => {
      // Group questions by difficulty level
      const difficultyLevel = question.difficultyLevel;
      if (!result[difficultyLevel]) {
        result[difficultyLevel] = { id: [], count: 0 };
      }
      result[difficultyLevel].id.push(question._id);
      result[difficultyLevel].count++;

      return result;
    }, {});
    // console.log('filtered questions', filteredQuestions);

    return {
      easy: filteredQuestions['easy'] || { id: [], count: 0 },
      medium: filteredQuestions['medium'] || { id: [], count: 0 },
      hard: filteredQuestions['hard'] || { id: [], count: 0 },
    };
  }

  async getQuestionsByLangSingleTagCompGenMan(
    id: string,
    language: string,
    tag: string,
    pagination: paginationDto,
  ) {
    const { page, limit } = pagination;
    const query: any = {
      $or: [{ createdBy: id }, { questionType: 'general' }],
      $and: [
        {
          $or: [
            { difficultyLevel: 'easy' },
            { difficultyLevel: 'medium' },
            { difficultyLevel: 'hard' },
          ],
        },
      ],
    };

    if (language) {
      query['language'] = language;
    }

    // Check if tags is provided
    if (tag) {
      // Find questions that have any of the provided tags
      query['tag'] = { $in: tag };
    }

    const totalDocs = await this.codingQuestionModel.countDocuments(query);
    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const questions = await this.codingQuestionModel
        .find(query)
        .skip(skip)
        .limit(limit);

      return {
        questions,
        total: totalDocs,
      };
    }
  }

  async getQuestionsByLangSingleTagCompMan(
    id: string,
    language: string,
    tag: string,
    pagination: paginationDto,
  ) {
    const { page, limit } = pagination;
    const query: any = {
      $or: [{ createdBy: id }],
      $and: [
        {
          $or: [
            { difficultyLevel: 'easy' },
            { difficultyLevel: 'medium' },
            { difficultyLevel: 'hard' },
          ],
        },
      ],
    };

    if (language) {
      query['language'] = language;
    }

    // Check if tags is provided
    if (tag) {
      // Find questions that have any of the provided tags
      query['tag'] = { $in: tag };
    }
    console.log('this is query....', query);

    const totalDocs = await this.codingQuestionModel.countDocuments(query);
    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const questions = await this.codingQuestionModel
        .find(query)
        .skip(skip)
        .limit(limit);

      return {
        questions,
        total: totalDocs,
      };
    }
  }
}
