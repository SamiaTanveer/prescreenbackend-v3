import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Test } from './entities/Test.entity';
import { CreateManualTestDto, CreateTestDto } from './dto/CreateTest.dto';
import { UpdateTestDto } from './dto/update-Test.dto';
import { CompanyTestPaginationDto, TestPaginationDto } from 'src/utils/classes';
import { setSortStage, setSortStageComAssessment } from 'src/utils/funtions';
import { CompanyAssessment } from 'src/companyAssessment/entities/companyAssessment.entity';

@Injectable()
export class TestService {
  constructor(
    @InjectModel(Test.name) private TestModel: Model<Test>,
    @InjectModel(CompanyAssessment.name)
    private companyAssessmentModel: Model<CompanyAssessment>,
    // @InjectModel(Job.name) private jobModel: Model<Job>,
    // @InjectModel(User.name) private UserModel: Model<User>,
  ) {}

  async create(userType: string, userid: string, dto: CreateTestDto) {
    dto.createdBy = userid;

    const testFound = await this.TestModel.findOne({
      createdBy: dto.createdBy,
      testName: {
        $regex: new RegExp(`^${dto.testName}$`, 'i'),
      },
    });

    if (testFound) {
      throw new BadRequestException('Test wiwth this name is already present');
    }

    if (
      dto.compositionEasy == 0 &&
      dto.compositionMedium == 0 &&
      dto.compositionHard == 0
    ) {
      throw new BadRequestException('Cannot create empty test');
    }
    if (userType === 'superAdmin') {
      // if superAdmin then create test with type general
      dto.type = 'general';
    } else {
      dto.type = 'private';
    }

    const createdTest = await this.TestModel.create(dto);
    if (!createdTest) {
      throw new NotFoundException('Cannot create Test');
    }
    return createdTest;
  }

  async createManual(
    userType: string,
    userid: string,
    dto: CreateManualTestDto,
  ) {
    dto.createdBy = userid;

    const testFound = await this.TestModel.findOne({
      createdBy: dto.createdBy,
      testName: {
        $regex: new RegExp(`^${dto.testName}$`, 'i'),
      },
    });

    if (testFound) {
      throw new BadRequestException('Test wiwth this name is already present');
    }

    if (userType === 'superAdmin') {
      // if superAdmin then create test with type general
      dto.type = 'general';
    } else {
      dto.type = 'private';
    }

    const createdTest = await this.TestModel.create(dto);
    if (!createdTest) {
      throw new NotFoundException('Cannot create Test');
    }
    return createdTest;
  }

  async findAllByCompanyGeneral(userid: string, query: TestPaginationDto) {
    const { page, limit, testName, language, sort, tag, testType } = query;
    const sortStage: any = {};
    const matchStage: any = {
      $or: [
        { createdBy: new mongoose.Types.ObjectId(userid) },
        { type: 'general' },
      ],
    };
    // const matchStage: any = {
    //   createdBy: new mongoose.Types.ObjectId(userid),
    // };

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      if (sort) {
        sortStage['$sort'] = setSortStageComAssessment(sort);
      }

      const pipeline = [
        { $match: matchStage },
        ...(testName
          ? [
              {
                $match: { testName: { $regex: testName, $options: 'i' } },
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
        ...(testType
          ? [
              {
                $match: { testType: { $regex: testType, $options: 'i' } },
              },
            ]
          : []),
        {
          $lookup: {
            from: 'tags',
            localField: 'tag',
            foreignField: '_id',
            as: 'tag',
          },
        },
        { $unwind: '$tag' },
        ...(tag
          ? [
              {
                $match: { 'tag.tagName': { $regex: tag, $options: 'i' } },
              },
            ]
          : []),
        {
          $facet: {
            allTests: [
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
      ];

      const result = await this.TestModel.aggregate(pipeline);
      const allTests = result[0].allTests;
      const totalTests =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

      if (!allTests) {
        throw new NotFoundException('Failed to fetch Tests');
      }

      return {
        tests: allTests,
        total: totalTests,
      };
    }
  }

  async findAllByCompany(userid: string, query: TestPaginationDto) {
    // let result;
    const { page, limit, testName, language, sort, tag, testType } = query;
    const sortStage: any = {};
    const matchStage: any = {
      createdBy: new mongoose.Types.ObjectId(userid),
    };

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      if (sort) {
        sortStage['$sort'] = setSortStageComAssessment(sort);
      }
      const pipeline = [
        { $match: matchStage },
        ...(testName
          ? [
              {
                $match: { testName: { $regex: testName, $options: 'i' } },
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
        ...(testType
          ? [
              {
                $match: { testType: { $regex: testType, $options: 'i' } },
              },
            ]
          : []),
        {
          $lookup: {
            from: 'tags',
            localField: 'tag',
            foreignField: '_id',
            as: 'tag',
          },
        },
        { $unwind: '$tag' },
        ...(tag
          ? [
              {
                $match: { 'tag.tagName': { $regex: tag, $options: 'i' } },
              },
            ]
          : []),
        {
          $facet: {
            allTests: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [
              { $match: matchStage },
              // { $skip: skip },
              // { $limit: +limit },
              { $count: 'count' },
            ],
          },
        },
      ];
      const result = await this.TestModel.aggregate(pipeline);

      const allTests = result[0].allTests;
      const totalTests =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
      if (!allTests) {
        throw new NotFoundException('Failed to fetch Tests');
      }
      return {
        tests: allTests,
        total: totalTests,
      };
    }
  }

  async getByCompany(
    id: string,
    query: CompanyTestPaginationDto,
    isTestsAllowed: boolean,
  ) {
    let result;
    // console.log(isTestsAllowed);
    const matchStage: any = isTestsAllowed
      ? {
          $or: [
            { createdBy: new mongoose.Types.ObjectId(id) },
            { type: 'general' },
          ],
        }
      : {};
    if (!isTestsAllowed) {
      matchStage.createdBy = new mongoose.Types.ObjectId(id);
    }
    const { page, limit, testName, testType, createdBy } = query;

    if (createdBy === 'you') {
      matchStage.createdBy = new mongoose.Types.ObjectId(id);
    } else if (createdBy === 'library') {
      if (!isTestsAllowed) {
        throw new BadRequestException('you cannot access the test bank');
      }
      matchStage.type = 'general';
      matchStage.createdBy = { $ne: new mongoose.Types.ObjectId(id) };
    }
    console.log(matchStage);
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.TestModel.aggregate([
        {
          $match: matchStage,
        },
        ...(testName
          ? [
              {
                $match: { testName: { $regex: testName, $options: 'i' } },
              },
            ]
          : []),
        ...(testType
          ? [
              {
                $match: { testType: { $regex: testType, $options: 'i' } },
              },
            ]
          : []),
        {
          $facet: {
            tests: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
      const tests = result[0].tests;
      // console.log(result);
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

      return {
        tests: tests,
        total: totalDocs,
      };
    }
  }

  async findAll(query: TestPaginationDto) {
    // let result;
    const { page, limit, testName, language, sort, tag, testType } = query;
    const sortStage: any = {};
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }

      const result = await this.TestModel.aggregate([
        ...(language
          ? [
              {
                $match: { language: { $regex: language, $options: 'i' } },
              },
            ]
          : []),
        ...(testName
          ? [
              {
                $match: { testName: { $regex: testName, $options: 'i' } },
              },
            ]
          : []),
        ...(testType
          ? [
              {
                $match: { testType: { $regex: testType, $options: 'i' } },
              },
            ]
          : []),
        {
          $lookup: {
            from: 'tags',
            localField: 'tag',
            foreignField: '_id',
            as: 'tags',
          },
        },
        { $unwind: '$tags' },
        ...(tag
          ? [
              {
                $match: { 'tags.tagName': { $regex: tag, $options: 'i' } },
              },
            ]
          : []),
        // {
        //   $project: {
        //     _id: 1,
        //     tagName: '$tags.tagName',
        //   },
        // },
        {
          $facet: {
            allTests: [
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [
              // { $skip: skip },
              // { $limit: +limit },
              { $count: 'count' },
            ],
          },
        },
      ]);

      // if (testName) {
      //   // Make the name case-insensitive also match substrings
      //   const matchStage = { testName: { $regex: new RegExp(testName, 'i') } };

      //   result = await this.TestModel.aggregate([
      //     {
      //       $facet: {
      //         allCompanies: [
      //           { $match: matchStage },
      //           { $skip: skip },
      //           { $limit: +limit },
      //         ],
      //         totalDocs: [{ $match: matchStage }, { $count: 'count' }],
      //       },
      //     },
      //   ]);
      // }
      const allTests = result[0].allTests;
      const totalTests =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
      if (!allTests) {
        throw new NotFoundException('Failed to fetch Tests');
      }
      return {
        tests: allTests,
        total: totalTests,
      };
    }
  }

  async getTestsForAdmin(id: string, query: TestPaginationDto) {
    let result;
    const matchStage: any = {
      $or: [
        { createdBy: new mongoose.Types.ObjectId(id) },
        { type: 'general' },
        { type: 'private' },
      ],
    };
    const { page, limit, testName, testType, createdBy } = query;

    if (createdBy === 'you') {
      matchStage.createdBy = new mongoose.Types.ObjectId(id);
    } else if (createdBy === 'companies') {
      matchStage.type = 'private';
    }
    console.log('admin test match stage....', matchStage);
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      // console.log('page, limit....', sortStage);

      result = await this.TestModel.aggregate([
        {
          $match: matchStage,
        },
        ...(testName
          ? [
              {
                $match: { testName: { $regex: testName, $options: 'i' } },
              },
            ]
          : []),
        ...(testType
          ? [
              {
                $match: { testType: { $regex: testType, $options: 'i' } },
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
        tests: questions,
        total: totalDocs,
      };
    }
  }

  async findById(id: string) {
    const test = await this.TestModel.findById(id)
      .populate({ path: 'createdBy', select: 'name email userType' })
      .exec();
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }

  async update(userId: string, id: string, dto: UpdateTestDto) {
    const updatedTest = await this.TestModel.findOneAndUpdate(
      { _id: id, createdBy: userId },
      dto,
      {
        new: true,
      },
    );

    if (!updatedTest) {
      throw new ConflictException('Unauthorized Deletion or invalid id');
      // (
      //   'Only the creator company has exclusive editing rights for this question.',
      // );
    }

    return updatedTest;
  }

  async PutTestIntoBank(id: string) {
    const updatedTest = await this.TestModel.findOneAndUpdate(
      { _id: id },
      { testType: 'general' },
      {
        new: true,
      },
    );

    if (!updatedTest) {
      throw new ConflictException('invalid id');
    }

    return updatedTest;
  }

  async updatepickedTest(id: string, dto: UpdateTestDto) {
    const foundTest = await this.TestModel.findOneAndUpdate({
      _id: id,
    });

    let updatedTest;
    if (foundTest?.type == 'general') {
      updatedTest = await this.TestModel.findOneAndUpdate(
        {
          _id: id,
        },
        dto,
        {
          new: true,
        },
      );
    }

    if (!updatedTest) {
      throw new ConflictException('Only general tests are allowed to update.');
    }

    return updatedTest;
  }

  async remove(id: string, userid: string) {
    // first check this test is not included inside any company assessments
    const usedInAssessments = await this.companyAssessmentModel.find({
      tests: id,
    });

    let usedInResources: any[] = [];
    if (usedInAssessments) {
      usedInResources = usedInResources.concat(
        usedInAssessments.map((item) => {
          return {
            id: item.id,
            name: item.name,
            // jobRole: item.job,
            // jobRole: item.jobRole,
          };
        }),
      );
    }

    const allArraysEmpty = usedInResources.every(
      (arr: any[]) => arr.length === 0,
    );
    if (!allArraysEmpty) {
      throw new BadRequestException(
        'This Test cannot be deleted as it is being used inside company assessments',
      );
      // return {
      //   message: 'Test is used in the following resources:',
      //   companyAssessments: usedInResources,
      // };
    } else {
      const isDeleted = await this.TestModel.findOneAndDelete({
        _id: id,
        createdBy: userid,
      });
      // make sure these tests are not included in any company assessments

      if (!isDeleted) {
        throw new ConflictException('Unauthorized Deletion or invalid id');
      }

      return {
        message: 'Test deleted Successfully',
      };
    }
  }
}
