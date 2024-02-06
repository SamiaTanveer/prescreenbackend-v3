import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update_user.dto';
import { CreateUserDto } from './dto/create_user.dto';
import { CreateNewUserDto } from './dto/newUser.dto';
import {
  candidatePaginationDto,
  companyPaginationDto,
} from 'src/utils/classes';
import { setSortStageCompanies } from 'src/utils/funtions';
import { UpdateLoginDetail } from 'src/candidate/dto/updatecandidate.dto';
import { CandidateService } from 'src/candidate/candidate.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    // @InjectModel(User.name) private candidateModel: Model<Candidate>,
    private readonly candidateService: CandidateService,
  ) {}

  async create(ceateUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.UserModel(ceateUserDto);
    return newUser.save();
  }

  async createRandomUser(dto: CreateNewUserDto): Promise<User> {
    const newUser = new this.UserModel(dto);
    return newUser.save();
  }

  async changePassword(user: User, newPassword: string) {
    user.password = newPassword;
    return await user.save();
  }

  async blockUser(userId: string) {
    const updatedUser = await this.UserModel.findOneAndUpdate(
      // { _id: userId, userType: 'company' },
      { _id: userId },
      { $set: { isBlocked: true } },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return { message: 'User has blocked' };
  }

  async unBlockUser(userId: string) {
    const updatedUser = await this.UserModel.findOneAndUpdate(
      // { _id: userId, userType: 'company' },
      { _id: userId },
      { $set: { isBlocked: false } },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return { message: 'User is Unblocked' };
  }

  async GetUser(id: string): Promise<User> {
    // checking if the id has correct length
    if (id.length !== 24) {
      throw new NotFoundException('Id is wrong....');
    }
    const userFound = await this.UserModel.findById(id);
    // console.log(userFound);
    if (!userFound) {
      throw new NotFoundException('User not found');
    }

    return userFound;
  }

  async individualCompan(userId: string) {
    const user = await this.UserModel.findById(userId).exec();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const userDataWithJobs = await this.UserModel.aggregate([
      { $match: { _id: user._id } },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: 'createdBy',
          as: 'jobsData',
        },
      },
      // {
      //   $lookup: {
      //     from: 'companysubscriptions',
      //     localField: '_id',
      //     foreignField: 'company',
      //     as: 'subscriptionPlanDetails',
      //   },
      // },
      {
        $lookup: {
          from: 'companysubscriptions',
          localField: 'subscriptionPlan',
          foreignField: '_id', // Assuming '_id' is the field in 'companysubscriptions' to match with 'subscriptionPlan'
          as: 'subscriptionPlanData',
        },
      },
      {
        $project: {
          user: '$$ROOT',
          jobsData: 1,
          totalJobs: { $size: '$jobsData' },
          subscriptionPlanData: { $arrayElemAt: ['$subscriptionPlanData', 0] },
        },
      },
    ]).exec();

    const finalUserDataWithJobs =
      userDataWithJobs.length > 0 ? userDataWithJobs[0] : {};

    console.log(finalUserDataWithJobs.subscriptionPlanDetails);
    return {
      user,
      jobsData: finalUserDataWithJobs.jobsData,
      totalJobs: finalUserDataWithJobs.totalJobs,
      subscriptionPlanDetails:
        finalUserDataWithJobs.subscriptionPlanDetails || null,
    };
  }

  async individualCompany(userId: string) {
    const user = await this.UserModel.findById(userId).exec();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const userDataWithJobsAndSubscriptions = await this.UserModel.aggregate([
      { $match: { _id: user._id } },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: 'createdBy',
          as: 'jobsData',
        },
      },
      {
        $lookup: {
          from: 'subscriptionplans',
          localField: 'subscriptionPlan',
          foreignField: '_id',
          as: 'companySubscriptionsData',
        },
      },
      {
        $lookup: {
          from: 'companysubscriptions',
          localField: '_id',
          foreignField: 'company',
          as: 'companySubscriptionsData',
        },
      },
      {
        $project: {
          user: '$$ROOT',
          jobsData: 1,
          totalJobs: { $size: '$jobsData' },
          // companySubscriptionsData: 1, // to show full data
          companySubscriptionsData: {
            $map: {
              input: '$companySubscriptionsData',
              as: 'subscription',
              in: {
                _id: '$$subscription._id',
                planTitle: '$$subscription.planTitle',
              },
            },
          },
        },
      },
    ]).exec();

    const finalUserDataWithJobsAndSubscriptions =
      userDataWithJobsAndSubscriptions.length > 0
        ? userDataWithJobsAndSubscriptions[0]
        : {};

    console.log(finalUserDataWithJobsAndSubscriptions.companySubscriptionsData);
    return {
      user,
      jobsData: finalUserDataWithJobsAndSubscriptions.jobsData,
      totalJobs: finalUserDataWithJobsAndSubscriptions.totalJobs,
      companySubscriptionsData:
        finalUserDataWithJobsAndSubscriptions.companySubscriptionsData || null,
    };
  }

  async getAdminDetails(userId: string): Promise<User> {
    // checking if the id has correct length
    if (userId.length !== 24) {
      throw new NotFoundException('Id is wrong....');
    }
    const userFound = await this.UserModel.findById(userId);
    // console.log(userFound);
    if (!userFound) {
      throw new NotFoundException('Admin not found');
    }

    return userFound;
  }

  //   const companyAnalytics = (await this.CompanyModel.aggregate([
  //     {
  //       $match: {
  //         // Specify the field using for 'k' that should not be null
  //         industry: { $ne: null },
  //         country: { $ne: null },
  //       },
  //     },
  //     {
  //       $facet: {
  //         industryCounts: [
  //           {
  //             $group: {
  //               _id: '$industry',
  //               count: { $sum: 1 },
  //             },
  //           },
  //         ],
  //         countryCounts: [
  //           {
  //             $group: {
  //               _id: '$country',
  //               count: { $sum: 1 },
  //             },
  //           },
  //         ],
  //         totalCompaniesCount: [
  //           {
  //             $group: {
  //               _id: null,
  //               totalCount: { $sum: 1 },
  //             },
  //           },
  //         ],
  //       },
  //     },
  //     {
  //       $unwind: '$industryCounts',
  //     },
  //     {
  //       $unwind: '$countryCounts',
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         industryCounts: {
  //           $push: {
  //             k: '$industryCounts._id',
  //             v: '$industryCounts.count',
  //           },
  //         },
  //         countryCounts: {
  //           $push: {
  //             k: '$countryCounts._id',
  //             v: '$countryCounts.count',
  //           },
  //         },
  //       },
  //     },
  //     {
  //       $replaceRoot: {
  //         newRoot: {
  //           $mergeObjects: [
  //             { $arrayToObject: '$industryCounts' },
  //             { $arrayToObject: '$countryCounts' },
  //             { $arrayToObject: '$totalCompaniesCount' },
  //           ],
  //         },
  //       },
  //     },
  //   ])) as any;

  //   console.log(companyAnalytics);
  //   return companyAnalytics.length > 0 ? companyAnalytics.pop() : {};
  // }

  // {
  //   $lookup: {
  //     from: 'SubscriptionPlan', // plan name
  //     localField: 'subscriptionDetails.subscriptionPlan',
  //     foreignField: '_id',
  //     as: 'subscriptionPlans',
  //   },
  // },
  // {
  //   $unwind: '$subscriptionPlans',
  // },

  async superDashboardAnalytics() {
    const pipeline = [
      {
        $facet: {
          candidates: [
            {
              $match: {
                userType: 'candidate',
              },
            },
            {
              $group: {
                _id: null,
                'Total Candidates': {
                  $sum: 1,
                },
              },
            },
          ],
          companies: [
            // {
            //   $match: {
            //     company: { $exists: true },
            //   },
            // },
            {
              $match: {
                userType: 'company',
              },
            },
            {
              $group: {
                _id: null,
                'Total Companies': {
                  $sum: 1,
                },
              },
            },
          ],
          jobs: [
            {
              $lookup: {
                from: 'jobs',
                pipeline: [],
                as: 'jobsData',
              },
            },
            {
              $project: {
                'Total Jobs': { $size: '$jobsData' },
              },
            },
          ],
          applications: [
            {
              $lookup: {
                from: 'candidateapplications',
                pipeline: [],
                as: 'applicationsData',
              },
            },
            {
              $project: {
                'Total Applications': { $size: '$applicationsData' },
              },
            },
          ],
          plans: [
            {
              $lookup: {
                from: 'subscriptionplans',
                pipeline: [],
                as: 'plansData',
              },
            },
            {
              $project: {
                'Total Plans': { $size: '$plansData' },
              },
            },
          ],
          tests: [
            {
              $lookup: {
                from: 'tests',
                pipeline: [],
                as: 'testsData',
              },
            },
            {
              $project: {
                'Total Tests': { $size: '$testsData' },
              },
            },
          ],
          codingquestions: [
            {
              $lookup: {
                from: 'codingquestions',
                pipeline: [],
                as: 'codingquestionsData',
              },
            },
            {
              $project: {
                'Total Codingquestions': { $size: '$codingquestionsData' },
              },
            },
          ],
          mcqs: [
            {
              $lookup: {
                from: 'mcqs',
                pipeline: [],
                as: 'mcqsData',
              },
            },
            {
              $project: {
                'Total Mcqs': { $size: '$mcqsData' },
              },
            },
          ],
          assessments: [
            {
              $lookup: {
                from: 'studentassessments',
                pipeline: [],
                as: 'assessmentsData',
              },
            },
            {
              $project: {
                'Total Assessments': { $size: '$assessmentsData' },
              },
            },
          ],
        },
      },
      // TODO: add total Blogs when comes
      {
        $project: {
          _id: 0,
          'Total Candidates': {
            $arrayElemAt: ['$candidates.Total Candidates', 0],
          },
          'Total Companies': {
            $arrayElemAt: ['$companies.Total Companies', 0],
          },
          'Total Jobs': { $arrayElemAt: ['$jobs.Total Jobs', 0] },
          'Total Applications': {
            $arrayElemAt: ['$applications.Total Applications', 0],
          },
          'Total Plans': {
            $arrayElemAt: ['$plans.Total Plans', 0],
          },
          'Total Tests': { $arrayElemAt: ['$tests.Total Tests', 0] },
          // 'Total Codingquestions': {
          //   $arrayElemAt: ['$codingquestions.Total Codingquestions', 0],
          // },
          // 'Total Mcqs': {
          //   $arrayElemAt: ['$mcqs.Total Mcqs', 0],
          // },
          'Total Questions': {
            $sum: [
              { $arrayElemAt: ['$codingquestions.Total Codingquestions', 0] },
              { $arrayElemAt: ['$mcqs.Total Mcqs', 0] },
            ],
          },
          'Total Assessments': {
            $arrayElemAt: ['$assessments.Total Assessments', 0],
          },
        },
      },
    ];

    const result = await this.UserModel.aggregate(pipeline).exec();
    const finalResult = result.length > 0 ? result[0] : {};
    return finalResult;
  }

  async companyStatistic(userid: string) {
    const matchStage: any = {
      createdBy: new mongoose.Types.ObjectId(userid),
    };

    console.log(matchStage);

    const pipeline = [
      {
        $match: matchStage,
      },
      {
        $facet: {
          jobs: [
            // { $match: matchStage },
            {
              $lookup: {
                from: 'jobs',
                pipeline: [],
                as: 'jobsData',
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
                'Total Jobs': { $size: '$jobsData' },
              },
            },
          ],
          applications: [
            // { $match: matchStage },
            {
              $lookup: {
                from: 'candidateapplications',
                pipeline: [],
                as: 'applicationsData',
              },
            },
            {
              $project: {
                'Total Applications': { $size: '$applicationsData' },
              },
            },
          ],
          plans: [
            // { $match: matchStage },
            {
              $lookup: {
                from: 'subscriptionplans',
                pipeline: [],
                as: 'plansData',
              },
            },
            {
              $project: {
                'Total Plans': { $size: '$plansData' },
              },
            },
          ],
          tests: [
            // { $match: matchStage },
            {
              $lookup: {
                from: 'tests',
                pipeline: [],
                as: 'testsData',
              },
            },
            {
              $project: {
                'Total Tests': { $size: '$testsData' },
              },
            },
          ],
          codingquestions: [
            // { $match: matchStage },
            {
              $lookup: {
                from: 'codingquestions',
                pipeline: [],
                as: 'codingquestionsData',
              },
            },
            {
              $project: {
                'Total Codingquestions': { $size: '$codingquestionsData' },
              },
            },
          ],
          mcqs: [
            // { $match: matchStage },
            {
              $lookup: {
                from: 'mcqs',
                pipeline: [],
                as: 'mcqsData',
              },
            },
            {
              $project: {
                'Total Mcqs': { $size: '$mcqsData' },
              },
            },
          ],
          assessments: [
            // { $match: matchStage },
            {
              $lookup: {
                from: 'studentassessments',
                pipeline: [],
                as: 'assessmentsData',
              },
            },
            {
              $project: {
                'Total Assessments': { $size: '$assessmentsData' },
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          // 'Total Candidates': {
          //   $arrayElemAt: ['$candidates.Total Candidates', 0],
          // },
          // 'Total Companies': {
          //   $arrayElemAt: ['$companies.Total Companies', 0],
          // },
          'Total Jobs': '$jobs.Total Jobs',
          // 'Total Jobs': { $arrayElemAt: ['$jobs.Total Jobs', 0] },
          'Total Applications': {
            $arrayElemAt: ['$applications.Total Applications', 0],
          },
          'Total Plans': {
            $arrayElemAt: ['$plans.Total Plans', 0],
          },
          'Total Tests': { $arrayElemAt: ['$tests.Total Tests', 0] },
          'Total Codingquestions': {
            $arrayElemAt: ['$codingquestions.Total Codingquestions', 0],
          },
          'Total Mcqs': {
            $arrayElemAt: ['$mcqs.Total Mcqs', 0],
          },
          // 'Total Questions': {
          //   $sum: [
          //     { $arrayElemAt: ['$codingquestions.Total Codingquestions', 0] },
          //     { $arrayElemAt: ['$mcqs.Total Mcqs', 0] },
          //   ],
          // },
          'Total Assessments': {
            $arrayElemAt: ['$assessments.Total Assessments', 0],
          },
        },
      },
    ];

    const result = await this.UserModel.aggregate(pipeline).exec();
    const finalResult = result.length > 0 ? result[0] : {};
    return finalResult;
  }

  // async adminAnalytics() {
  //   const pipeline = [
  //     {
  //       $facet: {
  //         candidates: [
  //           {
  //             $match: {
  //               userType: 'candidate',
  //             },
  //           },
  //           {
  //             $group: {
  //               _id: null,
  //               'Total Candidates': {
  //                 $sum: 1,
  //               },
  //               'Blocked Candidates': {
  //                 $sum: {
  //                   $cond: [
  //                     {
  //                       $eq: ['$isBlocked', true],
  //                     },
  //                     1,
  //                     0,
  //                   ],
  //                 },
  //               },
  //             },
  //           },
  //         ],
  //         activeCandidates: [
  //           {
  //             $match: {
  //               userType: 'candidate',
  //               isBlocked: false,
  //             },
  //           },
  //           {
  //             $group: {
  //               _id: null,
  //               'Active Candidates': {
  //                 $sum: 1,
  //               },
  //             },
  //           },
  //         ],
  //         companies: [
  //           {
  //             $match: {
  //               userType: 'company',
  //             },
  //           },
  //           {
  //             $lookup: {
  //               from: 'companysubscriptions',
  //               let: {
  //                 subscriptionId: {
  //                   $toObjectId: '$subscriptionPlan',
  //                 },
  //               },
  //               pipeline: [
  //                 {
  //                   $match: {
  //                     $expr: {
  //                       $eq: ['$$subscriptionId', '$_id'],
  //                     },
  //                   },
  //                 },
  //               ],
  //               as: 'subscriptionDetails',
  //             },
  //           },
  //           {
  //             $unwind: '$subscriptionDetails',
  //           },
  //           {
  //             $lookup: {
  //               from: 'subscriptionplans',
  //               let: {
  //                 subscriptionId: {
  //                   $toObjectId: '$subscriptionDetails.SubscriptionPlan',
  //                 },
  //               },
  //               pipeline: [
  //                 {
  //                   $match: {
  //                     $expr: {
  //                       $eq: ['$$subscriptionId', '$_id'],
  //                     },
  //                   },
  //                 },
  //               ],
  //               as: 'planDetails',
  //             },
  //           },
  //           {
  //             $unwind: '$planDetails',
  //           },
  //           {
  //             $addFields: {
  //               planType: {
  //                 $cond: [
  //                   {
  //                     $ne: [
  //                       {
  //                         $arrayElemAt: ['$planDetails.pricing.price', 0],
  //                       },
  //                       0,
  //                     ],
  //                   },
  //                   'paid',
  //                   'unpaid',
  //                 ],
  //               },
  //             },
  //           },
  //           {
  //             $group: {
  //               _id: null,
  //               'Total Companies': {
  //                 $sum: 1,
  //               },
  //               'Blocked Companies': {
  //                 $sum: {
  //                   $cond: [
  //                     {
  //                       $and: [
  //                         {
  //                           $eq: ['$userType', 'company'],
  //                         },
  //                         '$isBlocked',
  //                       ],
  //                     },
  //                     1,
  //                     0,
  //                   ],
  //                 },
  //               },
  //               'Active Companies': {
  //                 $sum: {
  //                   $cond: [
  //                     {
  //                       $and: [
  //                         {
  //                           $eq: ['$userType', 'company'],
  //                         },
  //                         {
  //                           $eq: ['$isBlocked', false],
  //                         },
  //                       ],
  //                     },
  //                     1,
  //                     0,
  //                   ],
  //                 },
  //               },
  //               paid: {
  //                 $sum: {
  //                   $cond: [
  //                     {
  //                       $eq: ['$planType', 'paid'],
  //                     },
  //                     1,
  //                     0,
  //                   ],
  //                 },
  //               },
  //               unpaid: {
  //                 $sum: {
  //                   $cond: [
  //                     {
  //                       $eq: ['$planType', 'unpaid'],
  //                     },
  //                     1,
  //                     0,
  //                   ],
  //                 },
  //               },
  //             },
  //           },
  //         ],
  //       },
  //     },
  //     {
  //       $project: {
  //         candidatesData: {
  //           $arrayElemAt: ['$candidates', 0],
  //         },
  //         activeCandidatesData: {
  //           $arrayElemAt: ['$activeCandidates', 0],
  //         },
  //         companiesData: {
  //           $arrayElemAt: ['$companies', 0],
  //         },
  //       },
  //     },
  //     {
  //       $project: {
  //         _id: 0,
  //         'Active Companies': '$companiesData.Active Companies',
  //         'Blocked Companies': '$companiesData.Blocked Companies',
  //         'Paid Companies': '$companiesData.paid',
  //         'UnPaid Companies': '$companiesData.unpaid',
  //         'Total Companies': '$companiesData.Total Companies',
  //         'Active Candidates': {
  //           $ifNull: ['$activeCandidatesData.Active Candidates', 0],
  //         },
  //         'Blocked Candidates': '$candidatesData.Blocked Candidates',
  //         'Total Candidates': '$candidatesData.Total Candidates',
  //       },
  //     },
  //   ];

  //   const result = await this.UserModel.aggregate(pipeline).exec();
  //   const finalResult = result.length > 0 ? result[0] : {};
  //   return finalResult;
  // }

  async companyStatistics(userid: string) {
    console.log(userid);
    const matchStage: any = {
      createdBy: new mongoose.Types.ObjectId(userid),
    };
    console.log('hellloooo', matchStage);
    const nestedLookup = {
      $lookup: {
        from: 'companies',
        localField: 'createdByInfo.company',
        foreignField: '_id',
        as: 'companyInfo',
        pipeline: [{ $project: { name: 1, email: 2, industry: 3 } }],
      },
    };

    // const result = await this.jobModel.aggregate([
    //   { $match: matchStage },
    //   {
    //     $facet: {
    //       jobs: [
    //         { $match: matchStage },
    //         {
    //           $lookup: {
    //             from: 'jobs',
    //             localField: '_id',
    //             foreignField: 'createdBy',
    //             as: 'jobsInfo',
    //             // pipeline: [{ $project: { company: 1 } }],
    //           },
    //         },
    //       ],
    //       totalDocs: [{ $match: matchStage }, { $count: 'count' }],
    //     },
    //   },
    // ]);

    const result = await this.UserModel.aggregate([
      // { $match: matchStage },
      {
        $facet: {
          jobs: [
            { $match: matchStage },
            {
              $lookup: {
                from: 'jobs',
                localField: '_id',
                foreignField: 'createdBy',
                as: 'jobsInfo',
                // pipeline: [{ $project: { company: 1 } }],
              },
            },
          ],
          totalDocs: [{ $match: matchStage }, { $count: 'count' }],
        },
      },
    ]);

    const jobs = result[0].jobs;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      jobs: jobs,
      total: totalDocs,
    };
  }

  async getAnalyticsDetail(statusField: string) {
    let matchQuery = {};

    // Set up match query based on the statusField
    if (statusField === 'activeCompanies') {
      matchQuery = {
        userType: 'company',
        isBlocked: false,
      };
    } else if (statusField === 'blockedCompanies') {
      matchQuery = {
        userType: 'company',
        isBlocked: true,
      };
    } else if (statusField === 'paidCompanies') {
      matchQuery = {
        userType: 'company',
        planType: 'paid',
      };
    } else if (statusField === 'unpaidCompanies') {
      matchQuery = {
        userType: 'company',
        planType: 'unpaid',
      };
    } else if (statusField === 'totalCompanies') {
      matchQuery = {
        userType: 'company',
      };
    } else if (statusField === 'activeCandidates') {
      matchQuery = {
        userType: 'candidate',
        isBlocked: false,
      };
    } else if (statusField === 'blockedCandidates') {
      matchQuery = {
        userType: 'candidate',
        isBlocked: true,
      };
    } else if (statusField === 'totalCandidates') {
      matchQuery = {
        userType: 'candidate',
      };
    } else {
      throw new BadRequestException('Invalid status Field');
    }

    // Apply matchQuery to filter the companies
    const companyDetails = await this.UserModel.aggregate([
      {
        $match: matchQuery,
      },
      // Add more pipeline stages
    ]).exec();

    return companyDetails;
  }

  async findByEmail(email: string) {
    const user = await this.UserModel.findOne({ email }).exec();

    if (!user) {
      return {
        message: 'User not found',
      };
    }
    return {
      message: 'User found',
      user,
    };
  }

  async findAll(query: companyPaginationDto) {
    const { page, limit, isActive, isBlocked, name, planName, sort } = query;
    let result;
    const matchStage: any = {
      userType: 'company',
    };
    const sortStage: any = {};
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      console.log('isACtive', isActive);
      if (isActive === '') {
      } else {
        if (isActive !== undefined) {
          if (
            isActive !== 'active' &&
            isActive !== 'inActive' &&
            isActive !== 'expired'
          ) {
            throw new BadRequestException('isActive value is invalid');
          }
        }
      }

      if (name) {
        matchStage.name = { $regex: name, $options: 'i' };
      }
      if (isBlocked) {
        matchStage.isBlocked = isBlocked === 'true' ? true : false;
      }

      if (sort) {
        sortStage['$sort'] = setSortStageCompanies(sort);
      }
      console.log('usertype companies sortstage....', sortStage);

      result = await this.UserModel.aggregate([
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: 'subscriptionplans',
            localField: 'subscriptionPlan',
            foreignField: '_id',
            as: 'subscriptionPlan',
          },
        },
        {
          $unwind: '$subscriptionPlan',
        },
        {
          $lookup: {
            from: 'companysubscriptions',
            localField: '_id',
            foreignField: 'company',
            as: 'companySubscription',
          },
        },
        ...(planName
          ? [
              {
                $match: {
                  'subscriptionPlan.planTitle': {
                    $regex: planName,
                    $options: 'i',
                  },
                },
              },
            ]
          : []),
        ...(isActive
          ? [
              {
                $match: {
                  'companySubscription.subscriptionStatus':
                    isActive === 'active'
                      ? 'active'
                      : isActive == 'inActive'
                        ? 'inActive'
                        : 'expired',
                },
              },
            ]
          : []),
        {
          $unwind: '$companySubscription',
        },
        {
          $project: {
            password: 0,
          },
        },
        {
          $facet: {
            allCompanies: [
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
      const allCompanies = result[0].allCompanies;
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
      if (!allCompanies) {
        throw new NotFoundException('Failed to fetch Companies');
      }
      return {
        companies: allCompanies,
        total: totalDocs,
      };
    }
  }

  async findAllCandidates(query: candidatePaginationDto) {
    const { page, limit, isBlocked, name, sort } = query;
    let result;
    const matchStage: any = {
      userType: 'candidate',
    };
    const sortStage: any = {};
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      if (name) {
        matchStage.name = { $regex: name, $options: 'i' };
      }
      if (isBlocked) {
        matchStage.isBlocked = isBlocked === 'true' ? true : false;
      }

      if (sort) {
        sortStage['$sort'] = setSortStageCompanies(sort);
      }
      console.log('usertype candidates sortstage....', sortStage);

      result = await this.UserModel.aggregate([
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: 'studentassessments',
            localField: '_id',
            foreignField: 'userCandidate',
            as: 'assessments',
          },
        },
        {
          $addFields: {
            assessmentsCount: { $size: '$assessments' },
          },
        },
        {
          $project: {
            password: 0,
            assessments: 0,
          },
        },
        {
          $facet: {
            allCandidates: [
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
      const allCandidates = result[0].allCandidates;
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
      if (!allCandidates) {
        throw new NotFoundException('Failed to fetch Candidates');
      }
      return {
        candidates: allCandidates,
        total: totalDocs,
      };
    }
  }

  async findById(userId: string) {
    const user = await this.UserModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOneUser(email: string) {
    const user = await this.UserModel.findOne({ email });

    if (!user) {
      return false;
    }
    return true;
  }

  async findOneUserByemail(email: string) {
    const user = await this.UserModel.findOne({ email });

    if (user) {
      return user;
    }
    return false;
  }

  // using in login
  async updateUserStatus(email: string): Promise<User> {
    const updatedUser = await this.UserModel.findOneAndUpdate(
      { email: email },
      { isActive: true },
      { new: true },
    );
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // console.log(id, updateUserDto);
    const updatedUser = await this.UserModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true },
    );
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    // console.log('updateduser...', updatedUser);
    return updatedUser;
  }

  async updateLoginDetail(id: string, dto: UpdateLoginDetail) {
    // console.log(id);
    if (dto.email) {
      const user = await this.findByEmail(dto.email);

      if (user.message == 'User found') {
        throw new BadRequestException(
          'This email is not available. Please try another email',
        );
      }

      const updatedCandidate = await this.UserModel.findOneAndUpdate(
        { _id: id },
        dto,
        {
          new: true,
        },
      ).exec();

      // console.log(user);
      // console.log(updatedCandidate);

      if (!updatedCandidate) {
        throw new InternalServerErrorException(
          'Failed to update Login details',
        );
      }

      if (dto.email) {
        const userObj = {
          email: dto.email,
        };

        const isUserUpdated = await this.candidateService.updateLogin(
          id,
          userObj,
        );
        console.log(isUserUpdated);

        if (!isUserUpdated) {
          throw new InternalServerErrorException('Failed to update Candidate');
        }
      }

      return {
        candidate: updatedCandidate,
      };
    }
  }

  remove(id: string) {
    return this.UserModel.findByIdAndDelete(id);
  }

  async checkCompany(id: string) {
    const company = await this.UserModel.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    if (company.isBlocked == true) {
      return true;
    } else {
      return false;
    }
  }
}
