import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Job } from './entities/job.entity';
import {
  EnumsCandidate,
  RejectDto,
  allApplicationsOfCompanyDto,
  jobPaginationDto,
  jobsListingCompanyDto,
  jobsListingDto,
  paginationDto,
} from 'src/utils/classes';
import { CandidateApplication } from 'src/candidate-application/entities/candidate-application.entity';
import {
  setSortStageApplicationsSingleJob,
  setSortStageJobs,
} from 'src/utils/funtions';
import { Category } from 'src/categories/entities/category.entity';
// import { subDays, subMonths, subYears } from 'date-fns';

@Injectable()
export class JobService {
  handle() {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(CandidateApplication.name)
    private applicationModel: Model<CandidateApplication>,
  ) {}

  // TODO modify job title check with jobType
  async create(dto: CreateJobDto) {
    const jobFound = await this.jobModel.findOne({
      createdBy: dto.createdBy,
      title: {
        $regex: new RegExp(`^${dto.title}$`, 'i'),
      },
    });

    if (jobFound) {
      throw new BadRequestException('This Job is already present');
    }

    const currentTime = new Date();
    const deadline = dto.applicationDeadline;

    if (deadline < currentTime) {
      throw new BadRequestException(
        'Application deadline cannot be equal to and less than current date.',
      );
    }

    // const job = (await this.jobModel.create(dto)).populate({
    //   path: 'createdBy',
    // });
    const job = await (
      await this.jobModel.create(dto)
    ).populate({
      path: 'createdBy',
    });
    return job;
  }

  async jobReminder(reminderDate: Date) {
    const jobs = await this.jobModel
      .find({
        applicationDeadline: { $gte: reminderDate },
      })
      .populate({ path: 'createdBy' });
    return jobs;
  }

  async findJobsWithExpiredDeadlines(currentTime: Date) {
    return this.jobModel.find({ applicationDeadline: { $lt: currentTime } });
  }

  async closeJob(jobId: string) {
    return this.jobModel.findByIdAndUpdate(
      jobId,
      { jobStatus: 'closed' },
      { new: true },
    );
  }

  async findAllByCompany(userid: string, query: jobPaginationDto) {
    const { page, limit, jobStatus } = query;
    let result;
    let matchStage: any = { createdBy: new mongoose.Types.ObjectId(userid) };

    const lookup1 = {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdByInfo',
        pipeline: [{ $project: { company: 1 } }],
      },
    };
    const nestedLookup = {
      $lookup: {
        from: 'companies',
        localField: 'createdByInfo.company',
        foreignField: '_id',
        as: 'companyInfo',
        pipeline: [{ $project: { name: 1, email: 2, industry: 3 } }],
      },
    };
    const lookup2 = {
      $lookup: {
        from: 'candidateapplications',
        localField: 'applications',
        foreignField: '_id',
        as: 'applicationsInfo',
      },
    };

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.jobModel.aggregate([
        {
          $facet: {
            jobs: [
              { $match: matchStage },
              lookup1,
              nestedLookup,
              lookup2,
              { $skip: skip },
              { $limit: +limit },
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);

      if (jobStatus) {
        matchStage = {
          createdBy: new mongoose.Types.ObjectId(userid),
          jobStatus: jobStatus,
        };
        result = await this.jobModel.aggregate([
          {
            $facet: {
              jobs: [
                { $match: matchStage },
                lookup1,
                nestedLookup,
                lookup2,
                { $skip: skip },
                { $limit: +limit },
              ],
              totalDocs: [{ $match: matchStage }, { $count: 'count' }],
            },
          },
        ]);
      }

      const jobs = result[0].jobs;
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

      return {
        jobs: jobs,
        total: totalDocs,
      };
    }
    // else {
    //   result = await this.jobModel.aggregate([
    //     {
    //       $facet: {
    //         jobs: [{ $match: matchStage }, lookup1, nestedLookup, lookup2],
    //         totalDocs: [{ $match: matchStage }, { $count: 'count' }],
    //       },
    //     },
    //   ]);
    // }

    // const jobs = result[0].jobs;
    // const totalDocs =
    //   result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    // return {
    //   jobs: jobs,
    //   total: totalDocs,
    // };
  }

  async findAllJobsByCompany(userid: string, query: jobsListingCompanyDto) {
    const {
      page,
      limit,
      jobStatus,
      employmentType,
      jobTitle,
      datePosted,
      applicationDeadline,
      sort,
    } = query;
    let result;
    const sortStage: any = {};
    let matchStage: any = { createdBy: new mongoose.Types.ObjectId(userid) };

    if (sort) {
      sortStage['$sort'] = setSortStageJobs(sort);
    }
    console.log('job sort page', sortStage);
    const lookup1 = {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdByInfo',
        pipeline: [{ $project: { company: 1 } }],
      },
    };
    const nestedLookup = {
      $lookup: {
        from: 'companies',
        localField: 'createdByInfo.company',
        foreignField: '_id',
        as: 'companyInfo',
        pipeline: [{ $project: { name: 1, email: 2, industry: 3 } }],
      },
    };

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      if (jobStatus) {
        matchStage = {
          ...matchStage,
          jobStatus: jobStatus,
        };
      }
      if (jobTitle) {
        matchStage = {
          ...matchStage,
          title: { $regex: jobTitle, $options: 'i' },
        };
      }
      if (employmentType && employmentType.length > 0) {
        matchStage = {
          ...matchStage,
          employmentType,
        };
      }
      // query by date Posted
      if (datePosted) {
        const numericValue = parseInt(datePosted);
        const currentDate = new Date();

        if (datePosted.toLowerCase().includes('days')) {
          const daysAgo = new Date(currentDate);
          daysAgo.setDate(currentDate.getDate() - numericValue);

          matchStage.createdAt = { $gte: daysAgo };
        } else if (datePosted.toLowerCase().includes('hours')) {
          const hoursAgo = new Date(currentDate);
          hoursAgo.setHours(currentDate.getHours() - numericValue);

          matchStage.createdAt = { $gte: hoursAgo };
        } else {
          throw new BadRequestException(
            'Invalid format for datePosted, can be like 14 days or 24 hours',
          );
        }
      }
      // query by due date(application Deadline)
      if (applicationDeadline) {
        // Convert applicationDeadline to a Date object
        const applicationDeadlineDate = new Date(applicationDeadline);

        // Set the matchStage for applicationDeadline
        matchStage.applicationDeadline = { $lte: applicationDeadlineDate };
      }
      console.log('job matchStage...', matchStage);
      result = await this.jobModel.aggregate([
        {
          $facet: {
            jobs: [
              { $match: matchStage },
              lookup1,
              nestedLookup,
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
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
    // else {
    //   result = await this.jobModel.aggregate([
    //     {
    //       $facet: {
    //         jobs: [{ $match: matchStage }, lookup1, nestedLookup, lookup2],
    //         totalDocs: [{ $match: matchStage }, { $count: 'count' }],
    //       },
    //     },
    //   ]);
    // }

    // const jobs = result[0].jobs;
    // const totalDocs =
    //   result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    // return {
    //   jobs: jobs,
    //   total: totalDocs,
    // };
  }

  async findAllJobsForAdmin(query: jobsListingDto) {
    const dynamicQuery: any = {};

    // query job by approval status
    if (query.approvalStatus) {
      dynamicQuery.approvalStatus = query.approvalStatus;
    }
    // query job by title
    if (query.jobTitle) {
      dynamicQuery.title = { $regex: new RegExp(query.jobTitle, 'i') };
    }

    // query job by employmentType
    if (query.employmentType && query.employmentType.length > 0) {
      dynamicQuery.employmentType = { $in: query.employmentType };
    }

    // query jobs by datePosted
    if (query.datePosted) {
      const numericValue = parseInt(query.datePosted);

      if (query.datePosted.toLowerCase().includes('days')) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - numericValue);

        dynamicQuery.createdAt = { $gte: daysAgo };
      } else if (query.datePosted.toLowerCase().includes('hours')) {
        const hoursAgo = new Date();
        hoursAgo.setHours(hoursAgo.getHours() - numericValue);

        dynamicQuery.createdAt = { $gte: hoursAgo };
      } else {
        throw new BadRequestException(
          'Invalid format for datePosted, can be like 14 days or 24 hours',
        );
      }
    }

    // query job by jobStatus
    if (query.jobStatus) {
      dynamicQuery.jobStatus = query.jobStatus;
    }

    // console.log('final query', dynamicQuery);

    let jobs;
    if (query.page && query.limit) {
      let skip = (query.page - 1) * query.limit;
      // Ensure skip is at least 0
      if (skip < 0) {
        skip = 0;
      }
      jobs = await this.jobModel
        .find(dynamicQuery)
        .skip(skip)
        .limit(query.limit)
        .populate({
          path: 'createdBy',
          select: 'company',
          populate: { path: 'company', select: 'name email industry' },
        })
        .populate({ path: 'applications' })
        .populate({ path: 'benefits' })
        .populate({ path: 'categories' })
        .populate({ path: 'requiredSkills' });

      // Filter documents based on companyName
      if (query.companyName) {
        // console.log('query by company name also', query.companyName);
        jobs = jobs.filter((job) =>
          job.createdBy?.company?.name.match(
            new RegExp(query.companyName!, 'i'),
          ),
        );
      }
    } else {
      jobs = await this.jobModel
        .find(dynamicQuery)
        .populate({
          path: 'createdBy',
          select: 'company',
          populate: { path: 'company', select: 'name email industry' },
        })
        .populate({ path: 'applications' })
        .populate({ path: 'benefits' })
        .populate({ path: 'categories' })
        .populate({ path: 'requiredSkills' });
    }

    const totalDocs = await this.jobModel.find(dynamicQuery).countDocuments();

    return { jobs, total: totalDocs };
  }

  async findAllJobs(query: jobsListingDto) {
    const dynamicQuery: any = {};

    // query job by approval status
    if (query.approvalStatus) {
      dynamicQuery.approvalStatus = query.approvalStatus;
    }
    // query job by title
    if (query.jobTitle) {
      dynamicQuery.title = { $regex: new RegExp(query.jobTitle, 'i') };
    }

    // query job by employmentType
    if (query.employmentType) {
      dynamicQuery.employmentType = query.employmentType;
    }

    // query jobs by datePosted
    if (query.datePosted) {
      const numericValue = parseInt(query.datePosted);

      if (query.datePosted.toLowerCase().includes('days')) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - numericValue);

        dynamicQuery.createdAt = { $gte: daysAgo };
      } else if (query.datePosted.toLowerCase().includes('hours')) {
        const hoursAgo = new Date();
        hoursAgo.setHours(hoursAgo.getHours() - numericValue);

        dynamicQuery.createdAt = { $gte: hoursAgo };
      } else {
        throw new BadRequestException(
          'Invalid format for datePosted, can be like 14 days or 24 hours',
        );
      }
    }

    // query job by jobStatus
    if (query.jobStatus) {
      dynamicQuery.jobStatus = query.jobStatus;
    }

    // console.log('final query', dynamicQuery);

    let jobs;
    if (query.page && query.limit) {
      let skip = (query.page - 1) * query.limit;
      // Ensure skip is at least 0
      if (skip < 0) {
        skip = 0;
      }
      jobs = await this.jobModel
        .find(dynamicQuery)
        .skip(skip)
        .limit(query.limit)
        .populate({
          path: 'createdBy',
          select: 'company',
          populate: { path: 'company', select: 'name email industry' },
        })
        .populate({ path: 'applications' })
        .populate({ path: 'benefits' })
        .populate({ path: 'categories' })
        .populate({ path: 'requiredSkills' });

      // Filter documents based on companyName
      if (query.companyName) {
        // console.log('query by company name also', query.companyName);
        jobs = jobs.filter((job) =>
          job.createdBy?.company?.name.match(
            new RegExp(query.companyName!, 'i'),
          ),
        );
      }
    } else {
      jobs = await this.jobModel
        .find(dynamicQuery)
        .populate({
          path: 'createdBy',
          select: 'company',
          populate: { path: 'company', select: 'name email industry' },
        })
        .populate({ path: 'applications' })
        .populate({ path: 'benefits' })
        .populate({ path: 'categories' })
        .populate({ path: 'requiredSkills' });
    }

    const totalDocs = await this.jobModel.find(dynamicQuery).countDocuments();

    return { jobs, total: totalDocs };
  }

  async findAllJobsForHomeScreen(query: jobsListingDto) {
    console.log('jobs query.....', query);
    const dynamicQuery: any = {};

    // remove pending jobs
    dynamicQuery['approvalStatus'] = 'approved';

    // query job by title
    // if (query.jobTitle) {
    //   dynamicQuery.title = { $regex: new RegExp(query.jobTitle, 'i') };
    // }

    if (query.MinSalaryRange && query.MaxSalaryRange) {
      const minSalary = parseInt(query.MinSalaryRange);
      const maxSalary = parseInt(query.MaxSalaryRange);
      dynamicQuery.MinSalaryRange = { $gte: minSalary };
      dynamicQuery.MaxSalaryRange = { $lte: maxSalary };
    }

    // query job by employmentType
    if (query.employmentType && query.employmentType.length > 0) {
      const employmentTypes = query.employmentType.split(',');
      dynamicQuery.employmentType = { $in: employmentTypes };
    }

    // query jobs by datePosted
    // if (query.datePosted) {
    //   const numericValue = parseInt(query.datePosted);

    //   if (query.datePosted.toLowerCase().includes('days')) {
    //     const daysAgo = new Date();
    //     daysAgo.setDate(daysAgo.getDate() - numericValue);

    //     dynamicQuery.createdAt = { $gte: daysAgo };
    //   } else if (query.datePosted.toLowerCase().includes('hours')) {
    //     const hoursAgo = new Date();
    //     hoursAgo.setHours(hoursAgo.getHours() - numericValue);

    //     dynamicQuery.createdAt = { $gte: hoursAgo };
    //   } else {
    //     throw new BadRequestException(
    //       'Invalid format for datePosted, can be like 14 days or 24 hours',
    //     );
    //   }
    // }

    // query job by jobStatus
    // if (query.jobStatus) {
    //   dynamicQuery.jobStatus = query.jobStatus;
    // }

    if (query.categories && query.categories.length > 0) {
      // Convert comma-separated category IDs to an array
      const categoryIds = query.categories.split(',');

      // Filter jobs based on category IDs
      dynamicQuery.categories = { $in: categoryIds };
    }

    // if (query.benefits && query.benefits.length > 0) {
    //   dynamicQuery.benefits = { $in: query.benefits };
    // }

    // if (query.requiredSkills && query.requiredSkills.length > 0) {
    //   dynamicQuery.requiredSkills = { $in: query.requiredSkills };
    // }

    console.log('final query', dynamicQuery);

    let jobs;
    if (query.page && query.limit) {
      let skip = (query.page - 1) * query.limit;
      // Ensure skip is at least 0
      if (skip < 0) {
        skip = 0;
      }
      jobs = await this.jobModel
        .find(dynamicQuery)
        .skip(skip)
        .limit(query.limit)
        .populate({
          path: 'createdBy',
          select: 'company',
          populate: { path: 'company', select: 'name industry logo' },
        })
        // .populate({ path: 'applications' })
        // .populate({ path: 'benefits' })
        // .populate({ path: 'categories' })
        .populate({ path: 'requiredSkills', select: 'title' })
        .select(
          'title employmentType createdBy MaxSalaryRange MinSalaryRange requiredSkills location categories',
        );

      // Filter documents based on companyName
      // if (query.companyName) {
      //   // console.log('query by company name also', query.companyName);
      //   jobs = jobs.filter((job) =>
      //     job.createdBy?.company?.name.match(
      //       new RegExp(query.companyName!, 'i'),
      //     ),
      //   );
      // }
    } else {
      jobs = await this.jobModel
        .find(dynamicQuery)
        .populate({
          path: 'createdBy',
          select: 'company',
          populate: { path: 'company', select: 'name email industry' },
        })
        // .populate({ path: 'applications' })
        .populate({ path: 'benefits' })
        .populate({ path: 'category' })
        .populate({ path: 'skill' });
    }
    const totalDocs = await this.jobModel.find(dynamicQuery).countDocuments();

    return { jobs, total: totalDocs };
  }

  async findById(id: string) {
    return await this.jobModel.findById(id);
  }

  async recentJobs(userID: string, query: paginationDto) {
    const { page, limit } = query;

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      const matchStage: any = {
        createdBy: new mongoose.Types.ObjectId(userID),
      };

      const userRecentJobs = await this.jobModel.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: +limit },
      ]);

      return userRecentJobs;
    }
  }

  // matching on the base of catefories
  async similarJobs(userID: string, query: paginationDto) {
    const { page, limit } = query;
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      const openedJob = await this.jobModel.findById(userID).exec();

      if (!openedJob) {
        throw new NotFoundException('Opened job not found');
      }

      const similarJobsPipeline = [
        {
          $match: {
            categories: { $in: openedJob.categories },
            _id: { $ne: new mongoose.Types.ObjectId(userID) },
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: +limit,
        },
        {
          $facet: {
            similarJobs: [
              {
                $addFields: {
                  isOpenedJob: { $literal: false },
                },
              },
            ],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ];

      const result = await this.jobModel.aggregate(similarJobsPipeline);

      const similarJobs = result[0].similarJobs;

      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

      return {
        similarJobs,
        totalDocs,
      };
    }
  }

  async jobId(userID: string, query: paginationDto) {
    const { page, limit } = query;

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      const matchStage: any = {
        createdBy: new mongoose.Types.ObjectId(userID),
      };

      const userRecentJobs = await this.jobModel.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: +limit },
      ]);

      return userRecentJobs;
    }
  }

  async getJobAna(userId: string) {
    const jobAnalytics = (await this.jobModel.aggregate([
      {
        $match: {
          approvalStatus: 'approved',
          createdBy: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $facet: {
          jobStatusCounts: [
            {
              $group: {
                _id: '$jobStatus',
                count: { $sum: 1 },
              },
            },
          ],
          jobTypeCounts: [
            {
              $group: {
                _id: '$jobType',
                count: { $sum: 1 },
              },
            },
          ],
          // employmentTypeCounts: [
          //   {
          //     $group: {
          //       _id: '$employmentType',
          //       count: { $sum: 1 },
          //     },
          //   },
          // ],
          jobsTotalCounts: [
            {
              $group: {
                _id: null,
                totalCount: { $sum: 1 },
              },
            },
          ],
        },
      },
      {
        $unwind: '$jobStatusCounts',
      },
      {
        $unwind: '$jobTypeCounts',
      },
      // {
      //   $unwind: '$employmentTypeCounts',
      // },
      {
        $group: {
          _id: null,
          jobStatusCounts: {
            $push: {
              k: '$jobStatusCounts._id',
              v: '$jobStatusCounts.count',
            },
          },
          jobTypeCounts: {
            $push: {
              k: '$jobTypeCounts._id',
              v: '$jobTypeCounts.count',
            },
          },
          // employmentTypeCounts: {
          //   $push: {
          //     k: '$employmentTypeCounts._id',
          //     v: '$employmentTypeCounts.count',
          //   },
          // },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              { $arrayToObject: '$jobStatusCounts' },
              // { $arrayToObject: '$jobTypeCounts' },
              { $arrayToObject: '$employmentTypeCounts' },
            ],
          },
        },
      },
    ])) as any;

    return jobAnalytics.length > 0 ? jobAnalytics.pop() : {};
  }

  async getJobDetailsByStatus(userId: string, statusField: string) {
    const validStatusFields = [
      'full-time',
      'part-time',
      // 'selfEmployed',
      // 'freelance',
      'contract',
      'internship',
      // 'apprenticeship',
      // 'seasonal',
      'onsite',
      'remote',
      'hybrid',
      'open',
      'closed',
    ];

    if (!validStatusFields.includes(statusField)) {
      throw new BadRequestException('Invalid status field');
    }

    const matchQuery: any = {
      createdBy: new mongoose.Types.ObjectId(userId),
    };

    // Check if the statusField belongs to employmentType, jobType, or jobStatus
    if (
      [
        'full-time',
        'part-time',
        // 'selfEmployed',
        // 'freelance',
        'contract',
        'internship',
        // 'apprenticeship',
        // 'seasonal',
      ].includes(statusField)
    ) {
      matchQuery.employmentType = statusField;
    } else if (['onsite', 'remote', 'hybrid'].includes(statusField)) {
      matchQuery.jobType = statusField;
    } else {
      matchQuery.jobStatus = statusField;
    }

    const jobDetails = await this.jobModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          content: 1,
          location: 1,
          salaryRange: 1,
          employmentType: 1,
          jobType: 1,
          jobStatus: 1,
          applicationDeadline: 1,
          applications: 1,
          companyAssessment: 1,
          createdBy: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
        },
      },
    ]);

    const totalDocs = jobDetails.length;

    const result: any = {};
    result[statusField] = jobDetails;
    result.totalDocs = totalDocs;

    return result;
  }

  async companyAnalytic(userId: string) {
    const pipeline = [
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'candidateapplications',
          localField: '_id',
          foreignField: 'job',
          as: 'applications',
        },
      },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          totalFullTime: {
            $sum: { $cond: [{ $in: ['full-time', '$employmentType'] }, 1, 0] },
          },
          totalPartTime: {
            $sum: { $cond: [{ $in: ['part-time', '$employmentType'] }, 1, 0] },
          },
          totalRemote: {
            $sum: { $cond: [{ $in: ['remote', '$employmentType'] }, 1, 0] },
          },
          totalInternship: {
            $sum: { $cond: [{ $in: ['internship', '$employmentType'] }, 1, 0] },
          },
          totalContract: {
            $sum: { $cond: [{ $in: ['contract', '$employmentType'] }, 1, 0] },
          },
          totalOpen: {
            $sum: { $cond: [{ $eq: ['$jobStatus', 'open'] }, 1, 0] },
          },
          totalClosed: {
            $sum: { $cond: [{ $eq: ['$jobStatus', 'closed'] }, 1, 0] },
          },
          totalApplications: { $sum: { $size: '$applications' } },
          totalAccept: {
            $sum: {
              $reduce: {
                input: '$applications',
                initialValue: 0,
                in: {
                  $sum: [
                    '$$value',
                    {
                      $cond: [
                        { $eq: ['$$this.statusByCompany.status', 'accept'] },
                        1,
                        0,
                      ],
                    },
                  ],
                },
              },
            },
          },
          totalLinkSent: {
            $sum: {
              $reduce: {
                input: '$applications',
                initialValue: 0,
                in: {
                  $sum: [
                    '$$value',
                    {
                      $cond: [
                        { $eq: ['$$this.statusByCompany.status', 'Link sent'] },
                        1,
                        0,
                      ],
                    },
                  ],
                },
              },
            },
          },
          totalSendMail: {
            $sum: {
              $reduce: {
                input: '$applications',
                initialValue: 0,
                in: {
                  $sum: [
                    '$$value',
                    {
                      $cond: [
                        { $eq: ['$$this.statusByCompany.status', 'Send mail'] },
                        1,
                        0,
                      ],
                    },
                  ],
                },
              },
            },
          },
          totalInterviewing: {
            $sum: {
              $reduce: {
                input: '$applications',
                initialValue: 0,
                in: {
                  $sum: [
                    '$$value',
                    {
                      $cond: [
                        {
                          $eq: [
                            '$$this.statusByCompany.status',
                            'Interviewing',
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  ],
                },
              },
            },
          },
          totalHired: {
            $sum: {
              $reduce: {
                input: '$applications',
                initialValue: 0,
                in: {
                  $sum: [
                    '$$value',
                    {
                      $cond: [
                        { $eq: ['$$this.statusByCompany.status', 'hired'] },
                        1,
                        0,
                      ],
                    },
                  ],
                },
              },
            },
          },
          totalRejected: {
            $sum: {
              $reduce: {
                input: '$applications',
                initialValue: 0,
                in: {
                  $sum: [
                    '$$value',
                    {
                      $cond: [
                        { $eq: ['$$this.statusByCompany.status', 'rejected'] },
                        1,
                        0,
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
    ];

    const result = await this.jobModel.aggregate(pipeline);

    // Extract counts from the aggregation result
    const counts = result.length > 0 ? result[0] : {};

    return counts;
  }

  // async companyAnalytics(userId: string) {
  //   console.log(userId);
  //   const pipeline = [
  //     {
  //       $match: {
  //         createdBy: new mongoose.Types.ObjectId(userId),
  //         // ...matchFilter,
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'candidateapplications',
  //         localField: '_id',
  //         foreignField: 'job',
  //         as: 'applications',
  //       },
  //     },
  //     {
  //       $unwind: '$applications',
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         totalJobs: { $sum: 1 },
  //         totalFullTime: {
  //           $sum: { $size: { $ifNull: ['$employmentType', []] } },
  //         },
  //         totalPartTime: {
  //           $sum: { $cond: [{ $in: ['part-time', '$employmentType'] }, 1, 0] },
  //         },
  //         totalRemote: {
  //           $sum: { $cond: [{ $in: ['remote', '$employmentType'] }, 1, 0] },
  //         },
  //         totalInternship: {
  //           $sum: { $cond: [{ $in: ['internship', '$employmentType'] }, 1, 0] },
  //         },
  //         totalContract: {
  //           $sum: { $cond: [{ $in: ['contract', '$employmentType'] }, 1, 0] },
  //         },
  //         totalOpen: {
  //           $sum: { $cond: [{ $eq: ['$jobStatus', 'open'] }, 1, 0] },
  //         },
  //         totalClosed: {
  //           $sum: { $cond: [{ $eq: ['$jobStatus', 'closed'] }, 1, 0] },
  //         },
  //         totalApplications: { $sum: 1 }, // Count applications
  //         totalAccept: {
  //           $sum: {
  //             $cond: [
  //               { $eq: ['$applications.statusByCompany.status', 'accept'] },
  //               1,
  //               0,
  //             ],
  //           },
  //         },
  //         totalInvited: {
  //           $sum: {
  //             $cond: [
  //               { $eq: ['$applications.statusByCompany.status', 'Link sent'] },
  //               1,
  //               0,
  //             ],
  //           },
  //         },
  //         totalSendMail: {
  //           $sum: {
  //             $cond: [
  //               { $eq: ['$applications.statusByCompany.status', 'Send mail'] },
  //               1,
  //               0,
  //             ],
  //           },
  //         },
  //         totalInterviewing: {
  //           $sum: {
  //             $cond: [
  //               {
  //                 $eq: ['$applications.statusByCompany.status', 'Interviewing'],
  //               },
  //               1,
  //               0,
  //             ],
  //           },
  //         },
  //         totalHired: {
  //           $sum: {
  //             $cond: [
  //               { $eq: ['$applications.statusByCompany.status', 'hired'] },
  //               1,
  //               0,
  //             ],
  //           },
  //         },
  //         totalRejected: {
  //           $sum: {
  //             $cond: [
  //               { $eq: ['$applications.statusByCompany.status', 'rejected'] },
  //               1,
  //               0,
  //             ],
  //           },
  //         },
  //       },
  //     },
  //   ];

  //   const result = await this.jobModel.aggregate(pipeline);

  //   // Extract counts from the aggregation result
  //   const counts = result.length > 0 ? result[0] : {};

  //   return counts;
  // }

  // // with last days
  // async companyAnalytics(userId: string, filter: string) {
  //   const matchStage: any = {
  //     createdBy: new mongoose.Types.ObjectId(userId),
  //   };

  //   if (filter) {
  //     let startDate;

  //     switch (filter) {
  //       case 'Last 7 days':
  //         startDate = subDays(new Date(), 7);
  //         break;
  //       case 'Last month':
  //         startDate = subMonths(new Date(), 1);
  //         break;
  //       case 'Last 7 years':
  //         startDate = subYears(new Date(), 7);
  //         break;
  //       default:
  //         startDate = null; // No filter
  //     }

  //     matchStage.createdAt = startDate
  //       ? { $gte: startDate }
  //       : { $exists: true };
  //   }

  //   const pipeline = [
  //     {
  //       $match: matchStage,
  //     },
  //     {
  //       $lookup: {
  //         from: 'candidateapplications',
  //         localField: '_id',
  //         foreignField: 'job',
  //         as: 'applications',
  //       },
  //     },
  //     {
  //       $unwind: '$applications',
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         totalJobs: { $sum: 1 },
  //         totalFullTime: {
  //           $sum: { $size: { $ifNull: ['$employmentType', []] } },
  //         },
  //         totalPartTime: {
  //           $sum: { $cond: [{ $in: ['part-time', '$employmentType'] }, 1, 0] },
  //         },
  //         totalRemote: {
  //           $sum: { $cond: [{ $in: ['remote', '$employmentType'] }, 1, 0] },
  //         },
  //         totalInternship: {
  //           $sum: { $cond: [{ $in: ['internship', '$employmentType'] }, 1, 0] },
  //         },
  //         totalContract: {
  //           $sum: { $cond: [{ $in: ['contract', '$employmentType'] }, 1, 0] },
  //         },
  //         totalOpen: {
  //           $sum: { $cond: [{ $eq: ['$jobStatus', 'open'] }, 1, 0] },
  //         },
  //         totalClosed: {
  //           $sum: { $cond: [{ $eq: ['$jobStatus', 'closed'] }, 1, 0] },
  //         },
  //         totalApplications: { $sum: 1 }, // Count applications
  //         totalAccept: {
  //           $sum: {
  //             $cond: [
  //               { $eq: ['$applications.statusByCompany.status', 'accept'] },
  //               1,
  //               0,
  //             ],
  //           },
  //         },
  //         totalInvited: {
  //           $sum: {
  //             $cond: [
  //               { $eq: ['$applications.statusByCompany.status', 'Link sent'] },
  //               1,
  //               0,
  //             ],
  //           },
  //         },
  //         totalSendMail: {
  //           $sum: {
  //             $cond: [
  //               { $eq: ['$applications.statusByCompany.status', 'Send mail'] },
  //               1,
  //               0,
  //             ],
  //           },
  //         },
  //         totalInterviewing: {
  //           $sum: {
  //             $cond: [
  //               {
  //                 $eq: ['$applications.statusByCompany.status', 'Interviewing'],
  //               },
  //               1,
  //               0,
  //             ],
  //           },
  //         },
  //         totalHired: {
  //           $sum: {
  //             $cond: [
  //               { $eq: ['$applications.statusByCompany.status', 'hired'] },
  //               1,
  //               0,
  //             ],
  //           },
  //         },
  //         totalRejected: {
  //           $sum: {
  //             $cond: [
  //               { $eq: ['$applications.statusByCompany.status', 'rejected'] },
  //               1,
  //               0,
  //             ],
  //           },
  //         },
  //       },
  //     },
  //   ];

  //   const result = await this.jobModel.aggregate(pipeline);

  //   // Extract counts from the aggregation result
  //   const counts = result.length > 0 ? result[0] : {};

  //   return counts;
  // }

  async findOne(jobId: string) {
    const jobFound = await this.jobModel
      .findById(jobId)
      .populate({
        path: 'createdBy',
        select: 'company',
        populate: { path: 'company', select: 'name email industry' },
      })
      .populate({
        path: 'applications',
        populate: { path: 'candidate', select: 'email candidate' },
      })
      .populate({
        path: 'requiredSkills',
      })
      .populate({
        path: 'categories',
      })
      .populate({
        path: 'benefits',
      });

    if (!jobFound) {
      throw new NotFoundException('Job not found');
    }
    // add a check if jobStatus == closed throw error
    return jobFound;
  }

  async update(jobId: string, dto: UpdateJobDto) {
    const updatedJob = await this.jobModel.findByIdAndUpdate(jobId, dto, {
      new: true,
    });

    if (!updatedJob) {
      throw new NotFoundException('No job found');
    }
    return updatedJob;
  }

  async approveJob(jobId: string) {
    const updatedJob = await this.jobModel.findByIdAndUpdate(
      jobId,
      { approvalStatus: 'approved' },
      {
        new: true,
      },
    );

    if (!updatedJob) {
      throw new NotFoundException('No job found');
    }
    return updatedJob;
  }

  async findAllAppSingleCompany(
    userid: string,
    query: allApplicationsOfCompanyDto,
  ) {
    let result;
    const { limit, page, sort } = query;

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      const matchStage: any = {
        createdBy: new mongoose.Types.ObjectId(userid),
      };

      const sortStage: any = {};

      if (sort) {
        sortStage['$sort'] = setSortStageApplicationsSingleJob(sort);
        console.log('$sort....', sort);
      }

      result = await this.jobModel.aggregate([
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: 'candidateapplications',
            localField: 'applications',
            foreignField: '_id',
            as: 'applications',
          },
        },
        {
          $unwind: '$applications',
        },
        {
          $replaceRoot: { newRoot: '$applications' },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'candidate',
            foreignField: '_id',
            as: 'candidateInfo',
          },
        },
        {
          $unwind: '$candidateInfo',
        },
        {
          $facet: {
            applications: [
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [{ $count: 'count' }],
          },
        },
        {
          $project: {
            applications: {
              $map: {
                input: '$applications',
                as: 'app',
                in: {
                  $mergeObjects: [
                    {
                      _id: '$$app._id',
                      statusByCandidate: '$$app.statusByCandidate',
                      statusByCompany: '$$app.statusByCompany',
                      candidate: '$$app.candidate',
                      candidateInfo: {
                        name: '$$app.candidateInfo.name',
                      },
                      job: '$$app.job',
                      addInfo: '$$app.addInfo',
                      previousJobTitle: '$$app.previousJobTitle',
                      createdAt: '$$app.createdAt',
                      updatedAt: '$$app.updatedAt',
                      __v: '$$app.__v',
                    },
                  ],
                },
              },
            },
            totalDocs: 1,
          },
        },
      ]);

      const applications = result[0].applications;
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

      return {
        applications: applications,
        total: totalDocs,
      };
    }
  }

  // async findAllAppSingleCompany(
  //   userid: string,
  //   query: allApplicationsOfCompanyDto,
  // ) {
  //   let result;
  //   const { limit, page, sort } = query;

  //   if (page !== undefined && limit !== undefined) {
  //     let skip = (page - 1) * limit;
  //     if (skip < 0) {
  //       skip = 0;
  //     }

  //     console.log('userid', userid);

  //     const matchStage: any = {
  //       createdBy: new mongoose.Types.ObjectId(userid),
  //     };

  //     console.log('all applications.... match stage', matchStage);
  //     const sortStage: any = {};

  //     if (sort) {
  //       console.log('$sort', sort);
  //       sortStage['$sort'] = setSortStageApplicationsSingleJob(sort);
  //       console.log('$sortStage', sortStage);
  //     }

  //     // handle if a company all jobs have no application
  //     result = await this.jobModel.aggregate([
  //       {
  //         $match: matchStage,
  //       },
  //       {
  //         $lookup: {
  //           from: 'candidateapplications',
  //           localField: 'applications',
  //           foreignField: '_id',
  //           as: 'applications',
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: 'users',
  //           localField: 'candidate',
  //           foreignField: '_id',
  //           as: 'candidateInfo',
  //         },
  //       },
  //       {
  //         $project: {
  //           applications: {
  //             $cond: {
  //               if: { $gt: [{ $size: '$applications' }, 0] },
  //               then: '$applications',
  //               else: [],
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $match: {
  //           'applications.0': { $exists: true },
  //         },
  //       },
  //       { $skip: skip },
  //       { $limit: +limit },
  //       {
  //         $facet: {
  //           applications: [{ $skip: skip }, { $limit: +limit }],
  //           totalDocs: [{ $match: matchStage }, { $count: 'count' }],
  //         },
  //       },
  //     ]);

  //     const applications = result[0].applications[0].applications;
  //     const totalDocs =
  //       result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

  //     console.log('totalDocs', totalDocs);

  //     return {
  //       applications: applications,
  //       total: totalDocs,
  //     };
  //   }
  // }

  async updateApplicants(applicationId: string, jobId: string) {
    // called service of create-application in controller
    const job = await this.jobModel.findById(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    // Check if the user has already applied for this job

    // if (job.applications.includes(applicationId)) {
    //   return job;
    // } else {
    const updatedJob = await this.jobModel.findByIdAndUpdate(
      jobId,
      { $push: { applications: applicationId } },
      { new: true, useFindAndModify: false },
    );
    // .populate({
    //   path: 'applicantions',
    //   select: 'name email',
    // });
    // console.log('updatedJob', updatedJob);
    return updatedJob;
    // }
  }

  async rejectApplication(dto: RejectDto) {
    const { jobid, applicationId } = dto;

    const applicationFound =
      await this.applicationModel.findById(applicationId);
    if (!applicationFound) {
      throw new NotFoundException('Application not found');
    }

    const jobFound = await this.jobModel.findById(jobid);

    if (!jobFound) {
      throw new NotFoundException('Job not found');
    }
    // rejecting status of application
    applicationFound.statusByCandidate = {
      status: EnumsCandidate.rejectPhase.status,
      message: EnumsCandidate.rejectPhase.message,
    };
    applicationFound.statusByCompany = {
      status: EnumsCandidate.rejectPhase.status,
      message: EnumsCandidate.rejectPhase.message,
    };

    await applicationFound.save();

    // remove application id from job

    const Applications = jobFound.applications.filter((item) => {
      // console.log(item.toString(), applicationId);
      if (item.toString() !== applicationId) {
        return item;
      }
    });
    // console.log(Applications);
    jobFound.applications = Applications;
    return await jobFound.save();
  }

  async remove(jobId: string) {
    return await this.jobModel.findByIdAndDelete(jobId);
  }

  async checkCompany(id: string) {
    console.log('jpb>', id);
    const company = await this.jobModel.findById(id).populate({
      path: 'createdBy',
      select: 'isBlocked',
    });

    console.log(company);
    // console.log('company>', company?.createdBy);
    // console.log('company>', company?.createdBy.isBlocked);
    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    if (company.createdBy.isBlocked == true) {
      return true;
    } else {
      return false;
    }
  }
}
