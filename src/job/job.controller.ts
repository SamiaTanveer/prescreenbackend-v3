import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
  Query,
  InternalServerErrorException,
  SetMetadata,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CandidateApplicationService } from 'src/candidate-application/candidate-application.service';
import { AuthReq, jobReminderData } from 'src/types';
import { scheduleJob } from 'node-schedule';
import {
  JobAnalyticsResponse,
  RandomUserApplyJobDto,
  allApplicationsOfCompanyDto,
  applicationListingCompanyDto,
  jobResponse,
  jobsListingCompanyDto,
  jobsListingDto,
  paginationDto,
  singleJobResponse,
  updateCompanyJob,
  userAppliesDto,
} from 'src/utils/classes';
import { RejectDto } from 'src/utils/classes';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import {
  checkUser,
  getNormalDate,
  getupdatedFeaturesAllowed,
} from 'src/utils/funtions';
import { CandidateGuard } from 'src/auth/jwt.candidate.guard';
import { UserService } from 'src/user/user.service';
import { CandidateService } from 'src/candidate/candidate.service';
import * as moment from 'moment';
import { MailingService } from 'src/mailing/mailing.service';
import { CompanyTeamGuard } from 'src/auth/jwt.team.guard';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/auth/jwt.admin.guard';

@ApiTags('Company Job Module')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('api/jobs')
export class JobController {
  constructor(
    private readonly restrictionsService: SubPlanRestrictionsService,
    private candidateApplicationService: CandidateApplicationService,
    private readonly jobService: JobService,
    private readonly userService: UserService,
    private readonly candidateService: CandidateService,
    private readonly mailingService: MailingService,
    // private eventsGateway: EventsGateway,
  ) {
    // Runs every day at 12 AM
    scheduleJob('00 00 * * *', async () => {
      try {
        const currentTime = new Date();
        console.log('Running cron job at', currentTime);

        // Find plans expiring within the next 5, 3, and 1 days
        const reminderDate1 = moment(currentTime).subtract(5, 'days').toDate();
        const reminderDate2 = moment(currentTime).subtract(3, 'days').toDate();
        const reminderDate3 = moment(currentTime).subtract(1, 'days').toDate();

        const reminder1 = await this.jobService.jobReminder(reminderDate1);
        const reminder2 = await this.jobService.jobReminder(reminderDate2);
        const reminder3 = await this.jobService.jobReminder(reminderDate3);

        if (reminder1) {
          for (const job of reminder1) {
            const readableDate = getNormalDate(job.applicationDeadline as Date);

            const reminderData = {
              jobTitle: job.title,
              companyName: job.createdBy.name,
              expiryDate: readableDate,
              email: job.createdBy.email,
            };

            // Send ReminderEmail
            await this.sendJobReminderEmail(reminderData);
            // await this.sendJobReminderEmail(reminderData, Reminder.Reminder1);
          }
        }

        if (reminder2) {
          for (const job of reminder2) {
            const readableDate = getNormalDate(job.applicationDeadline as Date);
            const reminderData = {
              jobTitle: job.title,
              companyName: job.createdBy.name,
              expiryDate: readableDate,
              email: job.createdBy.email,
            };
            await this.sendJobReminderEmail(reminderData);
          }
        }

        if (reminder3) {
          for (const job of reminder3) {
            const readableDate = getNormalDate(job.applicationDeadline as Date);
            const reminderData = {
              jobTitle: job.title,
              companyName: job.createdBy.name,
              expiryDate: readableDate,
              email: job.createdBy.email,
            };
            await this.sendJobReminderEmail(reminderData);
          }
        }

        const expiredJobs =
          await this.jobService.findJobsWithExpiredDeadlines(currentTime);
        // console.log('Expired jobs:', expiredJobs);

        for (const job of expiredJobs) {
          await this.jobService.closeJob(job.id);
          // console.log('Job status updated:', updatedJob);
        }
      } catch (error) {
        console.error(
          'An error occurred during manual cron job execution:',
          error,
        );
        throw error;
      }
    });
  }

  public async sendJobReminderEmail(reminderData: jobReminderData) {
    try {
      const isEmailSent =
        await this.mailingService.sendJobReminder(reminderData);
      if (!isEmailSent) {
        console.log('JobReminderEmail not sent');
      } else {
        console.log('JobReminderEmail Sent');
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('create-job')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'jobs_write')
  async create(@Body() dto: CreateJobDto, @Req() req: AuthReq) {
    const userid = checkUser(req.user.userType, req.user.company, req.user.id);
    dto.createdBy = userid;
    dto.updatedBy = req.user.id;
    dto.jobStatus = 'open';

    // Check either company is active
    const company = await this.userService.checkCompany(userid);
    console.log('company', company);
    if (company == true) {
      throw new BadRequestException(
        'Cannot create this Job. Company is not currently active.',
      );
    }

    // Check limit
    const feature = await this.restrictionsService.checkFeaturesUsed(
      userid,
      'jobs',
      {},
      dto,
      {},
      {},
    );

    const job = await this.jobService.create(dto);
    // console.log('feature>>>', feature);

    const generalCount = getupdatedFeaturesAllowed('jobs', feature);

    // Update jobs used
    await this.restrictionsService.updateFeatures(req.user.id, {
      featuresUsed: { jobsUsed: generalCount },
    });

    // Notify admin about the new job
    // const newJob = {
    //   // jobId: job._id,
    //   message: `A new job ${job.title} has been created by ${job.createdBy.name}`,
    // };

    // this.eventsGateway.sendNewJobNotificationToAdmin();
    return job;
  }

  // home screen all jobs listing
  // @Get('all')
  // @ApiOperation({
  //   summary:
  //     'Find Jobs (Home Screen)--- Get all jobs of all companies or paginate them (Home Screen API)',
  //   description: 'Returns all jobs of all companies',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Return the jobs',
  //   type: jobResponse,
  // })
  // async findAllJobs(@Query() query: jobsListingDto) {
  //   return await this.jobService.findAllJobsForHomeScreen(query);
  // }

  // ****************************** in use *************************
  // Jobs Listing at Home, Candidate Dashboard
  @Get('allJobsForCandidate')
  @ApiOperation({
    summary: 'Find Jobs (Candidates Screen) --- Get all jobs of all companies',
    description: 'Returns all jobs of all companies',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the jobs',
    type: jobResponse,
  })
  async allJobsForCandidate(@Query() query: jobsListingDto) {
    return await this.jobService.findAllJobsForHomeScreen(query);
  }

  // admin side listing jobs of all companies
  @Get('allJobs')
  @ApiOperation({
    summary: 'Get all jobs of all companies(admin side listing)',
    description: 'Get all jobs, or get based on jobStatus and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the jobs',
    type: jobResponse,
  })
  @UseGuards(AuthGuard())
  findAllJobsByCompanyForAdmin(@Query() query: jobsListingDto) {
    return this.jobService.findAllJobsForAdmin(query);
  }

  // company side job listing
  @Get('byCompany')
  @ApiOperation({
    summary: 'Get all jobs of a company',
    description:
      'Get all jobs of a company, or get based on jobStatus, jobStatus and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the jobs',
    type: jobResponse,
  })
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'jobs_write')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  findAllJobsByCompany(
    @Req() req: AuthReq,
    @Query() query: jobsListingCompanyDto,
  ) {
    const userid = checkUser(req.user.userType, req.user.company, req.user.id);
    return this.jobService.findAllJobsByCompany(userid, query);
  }

  @Get('individualCompany/:userId')
  @ApiOperation({
    summary: 'Get all jobs of a company for superAdmin',
    description:
      'Get all jobs of a company, or get based on jobStatus, jobStatus and pagination',
  })
  @UseGuards(AuthGuard(), AdminGuard)
  findindividualCompany(
    @Param('userId') userId: string,
    @Query() query: jobsListingCompanyDto,
  ) {
    return this.jobService.findAllJobsByCompany(userId, query);
  }

  // ------------IN USE-----------
  @Get('companyStatistics')
  @ApiOperation({
    summary: 'Super Dashboard: analytics for superAdmin dashboard',
  })
  @ApiOperation({ summary: 'super dashboard, analytics' })
  // @UseGuards(AuthGuard(), CompanyTeamGuard)
  @UseGuards(AuthGuard())
  async companyAnlytics(@Req() req: AuthReq) {
    const userid = checkUser(req.user.userType, req.user.company, req.user.id);
    // return await this.jobService.companyStatistics(userid);
  }

  @Get('allJobsApplications')
  @ApiOperation({
    summary: 'Get all jobs applications or paginate them',
    description: 'Returns all jobs applications',
  })
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  findAllApplications(
    @Req() req: AuthReq,
    @Query() query: allApplicationsOfCompanyDto,
  ) {
    // console.log('userid in allApplicationsAllJobs...', req.user);
    const userid = checkUser(req.user.userType, req.user.company, req.user.id);
    return this.jobService.findAllAppSingleCompany(userid, query);
  }

  // company side single job application listing
  @Get('allApplicationsByJob/:jobId')
  @ApiOperation({
    summary: 'Get all applications of a single job',
    description:
      'Get all applications of a job, or get based on applicant name, score, hiring stage, applied date and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the jobs',
    type: jobResponse,
  })
  // @UseGuards(AuthGuard())
  findAllApplicationsByJob(
    @Req() req: AuthReq,
    @Param('jobId') jobId: string,
    @Query()
    query: applicationListingCompanyDto,
  ) {
    const userid = checkUser(req.user.userType, req.user.company, req.user.id);
    return this.candidateApplicationService.findByJob(userid, jobId, query);
  }

  @Get('singleJob/:jobId')
  @ApiOperation({
    summary: 'Job Descriptions: get single job description details',
  })
  async singleJob(@Param('jobId') jobId: string) {
    return await this.jobService.findById(jobId);
  }

  @Get('recentJobs/:userId')
  @ApiOperation({
    summary:
      'Company Profile (Static)----> Overview: Get recent jobs of a company on overwiew(Home Screen)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the recent posted jobs of a Company',
    type: [jobResponse],
  })
  @UseGuards(AuthGuard())
  async recentJobs(
    @Param('userId') userId: string,
    @Query() query: paginationDto,
  ) {
    return await this.jobService.recentJobs(userId, query);
  }

  @Get('similarJobs/:jobId')
  @ApiOperation({
    summary: 'Job Descriptions: get similar jobs',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the recent posted jobs of a Company',
    type: [jobResponse],
  })
  async similarJobs(
    @Param('jobId') jobId: string,
    @Query() query: paginationDto,
  ) {
    return await this.jobService.similarJobs(jobId, query);
  }

  @Get('analytics/jobStatus')
  @UseGuards(AuthGuard())
  @ApiResponse({
    description: 'Array of jobStatus counts',
    status: 200,
    type: JobAnalyticsResponse,
  })
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  // @SetMetadata('permission', 'jobs_read')
  async getJobAnalytics(@Req() req: AuthReq) {
    const userid = checkUser(req.user.userType, req.user.company, req.user.id);
    return await this.jobService.getJobAna(userid);
  }

  @Get('analytics/:statusField')
  @ApiResponse({
    description: 'Details of jobs based on statusField of job',
    status: 200,
    type: JobAnalyticsResponse,
  })
  @UseGuards(AuthGuard())
  async getJobAnalyticsDetail(
    @Req() req: AuthReq,
    @Param('statusField') statusField: string,
  ) {
    return await this.jobService.getJobDetailsByStatus(
      req.user.id,
      statusField,
    );
  }

  //  ******************** IN USE *********************
  @Get('companyAnalytics')
  @ApiOperation({
    summary:
      'Company Dashboard.....Get the company analytics for its dashboard',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  companyAnalytics(@Req() req: AuthReq) {
    const userid = checkUser(req.user.userType, req.user.company, req.user.id);
    return this.jobService.companyAnalytic(userid);
    // return this.jobService.companyAnalytics(req.user.id, 'Last 7 days');
  }

  @Get(':id')
  @ApiResponse({
    description: 'Details of jobs based on statusField of job',
    status: 200,
    type: singleJobResponse,
  })
  // @UseGuards(AuthGuard())
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  @Patch('updateJob/:id')
  @ApiOperation({
    summary: 'Update job by id',
  })
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'jobs_update')
  @ApiOkResponse({ type: updateCompanyJob })
  update(@Param('id') id: string, @Body() dto: updateCompanyJob) {
    return this.jobService.update(id, dto);
  }

  // ******************** in use *************************
  @Patch(':id')
  @ApiOperation({ summary: 'Approve a job' })
  @ApiResponse({
    description: 'Details of a single job',
    status: 200,
    type: singleJobResponse,
  })
  @UseGuards(AuthGuard(), AdminGuard)
  ApproveJob(@Param('id') id: string) {
    return this.jobService.approveJob(id);
  }

  @Patch('applications/reject')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'candidate_applications_update')
  rejectApplication(@Body() dto: RejectDto) {
    return this.jobService.rejectApplication(dto);
  }

  @Post('applications/:jobid/RandomUserApplyJob')
  @ApiOperation({ summary: 'Apply Popup --- apply with/without login' })
  @ApiResponse({
    status: 200,
    type: RandomUserApplyJobDto,
  })
  async makeUserApply(
    @Body() dto: userAppliesDto,
    @Param('jobid') jobid: string,
  ) {
    // console.log('user given info for apply.....', dto);

    const { email } = dto;
    dto.isSocialLogin = false;
    dto.userType = 'candidate';
    // first check if we have email in user collection
    const isUserPresent = await this.userService.findByEmail(email);
    console.log('user.....', isUserPresent.user);
    if (isUserPresent.user) {
      // now check for password, if password is there then it means that user is OUR registered user
      const isRegisteredUser =
        isUserPresent.user?.password != '' ? true : false;

      console.log('is registered user or not...', isRegisteredUser);

      if (isRegisteredUser === true) {
        // first check if he already applied for this job
        // find application based on userid and jobid
        const applicationFound =
          await this.candidateApplicationService.findByUserEmail(
            jobid,
            isUserPresent.user?.id,
          );
        // console.log('applicationFound', applicationFound);
        if (applicationFound.success == true && applicationFound.application) {
          throw new BadRequestException(
            'It looks like you have already applied for this job',
          );
        } else if (applicationFound.success == false) {
          const applicationCreated =
            await this.candidateApplicationService.create(
              isUserPresent.user?.id,
              jobid,
              {
                previousJobTitle: dto.previousJobTitle,
                addInfo: dto.addInfo,
              },
            );
          console.log('Registered User: created application.');

          await this.jobService.updateApplicants(
            applicationCreated.application.id,
            jobid,
          );
          return applicationCreated;
        }
        // create the candidate application to apply for job
      } else if (isRegisteredUser == false) {
        console.log(
          'user is there but no password, mean no registered user still...',
          isRegisteredUser,
        );
        // first check if he already applied for this job
        // find application based on userid and jobid
        const applicationFound =
          await this.candidateApplicationService.findByUserEmail(
            jobid,
            isUserPresent.user?.id,
          );
        if (applicationFound.success == true && applicationFound.application) {
          throw new BadRequestException(
            'It looks like you have already applied for this job!!.....',
          );
        } else {
          console.log('if not, then apply for job');
          // means that we have a user but he is not registered yet
          // update the user model, candidate model and make a candidate application for this job
          // now update user model
          const userUpdated = await this.userService.updateUser(
            isUserPresent.user?.id,
            dto,
          );

          // now update candidate dto
          // console.log(isUserPresent.user.candidate.id);
          const candidateUpdated = await this.candidateService.update(
            isUserPresent.user?.candidate?._id?.toHexString(),
            dto,
          );

          // now create another application of user
          const applicationCreated =
            await this.candidateApplicationService.create(
              isUserPresent.user?.id,
              jobid,
              {
                previousJobTitle: dto.previousJobTitle,
                addInfo: dto.addInfo,
              },
            );

          const updateApplicants = await this.jobService.updateApplicants(
            applicationCreated.application.id,
            jobid,
          );

          return applicationCreated;
        }
      }
    } else {
      // if all checks have failed then it means we have a new random user
      // now create candidate model, user model and make a candidate application for user
      // create candidate model
      const candidateCreated =
        await this.candidateService.createRandomCandidate(dto);

      const { id } = candidateCreated;
      dto.candidate = id;
      dto.password = '';
      // create user model with candidate id
      const userCreated = await this.userService.createRandomUser(dto);

      const userId = userCreated.id;
      candidateCreated.createdBy = userId;
      await candidateCreated.save();

      // now create the candidate application(jobid, candidateid)
      const applicationCreated = await this.candidateApplicationService.create(
        userId,
        jobid,
        {
          previousJobTitle: dto.previousJobTitle,
          addInfo: dto.addInfo,
        },
      );

      const applicationId = applicationCreated.application.id;
      console.log('application id:... ', applicationId, '  jobid ', jobid);
      const updateApplicants = await this.jobService.updateApplicants(
        applicationId,
        jobid,
      );

      return applicationCreated;
    }
  }

  @Patch('applications/alreadyApplied/:jobid')
  @UseGuards(AuthGuard(), CandidateGuard)
  async checkAlreadyApplied(
    @Param('jobid') jobid: string,
    @Req() req: AuthReq,
  ) {
    const jobFound = await this.jobService.findOne(jobid);

    if (jobFound.jobStatus == 'closed') {
      throw new BadRequestException('This job is closed');
    }

    const userId = req.user.id;

    // find application based on userid and jobid
    const applicationFound =
      await this.candidateApplicationService.findByUserEmail(jobid, userId);

    // check if user has already applied
    // const isApplied = jobFound.applications.some((appId) => {
    //   const dbId = appId?.id.toString();
    //   // return applicationFound.id === dbId;
    // });

    // console.log('.........', applicationFound);

    if (applicationFound.application) {
      throw new BadRequestException(
        'It looks like you have already applied for this job!',
      );
    }
    return true;
  }

  @Patch('applications/:job')
  @UseGuards(AuthGuard(), CandidateGuard)
  async updateApplicants(@Req() req: AuthReq, @Param('job') job: string) {
    const jobFound = await this.jobService.findOne(job);

    if (jobFound.jobStatus == 'closed') {
      throw new BadRequestException('This job is closed');
    }
    // console.log('jobFound', jobFound);
    const userId = req.user.id;

    // check if user has already applied
    // find application based on userid
    // const applicationFound =
    //   await this.candidateApplicationService.findByUserEmail(job, userId);

    // const isApplied = jobFound.applications.some((appId) => {
    //   const dbId = appId?.id.toString();
    //   return applicationFound.id === dbId;
    // });
    // if (isApplied) {
    //   throw new BadRequestException(
    //     'It looks like you have already applied for this job',
    //   );
    // }
    // create Application only if job is open
    // call service of create-application
    const Application = await this.candidateApplicationService.create(
      userId,
      job,
    );

    const applicationId = Application.application.id;
    const updateApplicants = this.jobService.updateApplicants(
      applicationId,
      job,
    );
    return updateApplicants;
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'jobs_del')
  remove(@Param('id') id: string) {
    return this.jobService.remove(id);
  }
}
