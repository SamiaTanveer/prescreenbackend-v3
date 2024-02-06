import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateMcqDto } from './dto/update-mcq.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { MCQ } from './entities/mcq.entity';
import { CreateMCQDto } from './dto/create-mcq.dto';
import { MCQSearchDto } from './dto/searchMcq.dto';
import { setSortStage } from 'src/utils/funtions';
import {
  CodingQuestion,
  McqPaginationDto,
  QuestAdminPaginationDto,
  QuestPaginationDto,
  paginationDto,
} from 'src/utils/classes';
import { Test } from 'src/Test/entities/Test.entity';

@Injectable()
export class McqService {
  constructor(
    @InjectModel(Test.name) private testModel: Model<Test>,
    @InjectModel(MCQ.name) private MCQModel: Model<MCQ>,
    @InjectModel(CodingQuestion.name)
    private codingModel: Model<CodingQuestion>,
  ) {}

  searchMCQs(searchDto: MCQSearchDto): MCQ[] | Promise<MCQ[]> {
    const { difficultyLevel, language, tags, title } = searchDto;

    const query: any = {};

    if (title) {
      query['title'] = { $regex: title, $options: 'i' };
    }

    if (language) {
      query['language'] = language;
    }

    if (difficultyLevel) {
      query['difficultyLevel'] = difficultyLevel;
    }

    if (tags) {
      query['tags'] = { $in: tags };
    }

    return this.MCQModel.find(query);
  }

  async createMCQ(dto: CreateMCQDto) {
    // console.log(dto);
    // const mcqfound = await this.MCQModel.findOne({ title: dto.title });
    // if (mcqfound) {
    //   throw new BadRequestException('question is already there');
    // }
    await this.MCQModel.create(dto);
    return {
      message: 'Mcq Created Successfully',
    };
  }

  async getAllMCQ(query: McqPaginationDto) {
    let result;
    const { page, limit, title, sort } = query;
    const sortStage: any = {};
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }
      // console.log(sortStage);
      result = await this.MCQModel.aggregate([
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
              // { $skip: skip },
              { $limit: +limit },
            ],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else {
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }
      result = await this.MCQModel.aggregate([
        {
          $lookup: {
            from: 'tags',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags',
          },
        },
        {
          $facet: {
            questions: [
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const questions = result[0].questions;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      questions: questions,
      total: totalDocs,
    };
  }

  // async getByCompany(
  //   id: string,
  //   page?: number,
  //   limit?: number,
  //   title?: string,
  // ) {
  //   let result;
  //   const matchStage: any = {
  //     createdBy: new mongoose.Types.ObjectId(id),
  //   };
  //   if (page !== undefined && limit !== undefined) {
  //     let skip = (page - 1) * limit;
  //     if (skip < 0) {
  //       skip = 0;
  //     }

  //     result = await this.MCQModel.aggregate([
  //       {
  //         $match: matchStage,
  //       },
  //       {
  //         $lookup: {
  //           from: 'tags',
  //           localField: 'tags',
  //           foreignField: '_id',
  //           as: 'tags',
  //         },
  //       },
  //       ...(title
  //         ? [
  //             {
  //               $match: { title: { $regex: title, $options: 'i' } },
  //             },
  //           ]
  //         : []),
  //       {
  //         $facet: {
  //           questions: [
  //             { $match: matchStage },
  //             { $skip: skip },
  //             { $limit: +limit },
  //           ],
  //           totalDocs: [
  //             { $match: matchStage },
  //             { $skip: skip },
  //             { $limit: +limit },
  //             { $count: 'count' },
  //           ],
  //         },
  //       },
  //     ]);
  //   } else {
  //     console.log('in else');
  //     result = await this.MCQModel.aggregate([
  //       {
  //         $match: matchStage,
  //       },
  //       {
  //         $lookup: {
  //           from: 'tags',
  //           localField: 'tags',
  //           foreignField: '_id',
  //           as: 'tags',
  //         },
  //       },
  //       {
  //         $facet: {
  //           questions: [{ $match: matchStage }],
  //           totalDocs: [{ $match: matchStage }, { $count: 'count' }],
  //         },
  //       },
  //     ]);
  //   }
  //   const questions = result[0].questions;
  //   const totalDocs =
  //     result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
  //   return {
  //     mcqQuestions: questions,
  //     total: totalDocs,
  //   };
  // }

  async companyGeneral(id: string, query: McqPaginationDto) {
    let result;
    const matchStage: any = {
      $or: [
        { createdBy: new mongoose.Types.ObjectId(id) },
        { questionType: 'general' },
      ],
    };
    const { page, limit, title, sort, language, tag } = query;
    const sortStage: any = {};
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }
      // console.log('page, limit....', sortStage);

      result = await this.MCQModel.aggregate([
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
    } else {
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }

      result = await this.MCQModel.aggregate([
        {
          $match: matchStage,
        },
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
      const questions = result[0].questions;
      // console.log(result);
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
      return {
        mcqQuestions: questions,
        total: totalDocs,
      };
    }
  }

  async getMcqs(id: string, query: QuestPaginationDto, isMcqsAllowed: boolean) {
    let result;
    const matchStage: any = isMcqsAllowed
      ? {
          $or: [
            { createdBy: new mongoose.Types.ObjectId(id) },
            { questionType: 'general' },
          ],
        }
      : {};
    if (!isMcqsAllowed) {
      matchStage.createdBy = new mongoose.Types.ObjectId(id);
    }
    const { page, limit, title, difficulty, createdBy } = query;
    if (difficulty) {
      matchStage.difficultyLevel = { $regex: difficulty, $options: 'i' };
    }

    if (createdBy === 'you') {
      matchStage.createdBy = new mongoose.Types.ObjectId(id);
    } else if (createdBy === 'library') {
      if (!isMcqsAllowed) {
        throw new BadRequestException('you cannot access the bank');
      }
      matchStage.questionType = 'general';
      matchStage.createdBy = { $ne: new mongoose.Types.ObjectId(id) };
    }

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      // console.log('page, limit....', sortStage);

      result = await this.MCQModel.aggregate([
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

  async getMcqsForAdmin(id: string, query: QuestAdminPaginationDto) {
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
    // console.log('admin match stage....', matchStage);
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      // console.log('page, limit....', sortStage);

      result = await this.MCQModel.aggregate([
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

  async getByCompany(id: string, query: McqPaginationDto) {
    let result;
    const matchStage: any = {
      createdBy: new mongoose.Types.ObjectId(id),
    };
    const { page, limit, title, language, sort, tag } = query;
    const sortStage: any = {};
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }

      result = await this.MCQModel.aggregate([
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
    } else {
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }

      result = await this.MCQModel.aggregate([
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: 'tags',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags',
          },
        },
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
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      mcqQuestions: questions,
      total: totalDocs,
    };
  }

  async generalQuestions(id: string, query: McqPaginationDto) {
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

      result = await this.MCQModel.aggregate([
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
        result[0].totalDocs && result[0].totalDocs.length > 0
          ? result[0].totalDocs[0].count
          : 0;

      return {
        mcqQuestions: questions,
        total: totalDocs,
      };
    }
    // else {
    //   if (sort) {
    //     sortStage['$sort'] = setSortStage(sort);
    //   }

    //   result = await this.MCQModel.aggregate([
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

  async getById(id: string) {
    const MCQ = await this.MCQModel.findById(id).exec();
    if (!MCQ) {
      throw new NotFoundException('MCQ not found');
    }
    return MCQ;
  }

  async updateMCQ(userId: string, id: string, updateMcqDto: UpdateMcqDto) {
    const updatedMCQs = await this.MCQModel.findOneAndUpdate(
      { _id: id, createdBy: userId },
      updateMcqDto,
      {
        new: true,
      },
    );

    if (!updatedMCQs) {
      throw new ConflictException('Unauthorized Deletion or invalid id');
      // (
      //   'Only the creator company has exclusive editing rights for this question.',
      // );
    }

    return updatedMCQs;
  }

  async deleteMCQ(id: string, userid: string) {
    // TODO: check here if this mcq is included in any tests.
    // 1. custom questions into tests
    // 2. composition questions (how to find this mcq in all? gonna run all composition wale functions to get questions)

    const isDeleted = await this.MCQModel.findOneAndDelete({
      _id: id,
      createdBy: userid,
    });
    if (!isDeleted) {
      throw new ConflictException('Unauthorized Deletion or invalid id');
    }
    if (isDeleted) {
      return { message: 'Mcq Deleted Successfully' };
    }
  }

  async getTotalLength() {
    return (await this.MCQModel.countDocuments()).toString();
  }

  // async getQuestionsByDifficulty(userId: string) {
  //   const easyQuestions = await this.MCQModel.find({
  //     difficultyLevel: 'easy',
  //     createdBy: userId,
  //   });
  //   if (!easyQuestions) {
  //     throw new NotFoundException(`No easy Mcqs found`);
  //   }
  //   const mediumQuestions = await this.MCQModel.find({
  //     difficultyLevel: 'medium',
  //     createdBy: userId,
  //   });
  //   if (!mediumQuestions) {
  //     throw new NotFoundException(`No medium Mcqs found`);
  //   }
  //   const hardQuestions = await this.MCQModel.find({
  //     difficultyLevel: 'hard',
  //     createdBy: userId,
  //   });
  //   if (!hardQuestions) {
  //     throw new NotFoundException(`No hard Mcqs found`);
  //   }

  //   return {
  //     easy: easyQuestions.length,
  //     medium: mediumQuestions.length,
  //     hard: hardQuestions.length,
  //   };
  // }

  // async getQuestionsByDifficulty(language: string) {
  //   const query: any = {
  //     $or: [
  //       { difficultyLevel: 'easy' },
  //       { difficultyLevel: 'medium' },
  //       { difficultyLevel: 'hard' },
  //     ],
  //   };

  //   if (language) {
  //     // Check if the user-provided language exists in the database
  //     const languageExists = await this.MCQModel.findOne({
  //       language,
  //     });

  //     if (languageExists) {
  //       // const languageRegex = new RegExp(language, 'i');
  //       query['language'] = language;
  //     } else {
  //       throw new NotFoundException('Provided language is not present in MCQS');
  //     }
  //   }

  //   const questions = await this.MCQModel.find(query);

  //   if (!questions || questions.length === 0) {
  //     throw new NotFoundException('No MCQs found');
  //   }

  //   const filteredQuestions = questions.reduce((result: any, question) => {
  //     // Group questions by difficulty level
  //     const difficultyLevel = question.difficultyLevel;
  //     if (!result[difficultyLevel]) {
  //       result[difficultyLevel] = [];
  //     }
  //     result[difficultyLevel].push(question);
  //     // console.log(result[difficultyLevel]);

  //     return result;
  //   }, {});
  //   // console.log(filteredQuestions);

  //   return {
  //     easy: filteredQuestions['easy'] ? filteredQuestions['easy'].length : 0,
  //     medium: filteredQuestions['medium']
  //       ? filteredQuestions['medium'].length
  //       : 0,
  //     hard: filteredQuestions['hard'] ? filteredQuestions['hard'].length : 0,
  //   };
  // }

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
  //     // Find questions that have any of the provided tags
  //     query['tags'] = { $in: tags };
  //   }
  //   // console.log(query);

  //   const questions = await this.MCQModel.find(query);

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
  //   // console.log(filteredQuestions);

  //   return {
  //     easy: filteredQuestions['easy'] || { id: [], count: 0 },
  //     medium: filteredQuestions['medium'] || { id: [], count: 0 },
  //     hard: filteredQuestions['hard'] || { id: [], count: 0 },
  //   };
  // }

  async getMcqsByLangTagsCompGen(id: string, language: string, tags: string[]) {
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

    // Check if tags array is provided and not empty
    if (tags && tags.length > 0) {
      // Find questions that have any of the provided tags
      query['tags'] = { $in: tags };
    }

    const questions = await this.MCQModel.find(query);

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

    return {
      easy: filteredQuestions['easy'] || { id: [], count: 0 },
      medium: filteredQuestions['medium'] || { id: [], count: 0 },
      hard: filteredQuestions['hard'] || { id: [], count: 0 },
    };
  }

  async getMcqsByLangTagsComp(id: string, language: string, tags: string[]) {
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
      // Find questions that have any of the provided tags
      query['tags'] = { $in: tags };
    }
    // console.log(query);

    const questions = await this.MCQModel.find(query);

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

    return {
      easy: filteredQuestions['easy'] || { id: [], count: 0 },
      medium: filteredQuestions['medium'] || { id: [], count: 0 },
      hard: filteredQuestions['hard'] || { id: [], count: 0 },
    };
  }

  // async getQuestionsByDiffTags(language: string, tag: string, size: number[]) {
  //   // TODO: why collection????
  //   // let questions = await this.MCQModel.collection

  //   // console.log(typeof size[0]);
  //   let questions = await this.MCQModel.aggregate([
  //     {
  //       $match: {
  //         language,
  //         tag: new mongoose.Types.ObjectId(tag),
  //         difficultyLevel: { $in: ['easy', 'medium', 'hard'] },
  //       },
  //     },
  //     {
  //       $facet: {
  //         easyQuestions: [
  //           {
  //             $match: { difficultyLevel: 'easy' },
  //           },
  //           {
  //             $sample: { size: size[0] },
  //           },
  //           {
  //             $project: {
  //               _id: 1,
  //               // language: 1,
  //               // difficultyLevel: 1,
  //               // Add other properties for easy questions here
  //             },
  //           },
  //         ],
  //         mediumQuestions: [
  //           {
  //             $match: { difficultyLevel: 'medium' },
  //           },
  //           {
  //             $sample: { size: size[1] },
  //           },
  //           {
  //             $project: {
  //               _id: 1,
  //               language: 1,
  //               difficultyLevel: 1,
  //               // Add other properties for medium questions here
  //             },
  //           },
  //         ],
  //         hardQuestions: [
  //           {
  //             $match: { difficultyLevel: 'hard' },
  //           },
  //           {
  //             $sample: { size: size[2] },
  //           },
  //           {
  //             $project: {
  //               _id: 1,
  //               language: 1,
  //               difficultyLevel: 1,
  //               // Add other properties for hard questions here
  //             },
  //           },
  //         ],
  //       },
  //     },
  //     {
  //       $project: {
  //         allQuestions: {
  //           $concatArrays: [
  //             '$easyQuestions',
  //             '$mediumQuestions',
  //             '$hardQuestions',
  //           ],
  //         },
  //       },
  //     },
  //   ]);

  //   questions = questions[0].allQuestions.map((value: any) => value._id);
  //   // const questionIdsAsStrings = questions.map((value: any) => value._id.toString());

  //   // console.log(questions);

  //   // return questionIdsAsStrings;
  //   return questions;
  // }

  async getQuestionsByDiffTagsCompGen(
    id: mongoose.Types.ObjectId,
    language: string,
    tag: mongoose.Types.ObjectId,
    size: number[],
  ) {

    let questions = await this.MCQModel.aggregate([
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
    let questions = await this.MCQModel.aggregate([
      {
        $match: {
          createdBy: id,
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
    // const questionIdsAsStrings = questions.map((value: any) => value._id.toString());

    // return questionIdsAsStrings;
    // questions = questions[0].allQuestions
    //   .map((value: any) => value._id)
    //   .filter((questionId: any) => questionId);
    // console.log(questions);

    return questions;
  }

  async getMcqsByLangSingleTagComp(id: string, language: string, tag: string) {
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
      // Find questions that have any of the provided tags
      query['tag'] = { $in: tag };
    }
    // console.log(query);

    const questions = await this.MCQModel.find(query);

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
    // console.log(filteredQuestions);

    return {
      easy: filteredQuestions['easy'] || { id: [], count: 0 },
      medium: filteredQuestions['medium'] || { id: [], count: 0 },
      hard: filteredQuestions['hard'] || { id: [], count: 0 },
    };
  }

  async getMcqsByLangSingleTagCompGen(
    id: string,
    language: string,
    tag: string,
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

    // Check if tags is provided
    if (tag) {
      // Find questions that have any of the provided tags
      query['tag'] = { $in: tag };
    }

    const questions = await this.MCQModel.find(query);
    // console.log('questions...', questions);

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

    return {
      easy: filteredQuestions['easy'] || { id: [], count: 0 },
      medium: filteredQuestions['medium'] || { id: [], count: 0 },
      hard: filteredQuestions['hard'] || { id: [], count: 0 },
    };
  }

  async getMcqsByLangSingleTagCompGenMan(
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

    const totalDocs = await this.MCQModel.countDocuments(query);
    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const questions = await this.MCQModel.find(query).skip(skip).limit(limit);

      return {
        questions,
        total: totalDocs,
      };
    }
  }
  async getMcqsByLangSingleTagCompMan(
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

    const totalDocs = await this.MCQModel.countDocuments(query);
    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const questions = await this.MCQModel.find(query).skip(skip).limit(limit);

      return {
        questions,
        total: totalDocs,
      };
    }
  }
}

// pipeline for all tags if they are an array
// result = await this.MCQModel.aggregate([
//   {
//     $match: matchStage,
//   },
//   {
//     $lookup: {
//       from: 'tags',
//       let: {
//         tagIds: '$tags',
//       },
//       pipeline: [
//         {
//           $match: {
//             $expr: {
//               $in: ['$_id', '$$tagIds'],
//             },
//           },
//         },
//       ],
//       as: 'tags',
//     },
//   },
//   ...(title
//     ? [
//         {
//           $match: { title: { $regex: title, $options: 'i' } },
//         },
//       ]
//     : []),
//   ...(language
//     ? [
//         {
//           $match: { language: { $regex: language, $options: 'i' } },
//         },
//       ]
//     : []),
//   ...(tag
//     ? [
//         {
//           $addFields: {
//             tags: {
//               $filter: {
//                 input: '$tags',
//                 as: 'tag',
//                 cond: {
//                   $regexMatch: {
//                     input: '$$tag.tagName',
//                     regex: tag,
//                     options: 'i',
//                   },
//                 },
//               },
//             },
//           },
//         },
//       ]
//     : []),
//   ...(tag
//     ? [
//         {
//           $match: {
//             tags: {
//               $ne: [],
//             },
//           },
//         },
//       ]
//     : []),
//   {
//     $facet: {
//       questions: [
//         { $match: matchStage },
//         { $skip: skip },
//         { $limit: +limit },
//         ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
//       ],
//       totalDocs: [
//         { $match: matchStage },
//         { $skip: skip },
//         { $limit: +limit },
//         { $count: 'count' },
//       ],
//     },
//   },
// ]);
