import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { CompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from './entities/company.entity';
import { User } from 'src/user/entities/user.entity';
import { Job } from 'src/job/entities/job.entity';
import {
  browseCompanyPaginationDto,
  companyPaginationDto,
} from 'src/utils/classes';
import {
  setSortStageBrowseCompanies,
  setSortStageCompanies,
} from 'src/utils/funtions';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private CompanyModel: Model<Company>,
    @InjectModel(Job.name) private jobModel: Model<Job>,
    @InjectModel(User.name) private UserModel: Model<User>,
  ) {}

  async create(companyDto: CompanyDto): Promise<{ company: Company }> {
    const existingCompany = await this.CompanyModel.findOne({
      name: companyDto.name,
    });

    if (existingCompany) {
      throw new ConflictException('Company name is already in use');
    }
    const newCompany = new this.CompanyModel(companyDto);
    const createdCompany = await newCompany.save();
    return { company: createdCompany };
  }

  async findActiveCompanies(query: companyPaginationDto) {
    let result;
    const lookup = {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'usersInfo',
        pipeline: [{ $project: { isBlocked: 1 } }],
      },
    };

    const matchBlockedUsers = {
      $match: {
        'usersInfo.isBlocked': { $ne: true },
      },
    };

    const totalDocsPipeline = [lookup, matchBlockedUsers, { $count: 'count' }];

    const { page, limit, name } = query;
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.CompanyModel.aggregate([
        { $skip: skip },
        { $limit: +limit },
        lookup,
        matchBlockedUsers,
        {
          $facet: {
            allCompanies: [
              {
                $addFields: {
                  isBlocked: { $arrayElemAt: ['$usersInfo.isBlocked', 0] },
                },
              },
            ],
            totalDocs: totalDocsPipeline,
          },
        },
      ]);

      if (name) {
        const matchStage = { name: { $regex: new RegExp(name, 'i') } };

        result = await this.CompanyModel.aggregate([
          { $match: matchStage },
          matchBlockedUsers,
          lookup,
          { $skip: skip },
          { $limit: +limit },
          {
            $facet: {
              allCompanies: [
                {
                  $addFields: {
                    isBlocked: { $arrayElemAt: ['$usersInfo.isBlocked', 0] },
                  },
                },
              ],
              // TODO:
              totalDocs: [{ $count: 'count' }],
              // totalDocs: [{ $match: matchStage }, { $count: 'count' }],
            },
          },
          // { $skip: skip },
          // { $limit: +limit },
        ]);
      }
      // console.log('totalDocs', result[0].totalDocs);

      const allCompanies = result[0].allCompanies;
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
      // console.log('totalDocs>', totalDocs);

      if (!allCompanies) {
        throw new NotFoundException('Failed to fetch Companies');
      }

      return {
        companies: allCompanies,
        total: totalDocs,
      };
    }
  }

  async browseCompanies(query: browseCompanyPaginationDto) {
    let result;
    const lookup = {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'usersInfo',
        pipeline: [{ $project: { isBlocked: 1 } }],
      },
    };

    const jobsLookup = {
      $lookup: {
        from: 'jobs',
        localField: 'createdBy',
        foreignField: 'createdBy',
        as: 'jobsData',
      },
    };

    const matchBlockedUsers = {
      $match: {
        'usersInfo.isBlocked': { $ne: true },
      },
    };

    const totalDocsPipeline = [lookup, matchBlockedUsers, { $count: 'count' }];

    const { page, limit, name, location, sort } = query;
    const sortStage: any = {};

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      let matchStage = {};

      if (sort) {
        sortStage['$sort'] = setSortStageBrowseCompanies(sort);
      }

      if (name && location) {
        matchStage = {
          $and: [
            { name: { $regex: new RegExp(name, 'i') } },
            { address: { $regex: new RegExp(location, 'i') } },
          ],
        };
      } else if (name) {
        matchStage = { name: { $regex: new RegExp(name, 'i') } };
      } else if (location) {
        matchStage = { address: { $regex: new RegExp(location, 'i') } };
      }

      result = await this.CompanyModel.aggregate([
        { $match: matchStage },
        jobsLookup,
        {
          $addFields: {
            totalJobs: { $size: '$jobsData' },
          },
        },
        { $unset: 'jobsData' }, // Remove the jobsData field from the output
        matchBlockedUsers,
        lookup,
        { $skip: skip },
        { $limit: +limit },
        ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
        {
          $facet: {
            allCompanies: [
              {
                $addFields: {
                  isBlocked: { $arrayElemAt: ['$usersInfo.isBlocked', 0] },
                },
              },
            ],
            totalDocs: totalDocsPipeline,
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

  async findAll(query: companyPaginationDto) {
    const { page, limit, isActive, isBlocked, name, planName, sort } = query;
    let result;
    const matchStage: any = {};
    const sortStage: any = {};
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      if (name) {
        matchStage.name = { $regex: name, $options: 'i' };
      }

      if (sort) {
        sortStage['$sort'] = setSortStageCompanies(sort);
      }

      result = await this.CompanyModel.aggregate([
        {
          $match: matchStage,
        },
        {
          $facet: {
            allCompanies: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
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

  // async companyAnalytics() {
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

  async findById(id: string): Promise<Company | null> {
    const company = await this.CompanyModel.findById(id).exec();
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async getCompanyProfileById(userId: string) {
    const company = await this.CompanyModel.findById(userId).exec();
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    // TODO check company or user
    const pipeline = [
      {
        $match: {
          createdBy: company.createdBy,
        },
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'createdBy',
          foreignField: 'createdBy.company',
          as: 'jobInfo',
        },
      },
    ];

    const jobs = await this.jobModel.aggregate(pipeline).exec();

    // // Calculate statistics
    // const totalJobs = jobs.length;
    // const totalClosedJobs = jobs.filter(
    //   (job) => job.jobStatus === 'closed',
    // ).length;
    // const totalOpenJobs = jobs.filter((job) => job.jobStatus === 'open').length;

    // const totalApplications = jobs.reduce(
    //   (total, job) => total + job.applications.length,
    //   0,
    // );

    // // Calculate total applications per job
    // const applicationsPerJob = jobs.map((job) => ({
    //   jobId: job._id,
    //   jobTitle: job.title,
    //   totalApplications: job.applications.length,
    //   openDate: job.createdAt,
    //   closingDate: job.applicationDeadline,
    // }));

    // return {
    //   company: company,
    //   companyJobs: jobs,
    //   totalJobs: totalJobs,
    //   totalClosedJobs: totalClosedJobs,
    //   totalOpenJobs: totalOpenJobs,
    //   totalApplications: totalApplications,
    //   applicationsPerJob: applicationsPerJob,
    // };
    return {
      company: company,
      companyJobs: jobs,
    };
    // const result = {
    //   company: company.toObject(),
    //   jobs,
    // };
  }

  // async companyAnalytics(userId: string) {
  //   console.log(userId);
  //   const company = await this.CompanyModel.findOne({
  //     createdBy: userId,
  //   }).exec();
  //   if (!company) {
  //     throw new NotFoundException('Company not found');
  //   }
  //   // TODO check company or user
  //   const pipeline = [
  //     {
  //       $match: {
  //         createdBy: company.createdBy,
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'jobs',
  //         localField: 'createdBy',
  //         foreignField: 'createdBy.company',
  //         as: 'jobInfo',
  //       },
  //     },
  //   ];

  //   const jobs = await this.jobModel.aggregate(pipeline).exec();

  //   // Calculate statistics
  //   const totalJobs = jobs.length;
  //   const totalClosedJobs = jobs.filter(
  //     (job) => job.jobStatus === 'closed',
  //   ).length;
  //   const totalOpenJobs = jobs.filter((job) => job.jobStatus === 'open').length;

  //   const totalApplications = jobs.reduce(
  //     (total, job) => total + job.applications.length,
  //     0,
  //   );

  //   // Calculate total applications per job
  //   const applicationsPerJob = jobs.map((job) => ({
  //     jobId: job._id,
  //     jobTitle: job.title,
  //     totalApplications: job.applications.length,
  //     openDate: job.createdAt,
  //     closingDate: job.applicationDeadline,
  //   }));

  //   return {
  //     company: company,
  //     companyJobs: jobs,
  //     totalJobs: totalJobs,
  //     totalClosedJobs: totalClosedJobs,
  //     totalOpenJobs: totalOpenJobs,
  //     totalApplications: totalApplications,
  //     applicationsPerJob: applicationsPerJob,
  //   };
  //   // return {
  //   //   company: company,
  //   //   companyJobs: jobs,
  //   // };
  // }

  async ompanyAnalytics(userId: string) {
    console.log(userId);
    const company = await this.CompanyModel.findOne({
      createdBy: userId,
    }).exec();
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const pipeline = [
      {
        $match: {
          createdBy: company.createdBy,
        },
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'createdBy',
          foreignField: 'createdBy.company',
          as: 'jobInfo',
        },
      },
      {
        $count: 'totalJobs',
      },
    ];

    // console.log(pipeline);
    const result = await this.CompanyModel.aggregate(pipeline);

    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    const totalJobs = result.length > 0;
    return totalJobs;
  }

  // async companyAnalytics(userId: string) {
  //   console.log(userId);
  //   const company = await this.CompanyModel.findOne({
  //     createdBy: userId,
  //   }).exec();
  //   if (!company) {
  //     throw new NotFoundException('Company not found');
  //   }

  //   const result = await this.CompanyModel.aggregate([
  //     {
  //       $match: {
  //         createdBy: new mongoose.Types.ObjectId(userId),
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'jobs',
  //         localField: 'createdBy',
  //         foreignField: 'createdBy',
  //         as: 'jobInfo',
  //       },
  //     },
  //     {
  //       $count: 'totalJobs',
  //     },
  //   ]);
  //   const totalJobs = result.length > 0 ? result[0].totalJobs : 0;

  //   console.log(result);

  //   return {
  //     totalJobs: totalJobs,
  //   };
  // }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const existingCompany = await this.CompanyModel.findOne({
      name: updateCompanyDto.name,
      _id: { $ne: id }, // exclude the current companyId being updated
    });

    if (existingCompany) {
      throw new ConflictException('Company name is already in use');
    }
    updateCompanyDto.name?.trim();

    const updatedCompany = await this.CompanyModel.findByIdAndUpdate(
      id,
      updateCompanyDto,
      { new: true },
    ).exec();

    if (!updatedCompany) {
      throw new InternalServerErrorException('Failed to update Company');
    }

    const userObj = {
      email: updateCompanyDto.email,
      name: updateCompanyDto.name,
    };

    const isUserUpdated = await this.UserModel.findOneAndUpdate(
      {
        company: id,
      },
      userObj,
      { new: true },
    );
    if (!isUserUpdated) {
      throw new InternalServerErrorException('Failed to update User');
    }
    return { company: updatedCompany, message: 'Company updated successfully' };
  }
}
