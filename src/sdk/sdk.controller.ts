import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  // Delete,
  UseGuards,
  Query,
  Req,
  Response,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SdkService } from './sdk.service';
import { CompanyGuard } from 'src/auth/jwt.company.guard';
import { AuthReq } from 'src/types';
import { CreateSdkDto } from './dto/create-sdk.dto';
import { JwtService } from '@nestjs/jwt';
import { SdkEntity } from './entities/sdk.entity';
import { JobService } from 'src/job/job.service';
import {
  RandomUserApplyJobDto,
  jobsListingDto,
  userAppliesDto,
} from 'src/utils/classes';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { CandidateApplicationService } from 'src/candidate-application/candidate-application.service';
import { CandidateService } from 'src/candidate/candidate.service';

@ApiTags('SDK MODULE')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('api/sdk')
export class SdkController {
  constructor(
    private readonly sdkservice: SdkService,
    private readonly jwtService: JwtService,
    private readonly jobService: JobService,
    private readonly userService: UserService,
    private readonly candidateService: CandidateService,
    private readonly authService: AuthService,
    private readonly candidateApplicationService: CandidateApplicationService,
  ) {}
  // TODO:
  // implement a CRON job to delete the apikeys docs from the db on expiration date

  // ********************************** in use ***************************
  @Post('create-apikey')
  @UseGuards(AuthGuard(), CompanyGuard)
  async createApiKey(@Req() req: AuthReq) {
    const { id, email, userType } = req.user;

    const expiresIn = '3d';
    const expirationDate = new Date(
      Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000,
    );

    // Check if API key already exists
    const docFound = await this.sdkservice.findOneByUserid(id);
    if (docFound) {
      throw new BadRequestException('Sdk key already exists');
    }

    const token = this.jwtService.sign(
      {
        id,
        email,
        userType,
      },
      { secret: 'nosecret', expiresIn },
    );

    const doc = {
      companyUser: id,
      apiKey: token,
      expirationDate,
    };

    const ApiKeyDoc = await this.sdkservice.createkey(doc);
    return ApiKeyDoc.apiKey;
  }

  @Post('getallJobs')
  async getallJobs(
    @Query() query: jobsListingDto,
    @Req() req: AuthReq,
    @Response() res: any,
  ) {
    // console.log('locals...', res.locals.sdkInfo);
    const jobsResult = await this.jobService.findAllJobs(query);
    res.send(jobsResult);
  }
  @Post('getall')
  async getall(
    @Query() query: jobsListingDto,
    @Req() req: AuthReq,
    @Response() res: any,
  ) {
    // console.log('locals...', res.locals.sdkInfo);
    const jobsResult = await this.jobService.findAllJobs(query);
    res.send(jobsResult);
  }

  // random user apply route
  @Post('applications/:jobid/RandomUserApplyJob')
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
    // first check if we have email in user documents
    const isUserPresent = await this.userService.findByEmail(email);
    console.log('user.....', isUserPresent.user);
    if (isUserPresent.user) {
      // now check for password, if password is there then it means that user is our registered user
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
          console.log('if not apply for job');
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
}
