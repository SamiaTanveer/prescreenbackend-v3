import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CandidateDto } from './dto/create-candidate.dto';
import { Candidate } from './entities/candidate.entity';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { User } from 'src/user/entities/user.entity';
import {
  JobSeekingStatusDto,
  Qualifications,
  UpdateLoginDetail,
} from './dto/updatecandidate.dto';
import { CandidateApplication } from 'src/candidate-application/entities/candidate-application.entity';
import { RandomCandidateDto } from './dto/create-randomCandidate.dto';
import { paginationDto } from 'src/utils/classes';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CandidateService {
  constructor(
    @InjectModel(Candidate.name) private CandidateModel: Model<Candidate>,
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(CandidateApplication.name)
    private candApplicationModel: Model<CandidateApplication>,
    // private readonly userService: UserService,
  ) {}

  async create(
    candidateDto: CandidateDto,
    hashedPass: string = '',
  ): Promise<{ candidate: Candidate }> {
    candidateDto.password = hashedPass;
    const newCandidate = new this.CandidateModel(candidateDto);
    const createdCandidate = await newCandidate.save();
    return {
      candidate: createdCandidate,
    };
  }

  async createRandomCandidate(candidateDto: RandomCandidateDto) {
    const newCandidate = new this.CandidateModel(candidateDto);
    const createdCandidate = await newCandidate.save();
    return createdCandidate;
  }

  // async changePassword(email: string, newPassword: string) {
  // const candidate = await this.CandidateModel.findOne({ email });
  //   if (!candidate) {
  //     throw new NotFoundException('No candidate with this email');
  //   }
  //   candidate.password = newPassword;
  //   return await candidate.save();
  // }

  async findAll(query: paginationDto) {
    let result;

    const { page, limit } = query;
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.CandidateModel.aggregate([
        {
          $facet: {
            candidates: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.CandidateModel.aggregate([
        {
          $facet: {
            candidates: [],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const candidates = result[0].candidates;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    if (!candidates) {
      throw new NotFoundException('Failed to fetch Candidates');
    }

    return {
      allCandidates: candidates,
      total: totalDocs,
    };
  }

  async getAdminAnalytics(query: paginationDto) {
    let result;
    const lookupJobs = {
      $lookup: {
        from: 'candidateapplications',
        localField: 'createdBy',
        foreignField: 'candidate',
        as: 'jobCount',
      },
    };

    const lookupExamInvite = {
      $lookup: {
        from: 'examinvites',
        localField: 'email',
        foreignField: 'email',
        as: 'examInvitesCount',
      },
    };

    const lookuptest = {
      $lookup: {
        from: 'candidateassessments',
        localField: 'createdBy',
        foreignField: 'candidate',
        as: 'testCount',
      },
    };

    const { page, limit } = query;
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.CandidateModel.aggregate([
        {
          $facet: {
            tags: [
              lookupJobs,
              lookupExamInvite,
              lookuptest,
              { $skip: skip },
              { $limit: +limit },
              {
                $addFields: {
                  jobCount: { $size: '$jobCount' },
                  examInvitesCount: { $size: '$examInvitesCount' },
                  testCount: { $size: '$testCount' },
                },
              },
            ],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.CandidateModel.aggregate([
        {
          $facet: {
            tags: [
              lookupJobs,
              lookupExamInvite,
              lookuptest,
              {
                $addFields: {
                  jobCount: { $size: '$jobCount' },
                  examInvitesCount: { $size: '$examInvitesCount' },
                  testCount: { $size: '$testCount' },
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
      allCandidates: tags,
      total: totalDocs,
    };
  }

  // // only analyticsDetail
  // async adminAnalyticsDetails(query: paginationDto) {
  //   let result;
  //   const lookupJobs = {
  //     $lookup: {
  //       from: 'candidateapplications',
  //       localField: 'createdBy',
  //       foreignField: 'candidate',
  //       as: 'jobCount',
  //     },
  //   };

  //   const lookupExamInvite = {
  //     $lookup: {
  //       from: 'examinvites',
  //       localField: 'email',
  //       foreignField: 'email',
  //       as: 'examInvitesCount',
  //     },
  //   };

  //   const lookuptest = {
  //     $lookup: {
  //       from: 'candidateassessments',
  //       localField: 'createdBy',
  //       foreignField: 'candidate',
  //       as: 'testCount',
  //     },
  //   };

  //   const { page, limit } = query;
  //   if (page !== undefined && limit !== undefined) {
  //     let skip = (page - 1) * limit;
  //     if (skip < 0) {
  //       skip = 0;
  //     }

  //     result = await this.CandidateModel.aggregate([
  //       // { $match: { createdBy: candidateId } },
  //       {
  //         $facet: {
  //           tags: [
  //             lookupJobs,
  //             lookupExamInvite,
  //             lookuptest,
  //             { $skip: skip },
  //             { $limit: +limit },
  //             {
  //               $addFields: {
  //                 jobCount: { $arrayElemAt: ['$jobCount', 0] },
  //                 examInvitesCount: { $arrayElemAt: ['$examInvitesCount', 0] },
  //                 testCount: { $arrayElemAt: ['$testCount', 0] },
  //               },
  //             },
  //           ],
  //           totalDocs: [{ $count: 'count' }],
  //         },
  //       },
  //     ]);
  //   } else {
  //     result = await this.CandidateModel.aggregate([
  //       // { $match: { createdBy: candidateId } },
  //       {
  //         $facet: {
  //           tags: [
  //             lookupJobs,
  //             lookupExamInvite,
  //             lookuptest,
  //             {
  //               $addFields: {
  //                 jobCount: { $arrayElemAt: ['$jobCount', 0] },
  //                 examInvitesCount: { $arrayElemAt: ['$examInvitesCount', 0] },
  //                 testCount: { $arrayElemAt: ['$testCount', 0] },
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

  //   // for each count field is an array with a single document
  //   const allCandidates = tags.map((tag: any) => ({
  //     jobCount: tag.jobCount ? tag.jobCount : null,
  //     examInvitesCount: tag.examInvitesCount ? tag.examInvitesCount : null,
  //     testCount: tag.testCount ? tag.testCount : null,
  //   }));

  //   return {
  //     allCandidates,
  //     total: totalDocs,
  //   };
  // }

  // // all candidate along analyticsDetail
  // async adminAnalyticsDetails(query: paginationDto) {
  //   let result;
  //   const lookupJobs = {
  //     $lookup: {
  //       from: 'candidateapplications',
  //       localField: 'createdBy',
  //       foreignField: 'candidate',
  //       as: 'jobCount',
  //     },
  //   };

  //   const lookupExamInvite = {
  //     $lookup: {
  //       from: 'examinvites',
  //       localField: 'email',
  //       foreignField: 'email',
  //       as: 'examInvitesCount',
  //     },
  //   };

  //   const lookuptest = {
  //     $lookup: {
  //       from: 'candidateassessments',
  //       localField: 'createdBy',
  //       foreignField: 'candidate',
  //       as: 'testCount',
  //     },
  //   };

  //   const { page, limit } = query;
  //   if (page !== undefined && limit !== undefined) {
  //     let skip = (page - 1) * limit;
  //     if (skip < 0) {
  //       skip = 0;
  //     }

  //     result = await this.CandidateModel.aggregate([
  //       // { $match: { createdBy: candidateId } },
  //       {
  //         $facet: {
  //           tags: [
  //             lookupJobs,
  //             lookupExamInvite,
  //             lookuptest,
  //             { $skip: skip },
  //             { $limit: +limit },
  //             {
  //               $addFields: {
  //                 jobCount: { $arrayElemAt: ['$jobCount', 0] },
  //                 examInvitesCount: { $arrayElemAt: ['$examInvitesCount', 0] },
  //                 testCount: { $arrayElemAt: ['$testCount', 0] },
  //               },
  //             },
  //           ],
  //           totalDocs: [{ $count: 'count' }],
  //         },
  //       },
  //       // Project stage to include candidate ID in the output
  //       {
  //         $project: {
  //           _id: 0, // Exclude the _id field
  //           candidateId: '$_id', // Assuming _id contains candidate ID
  //           allCandidates: '$tags',
  //           total: '$totalDocs',
  //         },
  //       },
  //     ]);
  //   } else {
  //     result = await this.CandidateModel.aggregate([
  //       // { $match: { createdBy: candidateId } },
  //       {
  //         $facet: {
  //           tags: [
  //             lookupJobs,
  //             lookupExamInvite,
  //             lookuptest,
  //             {
  //               $addFields: {
  //                 jobCount: { $arrayElemAt: ['$jobCount', 0] },
  //                 examInvitesCount: { $arrayElemAt: ['$examInvitesCount', 0] },
  //                 testCount: { $arrayElemAt: ['$testCount', 0] },
  //               },
  //             },
  //           ],
  //           totalDocs: [{ $count: 'count' }],
  //         },
  //       },
  //       // Project stage to include candidate ID in the output
  //       {
  //         $project: {
  //           _id: 0, // Exclude the _id field
  //           candidateId: '$_id', // Assuming _id contains candidate ID
  //           allCandidates: '$tags',
  //           total: '$totalDocs',
  //         },
  //       },
  //     ]);
  //   }

  //   const candidates = result[0];

  //   return candidates;
  // }

  // specified candidate along analyticsDetail
  async adminAnalyticsDetails(query: paginationDto) {
    let result;

    const lookupJobs = {
      $lookup: {
        from: 'candidateapplications',
        localField: 'createdBy',
        foreignField: 'candidate',
        as: 'jobCount',
      },
    };

    const lookupExamInvite = {
      $lookup: {
        from: 'examinvites',
        localField: 'email',
        foreignField: 'email',
        as: 'examInvitesCount',
      },
    };

    const lookuptest = {
      $lookup: {
        from: 'candidateassessments',
        localField: 'createdBy',
        foreignField: 'candidate',
        as: 'testCount',
      },
    };

    const { page, limit } = query;
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.CandidateModel.aggregate([
        {
          $facet: {
            tags: [
              lookupJobs,
              lookupExamInvite,
              lookuptest,
              { $skip: skip },
              { $limit: +limit },
              {
                $addFields: {
                  jobCount: { $arrayElemAt: ['$jobCount', 0] },
                  examInvitesCount: { $arrayElemAt: ['$examInvitesCount', 0] },
                  testCount: { $arrayElemAt: ['$testCount', 0] },
                },
              },
            ],
            totalDocs: [{ $count: 'count' }],
          },
        },
        // Project stage to include necessary fields in the output
        {
          $project: {
            // _id: 0, // Exclude the _id field
            // email: '$tags.email',
            // createdBy: '$tags.createdBy',
            allCandidates: {
              $map: {
                input: '$tags',
                as: 'candidate',
                in: {
                  _id: '$$candidate._id',
                  email: '$$candidate.email',
                  createdBy: '$$candidate.createdBy',
                  jobCount: '$$candidate.jobCount',
                  examInvitesCount: '$$candidate.examInvitesCount',
                  testCount: '$$candidate.testCount',
                },
              },
            },
            total: '$totalDocs',
          },
        },
      ]);
    } else {
      result = await this.CandidateModel.aggregate([
        {
          $facet: {
            tags: [
              lookupJobs,
              lookupExamInvite,
              lookuptest,
              {
                $addFields: {
                  jobCount: { $arrayElemAt: ['$jobCount', 0] },
                  examInvitesCount: { $arrayElemAt: ['$examInvitesCount', 0] },
                  testCount: { $arrayElemAt: ['$testCount', 0] },
                },
              },
            ],
            totalDocs: [{ $count: 'count' }],
          },
        },
        // Project stage to include necessary fields in the output
        {
          $project: {
            // _id: 0, // Exclude the _id field
            // email: '$tags.email',
            // createdBy: '$tags.createdBy',
            allCandidates: {
              $map: {
                input: '$tags',
                as: 'candidate',
                in: {
                  _id: '$$candidate._id',
                  email: '$$candidate.email',
                  createdBy: '$$candidate.createdBy',
                  jobCount: '$$candidate.jobCount',
                  examInvitesCount: '$$candidate.examInvitesCount',
                  testCount: '$$candidate.testCount',
                },
              },
            },
            total: '$totalDocs',
          },
        },
      ]);
    }

    const candidates = result[0];
    return candidates;
  }

  // // specified candidate along analyticsDetail (filtered)
  // async adminAnalyticsDetails(query: paginationDto) {
  //   let result;

  //   const lookupJobs = {
  //     $lookup: {
  //       from: 'candidateapplications',
  //       localField: 'createdBy',
  //       foreignField: 'candidate',
  //       as: 'jobCount',
  //     },
  //   };

  //   const lookupExamInvite = {
  //     $lookup: {
  //       from: 'examinvites',
  //       localField: 'email',
  //       foreignField: 'email',
  //       as: 'examInvitesCount',
  //     },
  //   };

  //   const lookuptest = {
  //     $lookup: {
  //       from: 'candidateassessments',
  //       localField: 'createdBy',
  //       foreignField: 'candidate',
  //       as: 'testCount',
  //     },
  //   };

  //   const { page, limit } = query;
  //   if (page !== undefined && limit !== undefined) {
  //     let skip = (page - 1) * limit;
  //     if (skip < 0) {
  //       skip = 0;
  //     }

  //     result = await this.CandidateModel.aggregate([
  //       {
  //         $facet: {
  //           tags: [
  //             lookupJobs,
  //             lookupExamInvite,
  //             lookuptest,
  //             { $skip: skip },
  //             { $limit: +limit },
  //             {
  //               $addFields: {
  //                 jobCount: { $arrayElemAt: ['$jobCount', 0] },
  //                 examInvitesCount: { $arrayElemAt: ['$examInvitesCount', 0] },
  //                 testCount: { $arrayElemAt: ['$testCount', 0] },
  //               },
  //             },
  //           ],
  //           totalDocs: [{ $count: 'count' }],
  //         },
  //       },
  //       // Project stage to include necessary fields in the output
  //       {
  //         $project: {
  //           allCandidates: {
  //             $filter: {
  //               input: {
  //                 $map: {
  //                   input: '$tags',
  //                   as: 'candidate',
  //                   in: {
  //                     _id: '$$candidate._id',
  //                     email: '$$candidate.email',
  //                     createdBy: '$$candidate.createdBy',
  //                     jobCount: '$$candidate.jobCount',
  //                     examInvitesCount: '$$candidate.examInvitesCount',
  //                     testCount: '$$candidate.testCount',
  //                   },
  //                 },
  //               },
  //               as: 'filteredCandidate',
  //               cond: {
  //                 $or: [
  //                   { $gt: ['$$filteredCandidate.jobCount', 0] },
  //                   { $gt: ['$$filteredCandidate.examInvitesCount', 0] },
  //                   { $gt: ['$$filteredCandidate.testCount', 0] },
  //                 ],
  //               },
  //             },
  //           },
  //           total: '$totalDocs',
  //         },
  //       },
  //     ]);
  //   } else {
  //     result = await this.CandidateModel.aggregate([
  //       {
  //         $facet: {
  //           tags: [
  //             lookupJobs,
  //             lookupExamInvite,
  //             lookuptest,
  //             {
  //               $addFields: {
  //                 jobCount: { $arrayElemAt: ['$jobCount', 0] },
  //                 examInvitesCount: { $arrayElemAt: ['$examInvitesCount', 0] },
  //                 testCount: { $arrayElemAt: ['$testCount', 0] },
  //               },
  //             },
  //           ],
  //           totalDocs: [{ $count: 'count' }],
  //         },
  //       },
  //       // Project stage to include necessary fields in the output
  //       {
  //         $project: {
  //           allCandidates: {
  //             $filter: {
  //               input: {
  //                 $map: {
  //                   input: '$tags',
  //                   as: 'candidate',
  //                   in: {
  //                     _id: '$$candidate._id',
  //                     email: '$$candidate.email',
  //                     createdBy: '$$candidate.createdBy',
  //                     jobCount: '$$candidate.jobCount',
  //                     examInvitesCount: '$$candidate.examInvitesCount',
  //                     testCount: '$$candidate.testCount',
  //                   },
  //                 },
  //               },
  //               as: 'filteredCandidate',
  //               cond: {
  //                 $or: [
  //                   { $gt: ['$$filteredCandidate.jobCount', 0] },
  //                   { $gt: ['$$filteredCandidate.examInvitesCount', 0] },
  //                   { $gt: ['$$filteredCandidate.testCount', 0] },
  //                 ],
  //               },
  //             },
  //           },
  //           total: '$totalDocs',
  //         },
  //       },
  //     ]);
  //   }

  //   const candidates = result[0];
  //   return candidates;
  // }

  async adminAnalyticsDetail(candidateId: string) {
    // let result;
    const matchStage = {
      createdBy: new mongoose.Types.ObjectId(candidateId),
    };

    const lookupJobs = {
      $lookup: {
        from: 'candidateapplications',
        localField: 'createdBy',
        foreignField: 'candidate',
        as: 'jobCount',
      },
    };

    const lookupExamInvite = {
      $lookup: {
        from: 'examinvites',
        localField: 'email',
        foreignField: 'email',
        as: 'examInvitesCount',
      },
    };

    const lookuptest = {
      $lookup: {
        from: 'candidateassessments',
        localField: 'createdBy',
        foreignField: 'candidate',
        as: 'testCount',
      },
    };

    // const { page, limit } = query;
    // if (page !== undefined && limit !== undefined) {
    //   let skip = (page - 1) * limit;
    //   if (skip < 0) {
    //     skip = 0;
    //   }

    //   result = await this.CandidateModel.aggregate([
    //     { $match: matchStage },
    //     {
    //       $facet: {
    //         tags: [
    //           lookupJobs,
    //           lookupExamInvite,
    //           lookuptest,
    //           { $skip: skip },
    //           { $limit: +limit },
    //           {
    //             $addFields: {
    //               jobsDetail: { $arrayElemAt: ['$jobCount', 0] },
    //               examInvitesDetail: { $arrayElemAt: ['$examInvitesCount', 0] },
    //               assessmentsDetail: { $arrayElemAt: ['$testCount', 0] },
    //             },
    //           },
    //         ],
    //         // totalDocs: [{ $count: 'count' }],
    //       },
    //     },
    //   ]);
    // } else {
    const result = await this.CandidateModel.aggregate([
      { $match: matchStage },
      {
        $facet: {
          tags: [
            lookupJobs,
            lookupExamInvite,
            lookuptest,
            {
              $addFields: {
                jobsDetail: { $arrayElemAt: ['$jobCount', 0] },
                examInvitesDetail: { $arrayElemAt: ['$examInvitesCount', 0] },
                assessmentsDetail: { $arrayElemAt: ['$testCount', 0] },
              },
            },
          ],
          // totalDocs: [{ $count: 'count' }],
        },
      },
    ]);
    // }

    const tags = result[0].tags;
    // const totalDocs =
    //   result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    // for each count field is an array with a single document
    const CandidateAnalyticsDetail = tags.map((tag: any) => ({
      jobCount: tag.jobCount ? tag.jobCount : null,
      examInvitesCount: tag.examInvitesCount ? tag.examInvitesCount : null,
      testCount: tag.testCount ? tag.testCount : null,
    }));

    return {
      CandidateAnalyticsDetail,
      // total: totalDocs,
    };
  }

  async findById(id: string): Promise<Candidate | null> {
    const candidate = await this.CandidateModel.findById(id)
      .populate({ path: 'projects' })
      .exec();
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }
    return candidate;
  }

  // // pipeline
  // async getCandProfileById(userid: string) {
  //   try {
  //     const matchStage: any = {
  //       _id: new mongoose.Types.ObjectId(userid),
  //     };

  //     const result = await this.CandidateModel.aggregate([
  //       {
  //         $match: matchStage,
  //       },
  //       {
  //         $lookup: {
  //           from: 'candidateapplications',
  //           localField: 'candidate',
  //           foreignField: 'createdBy.candidate',
  //           as: 'candidateapplications',
  //         },
  //       },
  //     ]);

  //     if (result.length === 0) {
  //       throw new NotFoundException('Candidate not found');
  //     }

  //     const candidate = result[0];

  //     return {
  //       candidate: candidate,
  //     };
  //   } catch (error) {
  //     throw new InternalServerErrorException('Internal Server Error');
  //   }
  // }

  // // Not in use : for single candidate profile nested in All Applicants of company dashboard'
  // async getApplicantProfile(id: string) {
  //   const candidate = await this.CandidateModel.findById(id).exec();
  //   if (!candidate) {
  //     throw new NotFoundException('Candidate not found');
  //   }

  //   // const pipeline = [
  //   //   {
  //   //     $match: {
  //   //       createdBy: candidate.createdBy,
  //   //     },
  //   //   },
  //   //   {
  //   //     $lookup: {
  //   //       from: 'candidateapplications',
  //   //       localField: 'candidate',
  //   //       foreignField: 'createdBy.candidate',
  //   //       as: 'candidateapplications',
  //   //     },
  //   //   },
  //   // ];

  //   // const candidates = await this.candApplicationModel
  //   //   .aggregate(pipeline)
  //   //   .exec();

  //   return candidate;
  // }

  // // Not in use
  // async getApplicantResume(candId: string) {
  //   const candidate = await this.CandidateModel.findById(candId).exec();
  //   if (!candidate) {
  //     throw new NotFoundException('Candidate not found');
  //   }

  //   if (!candidate.cvUrl) {
  //     throw new NotFoundException('Candidate has no Resume');
  //   }
  //   return candidate.cvUrl;
  // }

  // // Not in use
  // async getApplicantHiring(applicationId: string) {
  //   const application = await this.candApplicationModel
  //     .findById(applicationId)
  //     .exec();
  //   if (!application) {
  //     throw new NotFoundException('Application not found');
  //   }

  //   return application;
  // }

  async getApplicantData(
    idOrApplicationId: string,
    type: 'profile' | 'resume' | 'hiring',
  ) {
    let document;

    if (type === 'profile' || type === 'resume') {
      document = await this.CandidateModel.findById(idOrApplicationId).exec();
      if (!document) {
        throw new NotFoundException('Candidate not found');
      }
    } else if (type === 'hiring') {
      document = await this.candApplicationModel
        .findById(idOrApplicationId)
        .exec();
      if (!document) {
        throw new NotFoundException('Application not found');
      }
    } else {
      throw new BadRequestException('Invalid type');
    }

    if (
      type === 'resume' &&
      document &&
      'cvUrl' in document &&
      document.cvUrl
    ) {
      return document.cvUrl;
    } else if (type === 'profile') {
      const candidateProfile: any = document?.toObject(); // Using toObject to avoid TS7006

      if (candidateProfile && candidateProfile.experiences) {
        // Find the experience with currentlyWorking: true
        const currentJobExperience: any = candidateProfile.experiences.find(
          (experience: any) => experience.currentlyWorking,
        );

        // Add the currentJob field to the profile
        candidateProfile.currentJob = currentJobExperience
          ? currentJobExperience.title
          : undefined;
      }

      // if (candidateProfile && candidateProfile.educationDetails) {
      //   // Find the education detail with the latest endDate
      //   const latestEducationDetail = candidateProfile.educationDetails.reduce(
      //     (latest, education) =>
      //       education.endDate &&
      //       (!latest.endDate ||
      //         new Date(education.endDate) > new Date(latest.endDate))
      //         ? education
      //         : latest,
      //     {},
      //   );

      //   // Add the highestQualification field to the profile
      //   candidateProfile.highestQualification = latestEducationDetail
      //     ? latestEducationDetail.qualification
      //     : undefined;
      // }

      // TODO:should return current job empty instead of not returning even field
      return candidateProfile;
      // return candidateProfile as CandidateWithCurrentJobAndHighestQualification;
    } else {
      throw new NotFoundException('Candidate has no Resume');
    }
  }

  // It returns candidate profile with its isBlocked status
  async studentProfile(userId: string) {
    const matchStage = {
      createdBy: new mongoose.Types.ObjectId(userId),
    };
    const candidate = await this.CandidateModel.aggregate([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'userData',
        },
      },
      {
        $addFields: {
          isBlocked: { $arrayElemAt: ['$userData.isBlocked', 0] },
        },
      },
    ]).exec();

    if (!candidate || candidate.length === 0) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate[0];
  }

  // // backup till current job
  // async getApplicantData(
  //   idOrApplicationId: string,
  //   type: 'profile' | 'resume' | 'hiring',
  // ) {
  //   let document;
  //   console.log('type', type);

  //   if (type === 'profile' || type === 'resume') {
  //     document = await this.CandidateModel.findById(idOrApplicationId).exec();
  //     if (!document) {
  //       throw new NotFoundException('Candidate not found');
  //     }
  //   } else if (type === 'hiring') {
  //     document = await this.candApplicationModel
  //       .findById(idOrApplicationId)
  //       .exec();
  //     if (!document) {
  //       throw new NotFoundException('Application not found');
  //     }
  //   } else {
  //     throw new BadRequestException('Invalid type');
  //   }

  //   if (
  //     type === 'resume' &&
  //     document &&
  //     'cvUrl' in document &&
  //     document.cvUrl
  //   ) {
  //     return document.cvUrl;
  //   } else if (type === 'profile') {
  //     const candidateProfile: any = document?.toObject(); // Using toObject to avoid TS7006

  //     if (candidateProfile && candidateProfile.experiences) {
  //       // Find the experience with currentlyWorking: true
  //       const currentJobExperience: any = candidateProfile.experiences.find(
  //         (experience: any) => experience.currentlyWorking,
  //       );

  //       // Add the currentJob field to the profile
  //       candidateProfile.currentJob = currentJobExperience
  //         ? currentJobExperience.title
  //         : undefined;
  //     }

  //     return candidateProfile;
  //   } else {
  //     throw new NotFoundException('Candidate has no Resume');
  //   }
  // }

  // // TODO: try to do on bese of {createdBy: id}..userId
  async updateCandidate(userid: string, dto: UpdateCandidateDto) {
    // console.log(dto);
    // let updatedData = {};

    // if (Object.keys(updateCandidateDto)[0] === 'skills') {
    //   updatedData = {
    //     $push: updateCandidateDto,
    //   };
    // } else if (Object.keys(updateCandidateDto)[0] === 'educationDetails') {
    //   updatedData = {
    //     $push: updateCandidateDto,
    //   };
    // } else if (Object.keys(updateCandidateDto)[0] === 'experiences') {
    //   updatedData = {
    //     $push: updateCandidateDto,
    //   };
    // } else {
    //   updatedData = {
    //     $set: updateCandidateDto,
    //   };
    // }
    const updatedCandidate = await this.CandidateModel.findByIdAndUpdate(
      userid,
      dto,
      { new: true },
    ).exec();
    if (!updatedCandidate) {
      throw new BadRequestException('Failed to update Candidate');
    }

    // logic to update email of candidate
    // if (updateCandidateDto.email || updateCandidateDto.name) {
    //   const userObj = {
    //     email: updateCandidateDto.email,
    //     name: updateCandidateDto.name,
    //   };

    //   const isUserUpdated = await this.UserModel.findOneAndUpdate(
    //     {
    //       candidate: id,
    //     },
    //     userObj,
    //     { new: true },
    //   );

    //   if (!isUserUpdated) {
    //     throw new InternalServerErrorException('Failed to update User');
    //   }
    // }

    return {
      candidate: updatedCandidate,
    };
  }

  // async updateLoginDetail(id: string, dto: UpdateLoginDetail) {
  //   if (dto.email) {
  //     const user = await this.userService.findByEmail(dto.email);

  //     if (user.message == 'User found') {
  //       throw new BadRequestException(
  //         'This email is not available. Please try another email',
  //       );
  //     }

  //     const updatedCandidate = await this.CandidateModel.findOneAndUpdate(
  //       { createdBy: id },
  //       dto,
  //       {
  //         new: true,
  //       },
  //     ).exec();

  //     console.log(dto);

  //     if (!updatedCandidate) {
  //       throw new InternalServerErrorException(
  //         'Failed to update Login details',
  //       );
  //     }

  //     if (dto.email) {
  //       const userObj = {
  //         email: dto.email,
  //       };

  //       const isUserUpdated = await this.UserModel.findOneAndUpdate(
  //         {
  //           _id: id,
  //         },
  //         userObj,
  //         { new: true },
  //       );

  //       if (!isUserUpdated) {
  //         throw new InternalServerErrorException('Failed to update User');
  //       }
  //     }

  //     return {
  //       candidate: updatedCandidate,
  //     };
  //   }
  // }

  async update(id: string, dto: UpdateCandidateDto) {
    const updatedUploads = await this.CandidateModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    ).exec();
    if (!updatedUploads) {
      throw new BadRequestException('Failed to update Candidate');
    }
    return {
      candidate: updatedUploads,
    };
  }

  async updateLogin(id: string, dto: UpdateCandidateDto) {
    const updatedUser = await this.CandidateModel.findOneAndUpdate(
      { createdBy: id },
      dto,
      { new: true },
    ).exec();
    if (!updatedUser) {
      throw new BadRequestException('Failed to update Candidate');
    }
    console.log(updatedUser);
    return updatedUser;
  }

  async AddField(id: string, updateData: Qualifications) {
    if (
      Object.keys(updateData)[0] !== 'skills' &&
      Object.keys(updateData)[0] !== 'educationDetails' &&
      Object.keys(updateData)[0] !== 'experiences'
    ) {
      throw new BadRequestException('Irrelevent field to udpate');
    }
    const candidate = await this.CandidateModel.findById(id);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }
    // add the required fields by datatype
    if (Object.keys(updateData)[0] == 'skills') {
      // console.log(Object.values(updateData)[0]);
      candidate.skills = Object.values(updateData)[0];
    } else if (Object.keys(updateData)[0] == 'educationDetails') {
      const newEducation = [
        ...candidate.educationDetails,
        Object.values(updateData)[0],
      ];
      // console.log(newEducation);
      candidate.educationDetails = newEducation;
    } else if (Object.keys(updateData)[0] == 'experiences') {
      const newExperiences = [
        ...candidate.experiences,
        Object.values(updateData)[0],
      ];
      // console.log(newExperiences);
      candidate.experiences = newExperiences;
    }
    await candidate.save();
    return {
      candidate: candidate,
    };
  }

  async updateProject(
    userid: string,
    projectID: string,
    updateData: Qualifications,
  ) {
    if (
      Object.keys(updateData)[0] !== 'skills' &&
      Object.keys(updateData)[0] !== 'educationDetails' &&
      Object.keys(updateData)[0] !== 'experiences'
    ) {
      throw new BadRequestException('Irrelevent update');
    }
    const candidate = await this.CandidateModel.findById(userid);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }
    const targetField = (candidate as any)[Object.keys(updateData)[0]].id(
      projectID,
    );
    if (!targetField) {
      throw new NotFoundException(`${Object.keys(updateData)[0]} not found`);
    }
    Object.assign(targetField, Object.values(updateData)[0]);
    await candidate.save();
    return {
      candidate: candidate,
    };
  }
  async updateField(id: string, itemId: string, updateData: Qualifications) {
    if (
      Object.keys(updateData)[0] !== 'skills' &&
      Object.keys(updateData)[0] !== 'educationDetails' &&
      Object.keys(updateData)[0] !== 'experiences'
    ) {
      throw new BadRequestException('Irrelevent update');
    }
    const candidate = await this.CandidateModel.findById(id);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }
    const targetField = (candidate as any)[Object.keys(updateData)[0]].id(
      itemId,
    );
    if (!targetField) {
      throw new NotFoundException(`${Object.keys(updateData)[0]} not found`);
    }
    Object.assign(targetField, Object.values(updateData)[0]);
    await candidate.save();
    return {
      candidate: candidate,
    };
  }

  async updatejobseekingstatus(candId: string, dto: JobSeekingStatusDto) {
    const { jobSeekingStatus } = dto;
    const candidate: any = await this.CandidateModel.findByIdAndUpdate(
      candId,
      {
        jobSeekingStatus,
      },
      { new: true },
    ).exec();

    if (!candidate) {
      throw new NotFoundException('unable to update');
    }
    return { candidate };
  }
  async remove(candId: string, itemId: string, fieldType: string) {
    const candidate: any = await this.CandidateModel.findById(candId);
    console.log(fieldType, itemId);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const targetArray = candidate[fieldType];

    if (!Array.isArray(targetArray)) {
      throw new NotFoundException(`${fieldType} not found`);
    }

    const updatedArray = targetArray.filter(
      (item: any) => item._id.toString() !== itemId,
    );

    if (updatedArray.length === targetArray.length) {
      throw new NotFoundException(
        `${fieldType} not found with the given itemId`,
      );
    }

    candidate[fieldType] = updatedArray;
    await candidate.save();
    return { candidate };
  }

  // async findSkillById(Id: string, type: string) {
  //   let candidates;
  //   if (type === 'skills') {
  //     candidates = await this.CandidateModel.find({
  //       'skills._id': Id,
  //     }).exec();

  //     for (const candidate of candidates) {
  //       const skill = candidate.skills.find((s) => s._id.toString() === Id);
  //       if (skill) {
  //         return skill;
  //       }
  //     }
  //   }
  //   if (type === 'educationDetails') {
  //     candidates = await this.CandidateModel.find({
  //       'educationDetails._id': Id,
  //     }).exec();

  //     for (const candidate of candidates) {
  //       const educationDetails = candidate.educationDetails.find(
  //         (s) => s._id.toString() === Id,
  //       );
  //       if (educationDetails) {
  //         return educationDetails;
  //       }
  //     }
  //   }
  //   if (type === 'experiences') {
  //     candidates = await this.CandidateModel.find({
  //       'experiences._id': Id,
  //     }).exec();

  //     for (const candidate of candidates) {
  //       const experiences = candidate.experiences.find(
  //         (s) => s._id.toString() === Id,
  //       );
  //       if (experiences) {
  //         return experiences;
  //       }
  //     }
  //   }
  //   throw new NotFoundException('Candidate not found');
  // }

  // async updateField(Id: string, type: string, updateData: UpdateCandidate) {
  //   let candidates;
  //   if (type === 'skills') {
  //     candidates = await this.CandidateModel.find({
  //       'skills._id': Id,
  //     }).exec();

  //     for (const candidate of candidates) {
  //       const skill = candidate.skills.find((s) => s._id.toString() === Id);
  //       if (skill) {
  //         return skill;
  //       }
  //     }
  //   }
  //   if (type === 'educationDetails') {
  //     candidates = await this.CandidateModel.find({
  //       'educationDetails._id': Id,
  //     }).exec();

  //     for (const candidate of candidates) {
  //       const educationDetails = candidate.educationDetails.find(
  //         (s) => s._id.toString() === Id,
  //       );
  //       if (educationDetails) {
  //         return educationDetails;
  //       }
  //     }
  //   }
  //   if (type === 'experiences') {
  //     candidates = await this.CandidateModel.find({
  //       'experiences._id': Id,
  //     }).exec();

  //     for (const candidate of candidates) {
  //       const experiences = candidate.experiences.find(
  //         (s) => s._id.toString() === Id,
  //       );
  //       if (experiences) {
  //         return experiences;
  //       }
  //     }
  //   }
  //   throw new NotFoundException('Candidate not found');
  // }

  // async remove(id: string) {
  //   const deletedCandidate =
  //     await this.CandidateModel.findByIdAndRemove(id).exec();
  //   if (!deletedCandidate) {
  //     throw new BadRequestException('Failed to delete Candidate');
  //   }
  //   return { message: 'Candidate deleted successfully' };
  // }
}
