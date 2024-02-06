import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCandidateApplicationDto } from './dto/update-candidate-application.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CandidateApplication } from './entities/candidate-application.entity';
import {
  EnumsCandidate,
  EnumsCompany,
  NormalCandidateApplyDto,
  applicationListingCompanyDto,
  candidateApplicationPaginationDto,
  paginationDto,
} from 'src/utils/classes';
import { JobService } from 'src/job/job.service';
// import { EventsGateway } from 'src/webgateway/events.gateway';
import { setSortStageApplicationsSingleJob } from 'src/utils/funtions';

@Injectable()
export class CandidateApplicationService {
  constructor(
    @InjectModel(CandidateApplication.name)
    private CandApplicationModel: Model<CandidateApplication>,
    private readonly jobService: JobService,
    // private eventsGateway: EventsGateway,
  ) {}

  async create(
    userId: string,
    job: string,
    dto?: { addInfo?: string; previousJobTitle?: string },
  ) {
    // Check if an application with the same user and candidate IDs already exists
    const existingApplication = await this.CandApplicationModel.findOne({
      candidate: userId,
      job: job,
    });

    if (existingApplication) {
      throw new BadRequestException('User has already applied for this job.');
    }

    // If no existing application, create a new one
    if (dto?.addInfo && dto.previousJobTitle) {
      const application = await this.CandApplicationModel.create({
        candidate: userId,
        job,
        statusByCandidate: {
          status: EnumsCandidate.applyPhase.status,
          message: EnumsCandidate.applyPhase.message,
        },
        statusByCompany: {
          status: EnumsCompany.applyPhase.status,
          message: EnumsCompany.applyPhase.message,
        },
        addInfo: dto.addInfo,
        previousJobTitle: dto.previousJobTitle,
      });

      // // Notification
      // if (application) {
      //   // const notification = `${userName} has a new application for the ${job}`;
      //   // this.eventsGateway.candidateAppNotificationToComp(notification);
      //   this.eventsGateway.candidateAppNotificationToComp();
      // }
      return {
        message: 'Candidate Application has been submitted',
        application,
      };
    } else {
      const application = await this.CandApplicationModel.create({
        candidate: userId,
        job,
        statusByCandidate: {
          status: EnumsCandidate.applyPhase.status,
          message: EnumsCandidate.applyPhase.message,
        },
        statusByCompany: {
          status: EnumsCompany.applyPhase.status,
          message: EnumsCompany.applyPhase.message,
        },
      });

      // // Notification
      // if (application) {
      //   // const notification = `${userName} has a new application for the ${job}`;
      //   // this.eventsGateway.candidateAppNotificationToComp(notification);
      //   this.eventsGateway.candidateAppNotificationToComp();
      // }
      return {
        message: 'Candidate Application has been submitted',
        application,
      };
    }

    // console.log('application>>', application);
  }

  async applyNormalCandidate(userId: string, dto: NormalCandidateApplyDto) {
    // Check if an application with the same user and candidate IDs already exists
    const existingApplication = await this.CandApplicationModel.findOne({
      candidate: userId,
      job: dto.job,
    });

    if (existingApplication) {
      throw new BadRequestException('User has already applied for this job.');
    }

    // If no existing application, create a new one
    const application = await this.CandApplicationModel.create({
      candidate: userId,
      job: dto.job,
      addInfo: dto.addInfo,
      statusByCandidate: {
        status: EnumsCandidate.applyPhase.status,
        message: EnumsCandidate.applyPhase.message,
      },
      statusByCompany: {
        status: EnumsCompany.applyPhase.status,
        message: EnumsCompany.applyPhase.message,
      },
    });

    // // Notification
    // if (application) {
    //   // const notification = `${userName} has a new application for the ${job}`;
    //   // this.eventsGateway.candidateAppNotificationToComp(notification);
    //   this.eventsGateway.candidateAppNotificationToComp();
    // }

    // console.log('application>>', application);
    return { message: 'Candidate Application has been submitted', application };
  }

  async findAll(query: paginationDto) {
    const { page, limit } = query;
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      const result = await this.CandApplicationModel.aggregate([
        {
          $facet: {
            applications: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
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

  // TODO: add interviewed jobs, jobs applied status
  async candidateAnalytics(userID: string, query: paginationDto) {
    const { page, limit } = query;

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      const matchStage: any = {
        candidate: new mongoose.Types.ObjectId(userID),
      };

      const applications = await this.CandApplicationModel.aggregate([
        { $match: matchStage },
        { $skip: skip },
        { $limit: +limit },
        {
          $facet: {
            applications: [{ $skip: skip }, { $limit: +limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
        {
          $project: {
            applications: 1,
            totalJobsAppleid: { $arrayElemAt: ['$totalCount.count', 0] },
          },
        },
      ]);

      return applications;
    }
  }

  async recentApplications(userID: string, query: paginationDto) {
    const { page, limit } = query;

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      const matchStage: any = {
        candidate: new mongoose.Types.ObjectId(userID),
      };

      const recentApplications = await this.CandApplicationModel.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: +limit },
        {
          $lookup: {
            from: 'jobs',
            localField: 'job',
            foreignField: '_id',
            as: 'jobInfo',
          },
        },
        {
          $project: {
            _id: 1,
            statusByCandidate: 1,
            statusByCompany: 1,
            candidate: 1,
            job: 1,
            addInfo: 1,
            previousJobTitle: 1,
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
            jobInfo: {
              _id: { $arrayElemAt: ['$jobInfo._id', 0] },
              title: { $arrayElemAt: ['$jobInfo.title', 0] },
              employmentType: { $arrayElemAt: ['$jobInfo.employmentType', 0] },
              applicationDeadline: {
                $arrayElemAt: ['$jobInfo.applicationDeadline', 0],
              },
              description: { $arrayElemAt: ['$jobInfo.description', 0] },
              createdBy: { $arrayElemAt: ['$jobInfo.createdBy', 0] },
            },
          },
        },
      ]);

      return recentApplications;
    }
  }

  async candidateApplications(
    userId: string,
    query: candidateApplicationPaginationDto,
  ) {
    const { page, limit, applicationStatus, candidateStatus } = query;
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      const matchStageDynamic: any = {
        candidate: new mongoose.Types.ObjectId(userId),
      };

      if (applicationStatus) {
        matchStageDynamic['statusByCompany.status'] = applicationStatus.trim();
      }

      if (candidateStatus) {
        matchStageDynamic['statusByCandidate.status'] = candidateStatus.trim();
      }

      // console.log('matchStageDynamic:', matchStageDynamic);

      const result = await this.CandApplicationModel.aggregate([
        {
          $match: matchStageDynamic,
        },
        {
          $lookup: {
            from: 'jobs',
            localField: 'job',
            foreignField: '_id',
            as: 'jobInfo',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'jobInfo.createdBy',
            foreignField: '_id',
            as: 'userInfo',
          },
        },
        {
          $facet: {
            applications: [
              { $skip: skip },
              { $limit: +limit },
              {
                $addFields: {
                  jobInfo: {
                    $map: {
                      input: '$jobInfo',
                      as: 'job',
                      in: {
                        _id: '$$job._id',
                        title: '$$job.title',
                        createdBy: '$$job.createdBy',
                      },
                    },
                  },
                  userInfo: {
                    $map: {
                      input: '$userInfo',
                      as: 'user',
                      in: {
                        _id: '$$user._id',
                        name: '$$user.name',
                      },
                    },
                  },
                },
              },
            ],
            totalDocs: [{ $count: 'count' }],
            totalAccepted: [
              { $match: { 'statusByCompany.status': 'accept' } },
              { $count: 'count' },
            ],
            totalInterviewing: [
              { $match: { 'statusByCompany.status': 'Interviewing' } },
              { $count: 'count' },
            ],
            totalRejected: [
              { $match: { 'statusByCompany.status': 'rejected' } },
              { $count: 'count' },
            ],
            totalLinkSend: [
              { $match: { 'statusByCandidate.status': 'linksend' } },
              { $count: 'count' },
            ],
            totalPendingAssessment: [
              { $match: { 'statusByCandidate.status': 'Pending Assessment' } },
              { $count: 'count' },
            ],
          },
        },
      ]);

      // console.log('Result:', result);

      const applications = result[0].applications.map((application: any) => {
        return {
          ...application,
          userInfo: application.userInfo[0]
            ? {
                _id: application.userInfo[0]._id,
                name: application.userInfo[0].name,
              }
            : null,
        };
      });

      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
      const totalAccepted = result[0].totalAccepted[0]?.count || 0;
      const totalInterviewing = result[0].totalInterviewing[0]?.count || 0;
      const totalRejected = result[0].totalRejected[0]?.count || 0;
      const totalLinkSend = result[0].totalLinkSend[0]?.count || 0;
      const totalPendingAssessment =
        result[0].totalPendingAssessment[0]?.count || 0;

      return {
        applications,
        totalDocs,
        totalAccepted,
        totalInterviewing,
        totalRejected,
        totalLinkSend,
        totalPendingAssessment,
      };
    }
  }

  async getCandidateStatusCounts(userId: string): Promise<any> {
    const pipeline = [
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'job',
        },
      },
      {
        $unwind: '$job',
      },
      {
        $match: {
          'job.createdBy': new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: '$statusByCandidate.status',
          count: { $sum: 1 },
        },
      },
    ];

    const candidateStatusCounts =
      await this.CandApplicationModel.aggregate(pipeline);
    // console.log('pipeline', candidateStatusCounts);

    // Create a result object
    const result: {
      [key: string]: number;
    } = {};

    // Populate the result object with counts for all statuses
    for (const entry of candidateStatusCounts) {
      result[entry._id] = entry.count;
    }
    // console.log('result....', result);

    return result;
  }

  async getCompanyStatusCounts(userId: string): Promise<any[]> {
    const pipeline = [
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'job',
        },
      },
      {
        $unwind: '$job',
      },
      {
        $match: {
          'job.createdBy': new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: '$statusByCompany.status',
          count: { $sum: 1 },
          message: { $first: '$statusByCompany.message' },
        },
      },
    ];

    const companyStatusCounts =
      await this.CandApplicationModel.aggregate(pipeline);

    // Create an array to store the result objects
    const result: { status: string; count: number; message: string }[] = [];

    // Populate the result array with objects for all statuses
    for (const entry of companyStatusCounts) {
      result.push({
        status: entry._id,
        count: entry.count,
        message: entry.message,
      });
    }

    return result;
  }

  async updatestatusByCompany(
    dto: { jobid: string; email: string },
    status: string,
    message: string,
  ) {
    const { jobid, email } = dto;

    // console.log('status by company....', dto);
    const applications = await this.CandApplicationModel.find({
      job: jobid,
    }).populate({
      path: 'candidate',
      select: 'email name',
    });

    // now match the email field also to get required application
    const requiredDocument = applications.filter((application) => {
      return application.candidate.email === email;
    });
    if (requiredDocument.length == 0) {
      throw new NotFoundException('Application not found');
    }
    // console.log('application....', requiredDocument);

    // now find that document and update it
    const applicationToUpdate = await this.CandApplicationModel.findById(
      requiredDocument[0].id,
    );
    if (applicationToUpdate) {
      // Check if the application is hired
      if (status.toLowerCase() === 'hired') {
        // Call closeJob service to update job status to 'closed'
        await this.jobService.closeJob(jobid);
      }
      applicationToUpdate.statusByCompany = {
        status,
        message,
      };

      // console.log('applicationToUpdate', applicationToUpdate);

      return await applicationToUpdate.save();
    }
  }

  async updatestatusByCandidate(
    dto: { jobid: string; email: string },
    status: string,
    message: string,
  ) {
    const { jobid, email } = dto;
    // console.log('inside statusby candidate', dto);
    const applications = await this.CandApplicationModel.find({
      job: jobid,
    }).populate({
      path: 'candidate',
      select: 'email name',
    });
    // console.log('application....>', applications);
    // now match the email field also to get required application
    const requiredDocument = applications.filter((application) => {
      return application.candidate.email === email;
    });
    if (requiredDocument.length == 0) {
      throw new NotFoundException('Application not found');
    }
    // console.log('application....>', requiredDocument);

    // now find that document and update it
    const applicationToUpdate = await this.CandApplicationModel.findById(
      requiredDocument[0].id,
    );
    if (applicationToUpdate) {
      applicationToUpdate.statusByCandidate = {
        status,
        message,
      };
      return await applicationToUpdate.save();
    }
  }

  async getStatusByCandidate(jobId: string) {
    const candidateApplicationAnalytics =
      await this.CandApplicationModel.aggregate([
        {
          $match: {
            job: new mongoose.Types.ObjectId(jobId),
          },
        },
        {
          $group: {
            _id: {
              statusByCompany: '$statusByCompany.status',
              statusByCandidate: '$statusByCandidate.status',
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            statusByCompany: '$_id.statusByCompany',
            statusByCandidate: '$_id.statusByCandidate',
            count: 1,
          },
        },
      ]);

    return candidateApplicationAnalytics;
  }

  async findOne(id: string) {
    const applicationFound = await this.CandApplicationModel.findById(
      id,
    ).populate({
      path: 'candidate',
      select: 'candidates',
      populate: {
        path: 'candidate',
        // select: 'name email'
      },
    });

    if (!applicationFound) {
      throw new NotFoundException('Application not found');
    }
    return applicationFound;
  }

  async findByCandidate(userid: string, page?: number, limit?: number) {
    let result;
    const matchStage: any = {
      candidate: new mongoose.Types.ObjectId(userid),
    };

    const lookup = {
      $lookup: {
        from: 'jobs', // collection named from which lookup
        localField: 'job',
        foreignField: '_id',
        as: 'jobInfo',
        pipeline: [
          { $project: { title: 1, jobStatus: 2, applicationDeadline: 3 } },
        ],
      },
    };

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.CandApplicationModel.aggregate([
        {
          $facet: {
            applications: [
              { $match: matchStage },
              lookup,
              { $skip: skip },
              { $limit: +limit },
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.CandApplicationModel.aggregate([
        {
          $facet: {
            applications: [{ $match: matchStage }, lookup],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    }

    const applications = result[0].applications;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      applications: applications,
      total: totalDocs,
    };
  }

  async findByJob(
    userid: string,
    jobId: string,
    query: applicationListingCompanyDto,
  ) {
    let result;
    const { page, limit, appliedDate, score, stage, username, sort } = query;
    const matchStage: any = {
      job: new mongoose.Types.ObjectId(jobId),
    };
    const sortStage: any = {};

    if (sort) {
      sortStage['$sort'] = setSortStageApplicationsSingleJob(sort);
    }
    console.log('job sort page', sortStage);

    console.log('match stage...', matchStage);

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.CandApplicationModel.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'users',
            localField: 'candidate',
            foreignField: '_id',
            as: 'userCandidateDetails',
          },
        },
        {
          $unwind: '$userCandidateDetails',
        },
        ...(username
          ? [
              {
                $match: {
                  'userCandidateDetails.name': {
                    $regex: username,
                    $options: 'i',
                  },
                },
              },
            ]
          : []),
        ...(stage
          ? [
              {
                $match: {
                  'statusByCompany.status': stage,
                },
              },
            ]
          : []),
        {
          $facet: {
            applications: [
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
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

  async update(id: string, dto: UpdateCandidateApplicationDto) {
    // console.log('Candidate update DTO....', dto);
    // Check for status update by candidate
    // if (dto.status !== 'applied') {
    //   throw new Error('Status cannot be changed by candidate');
    // }
    const updatedApplication =
      await this.CandApplicationModel.findByIdAndUpdate(id, dto, {
        new: true,
        runValidators: true,
      });

    return updatedApplication;
  }

  async remove(id: string) {
    const isdeleted = await this.CandApplicationModel.findByIdAndDelete(id);
    console.log('Deleted candaidate application', isdeleted);

    return {
      message: 'Application deleted successfully',
    };
  }

  async findByjobEmail(jobid: string, email: string) {
    const application = await this.CandApplicationModel.findOne({
      job: jobid,
    }).populate({
      path: 'candidate',
      match: { email: email },
      select: 'email',
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async findByUserEmail(jobid: string, id: string) {
    // check if jobCompany is not blocked
    // console.log('in appService', jobid, id);
    const company = await this.jobService.checkCompany(jobid);
    if (company == true) {
      throw new BadRequestException(
        'Cannot apply on this Job. Company is blocked',
      );
    }
    // else if (company == false) {
    const application = await this.CandApplicationModel.findOne({
      job: jobid,
      candidate: id,
    }).populate({
      path: 'candidate',
      match: { _id: id },
      select: 'email',
    });
    if (!application) {
      return {
        // application: { id: null },
        success: false,
      };
    }

    return {
      application,
      success: true,
    };
    // }
  }
}
