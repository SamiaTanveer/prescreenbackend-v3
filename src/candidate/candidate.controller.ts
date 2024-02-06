import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  Query,
  UseGuards,
  Delete,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { CandidateService } from './candidate.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  CandidateAdminAnalytics,
  CandidateObj,
  paginationDto,
} from 'src/utils/classes';
import { AuthGuard } from '@nestjs/passport';
import {
  CandidateInfoUpdate,
  JobSeekingStatusDto,
  Qualifications,
} from './dto/updatecandidate.dto';
import { CandidateGuard } from 'src/auth/jwt.candidate.guard';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { AuthReq } from 'src/types';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ProjectService } from 'src/Projects/project.service';

@ApiTags('Candidates')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('/api')
export class CandidateController {
  constructor(
    private readonly candidateService: CandidateService,
    private readonly projectService: ProjectService,
  ) {}

  @Get('candidates')
  @ApiOperation({
    summary: 'Get all candidates or paginate them',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the Candidates',
    type: [CandidateObj],
  })
  @UseGuards(AuthGuard())
  getAllCandidates(@Query() query: paginationDto) {
    return this.candidateService.findAll(query);
  }

  @Get('candidates/candidatesAnalytics')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({ summary: 'Get all candidates details along analytics' })
  @ApiResponse({
    status: 200,
    description: 'Returns the candidates details along analytics',
    type: [CandidateAdminAnalytics],
  })
  getAdminAnalytics(@Query() query: paginationDto) {
    return this.candidateService.getAdminAnalytics(query);
  }

  @Get('candidates/adminAnalyticsDetails')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({ summary: 'Get details about analytics' })
  adminAnalyticsDetails(@Query() query: paginationDto) {
    return this.candidateService.adminAnalyticsDetails(query);
  }

  @Get('candidates/adminAnalyticsDetails/:candId')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({ summary: 'Get details about analytics' })
  adminAnalyticsDetail(@Param('candId') candId: string) {
    // TODO:
    return this.candidateService.adminAnalyticsDetail(candId);
  }

  @Get('candidates/:id')
  @ApiOperation({ summary: 'Get candidate by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns Candidate by id',
    type: CandidateObj,
  })
  @ApiResponse({
    status: 404,
    description: 'Candidate not found',
  })
  @UseGuards(AuthGuard())
  getCandidateById(@Param('id') id: string) {
    return this.candidateService.findById(id);
  }

  // @Get('candidates/profile/:candId')
  // @ApiOperation({
  //   summary: 'Get the candidate profile by ID',
  //   description:
  //     'Get candidate profile nested in All Applicants of company dashboard',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Candidate not found',
  // })
  // getCompanyProfileById(@Param('candId') candId: string) {
  //   return this.candidateService.getApplicantData(candId);
  // }

  @Get('profile/:idOrApplicationId/:type')
  @ApiOperation({
    summary: 'Get the candidate profile by ID',
    description:
      'Get candidate profile nested in All Applicants of company dashboard',
  })
  getProfileData(
    @Param('idOrApplicationId') idOrApplicationId: string,
    @Param('type') type: 'profile' | 'resume' | 'hiring',
  ) {
    try {
      const data = this.candidateService.getApplicantData(
        idOrApplicationId,
        type,
      );
      return data;
    } catch (error) {
      if (error.status) {
        throw new BadRequestException(error.message);
        // return {
        //   message: error.message,
        //   status: error.status,
        // };
      } else {
        // If it's an unknown exception, return a generic error response
        return {
          message: 'Internal Server Error',
          status: 500,
        };
      }
    }
  }

  @Get('studentProfile/:userId')
  @ApiOperation({
    summary: 'Get the candidate profile by ID',
    description: 'Get candidate profile with its isBlocked status',
  })
  studentProfile(@Param('userId') userId: string) {
    return this.candidateService.studentProfile(userId);
  }

  // ************************** in use  *****************

  @Get('studentPublicProfile')
  @ApiOperation({
    summary: 'Public Profile -- Get the candidate profile by ID',
    description: 'Get candidate profile for Public',
  })
  @UseGuards(AuthGuard(), CandidateGuard)
  studentPublicProfile(@Req() req: AuthReq) {
    return this.candidateService.findById(req.user.candidate);
  }
  // *********************** in use *******************
  @Put('updateCandidateProfile')
  @ApiOperation({ summary: 'Setting My Profile--- Update candidate by ID' })
  @UseGuards(AuthGuard(), CandidateGuard)
  updateCandidate(
    @Req() req: AuthReq,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    return this.candidateService.updateCandidate(
      req.user.candidate,
      updateCandidateDto,
    );
  }

  // @Put('updateLogin')
  // @ApiOperation({
  //   summary:
  //     'Setting---->Login Detail(Candidate Screen)......Update login detail email, password',
  // })
  // @UseGuards(AuthGuard(), CandidateGuard)
  // updateLoginDetail(
  //   @Req() req: AuthReq,
  //   // @Body() updateCandidateDto: UpdateCandidateDto,
  //   @Body() updateLoginDetail: UpdateLoginDetail,
  // ) {
  //   return this.candidateService.updateLoginDetail(
  //     req.user.id,
  //     // '65b0de2abdbc84a57f83f50f',
  //     updateLoginDetail,
  //   );
  // }

  // ********************************* in use ************************
  @Put('profile/updateJobSeekingStatus')
  @ApiOperation({
    summary: '(Candidate side)---Update job seeking status of candidate',
  })
  @UseGuards(AuthGuard(), CandidateGuard)
  async updateJobSeekingStatus(
    @Req() req: AuthReq,
    @Body() dto: JobSeekingStatusDto,
  ) {
    return this.candidateService.updatejobseekingstatus(
      req.user.candidate,
      dto,
    );
  }

  // ********************************* in use ************************
  @Put('profile/:itemId')
  @ApiOperation({
    summary:
      'Student profile(Candidate side)---Update eduationDetails and experiences of candidate',
  })
  @UseGuards(AuthGuard(), CandidateGuard)
  async updateCandidateItem(
    @Req() req: AuthReq,
    @Param('itemId') itemId: string,
    @Body() updateData: Qualifications,
  ) {
    return this.candidateService.updateField(
      req.user.candidate,
      itemId,
      updateData,
    );
  }

  // ************************ in use *********************
  @Put('addprofileData')
  @ApiOperation({
    summary:
      'Student profile(Candidate side)---Add skill, eduationDetails and experiences of candidate',
  })
  @UseGuards(AuthGuard(), CandidateGuard)
  async Addnewskills(@Req() req: AuthReq, @Body() dto: Qualifications) {
    return this.candidateService.AddField(req.user.candidate, dto);
  }

  @Delete('candidate/:fieldType/:itemId')
  @ApiOperation({
    summary: 'Delete skill, eduationDetails and experiences of candidate',
  })
  @UseGuards(AuthGuard(), CandidateGuard)
  async delete(
    @Req() req: AuthReq,
    @Param('itemId') itemId: string,
    @Param('fieldType') fieldType: string,
  ) {
    return this.candidateService.remove(req.user.candidate, itemId, fieldType);
  }

  // @Get('profile/:Id/:type')
  // @ApiOperation({
  //   summary:
  //     "Get the candidate's skill, education or experience object by object ID",
  // })
  // @ApiResponse({
  //   status: 200,
  //   description:
  //     "Returns the candidate's skill, education or experience object",
  // })
  // getSkillById(@Param('Id') Id: string, @Param('type') type: string) {
  //   return this.candidateService.findSkillById(Id, type);
  // }

  // @Delete('/candidates/:id')
  // async deleteCandidate(@Param('id') id: string) {
  //   await this.candidateService.remove(id);
  //   return { message: 'Candidate deleted successfully' };
  // }
}
