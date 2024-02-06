import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  InternalServerErrorException,
  BadRequestException,
  Req,
  SetMetadata,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InviteService } from './invite.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { MailingService } from 'src/mailing/mailing.service';
import { AuthReq, InviteEmailData } from 'src/types';
import {
  checkUser,
  getNormalDate,
  getupdatedFeaturesAllowed,
} from 'src/utils/funtions';
import { CandidateApplicationService } from 'src/candidate-application/candidate-application.service';
import {
  EnumsCandidate,
  EnumsCompany,
  IdentifierDto,
  identifierResponse,
} from 'src/utils/classes';
import { UserService } from 'src/user/user.service';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import { CompanyTeamGuard } from 'src/auth/jwt.team.guard';
// import { EventsGateway } from 'src/webgateway/events.gateway';

@ApiTags('Exam Invite Module')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('api/invites')
export class InviteController {
  constructor(
    private readonly inviteService: InviteService,
    private readonly mailingService: MailingService,
    private readonly applicationService: CandidateApplicationService,
    private readonly userService: UserService,
    private readonly restrictionsService: SubPlanRestrictionsService,
    // private eventsGateway: EventsGateway,
  ) {}

  // FUNCTION TO SEND EMAIL with assessment link
  public async sendInviteEmail(inviteEmailData: InviteEmailData) {
    try {
      // below is to send email from webmail
      // const isEmailSent =
      //   await this.mailingService.sendInviteMail(inviteEmailData);
      // below is to send email from google
      const isEmailSent =
        await this.mailingService.sendInviteFromGoogle(inviteEmailData);
      // console.log('assessment link....', isEmailSent);
      if (!isEmailSent) {
        console.log('assessment link....', isEmailSent);
      }
      console.log('Invite Email Sent');
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('create-invite')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'examInvites_write')
  async create(@Req() req: AuthReq, @Body() dto: CreateInviteDto) {
    // Check if there is already invited Candidate
    // const inviteFound = await this.inviteService.findByjobEmail(
    //   dto.job,
    //   dto.email,
    // );
    // if (inviteFound) {
    //   throw new BadRequestException('Already Sent invite link');
    // }
    const { userType } = req.user;
    const userid = checkUser(userType, req.user.company, req.user.id);
    try {
      // Check limit
      const feature = await this.restrictionsService.checkFeaturesUsed(
        userid,
        'invites',
        {},
        {},
        {},
        dto,
      );

      const invite = await this.inviteService.create(dto);
      // console.log('invite', invite);
      // console.log('dto:', dto);
      const generalCount = getupdatedFeaturesAllowed('invites', feature);

      // Notify candidate
      // this.eventsGateway.examInviteNotificationToCand();

      // Update assessments used
      await this.restrictionsService.updateFeatures(req.user.id, {
        featuresUsed: { invitesUsed: generalCount },
      });

      // first convert date to normal readable format
      const readableDate = getNormalDate(invite.expiryTime);
      // now after creating invite Doc, send assessment link to email
      const queryParams = new URLSearchParams();
      queryParams.append('identifier', invite.identifier);
      // queryParams.append('identifier', invite.identifier);

      const userFound = await this.userService.findOneUserByemail(dto.email);
      // console.log('userfound?...', userFound);
      // if user find in db, then send link with signin
      if (userFound) {
        userFound.isEmailVerified = true;
        await userFound.save();

        const inviteEmailData = {
          companyName: invite.job.createdBy.name,
          job: dto.job,
          inviteLink: userFound?.password
            ? `${process.env.FRONTEND_URL}/invited-signin?${queryParams} `
            : `${process.env.FRONTEND_URL}/invited-signup?${queryParams}`,
          expiryTime: readableDate,
          email: invite.email,
        };

        // console.log('inviteEmailData', inviteEmailData);
        // console.log(inviteEmailData.inviteLink);

        await this.sendInviteEmail(inviteEmailData);

        // update status by candidate if user found
        const jobEmailObj = { jobid: dto.job, email: dto.email };
        // console.log(jobEmailObj);
        await this.applicationService.updatestatusByCandidate(
          jobEmailObj,
          EnumsCandidate.assessPhase.status,
          EnumsCandidate.assessPhase.message,
        );

        await this.applicationService.updatestatusByCompany(
          jobEmailObj,
          EnumsCompany.assessPhase.status,
          EnumsCompany.assessPhase.message,
        );
      } else if (userFound == false) {
        // if user find in db, then send link with signup(means company is sending test email)
        const inviteEmailData = {
          companyName: invite.job.createdBy.name,
          job: dto.job,
          inviteLink: `${process.env.FRONTEND_URL}/invited-signup?${queryParams}`,
          expiryTime: readableDate,
          email: invite.email,
        };
        await this.sendInviteEmail(inviteEmailData);
      }

      return invite;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // TODO: not in use
  @Get('getAll')
  findAll() {
    return this.inviteService.findAll();
  }

  @Post('checkIdentifier')
  @ApiOkResponse({
    type: identifierResponse,
    description: 'Response of identifier information',
  })
  checkIdentifier(@Body() dto: IdentifierDto) {
    // console.log('dto', dto);
    return this.inviteService.checkIdentifier(dto.identifier);
  }

  // @Get('single-invite/:id')
  // findOne(@Param('id') id: string): Promise<FeedbackForm | null> {
  //   return this.inviteService.findOne(id);
  // }

  // TODO: not in use
  @Patch('update-invite/:id')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @UseGuards(AuthGuard())
  update(@Param('id') id: string, @Body() dto: CreateInviteDto) {
    return this.inviteService.update(id, dto);
  }

  // @Delete('remove-invite/:id')
  // @ApiBearerAuth()
  // @ApiSecurity('JWT-auth')
  // @UseGuards(AuthGuard())
  // remove(@Param('id') id: string) {
  //   return this.inviteService.remove(id);
  // }
}
