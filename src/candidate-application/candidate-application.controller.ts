import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { CandidateGuard } from 'src/auth/jwt.candidate.guard';
import { AuthReq } from 'src/types';
import {
  candidateApplicationPaginationDto,
  paginationDto,
} from 'src/utils/classes';
import { CandidateApplicationService } from './candidate-application.service';
import { UpdateCandidateApplicationDto } from './dto/update-candidate-application.dto';
import { CompanyTeamGuard } from 'src/auth/jwt.team.guard';

@ApiTags('Candidate Application')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('api/candidate-application')
export class CandidateApplicationController {
  constructor(
    private readonly candidateApplicationService: CandidateApplicationService,
  ) {}
  // ******************** in use ******************
  @Get('allApplications')
  @ApiOperation({
    summary: 'Get all jobs applications of all companies or paginate them',
    description: 'Returns all jobs applications of all companies',
  })
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'candidate_applications_read')
  findAll(@Query() query: paginationDto) {
    return this.candidateApplicationService.findAll(query);
  }

  // ******************************* in use ****************************************
  // FIXME: testing---specially status (no interviews yet)
  // TODO: set dto
  @Get('candidateAnalytics')
  @ApiOperation({
    summary:
      'Candidate Dashboard----> Get Analytics of candidate about jobs and applications',
  })
  @UseGuards(AuthGuard())
  async candidateAnalytics(@Req() req: AuthReq, @Query() query: paginationDto) {
    return await this.candidateApplicationService.candidateAnalytics(
      req.user.id,
      query,
    );
  }

  // ******************** in use ******************
  // TODO: api for upcoming interviews
  // TODO: set dto
  @Get('recentApplications')
  @ApiOperation({
    summary: 'Candidate Dashboard----> Get recent applications of a candidate',
  })
  @UseGuards(AuthGuard())
  async recentJobs(@Req() req: AuthReq, @Query() query: paginationDto) {
    console.log(req.user.id);
    return await this.candidateApplicationService.recentApplications(
      req.user.id,
      query,
    );
  }

  // ******************** in use ******************
  // (Candidate Screen)
  @Get('candidateApplications')
  @ApiOperation({
    summary:
      'My Applications(Candidate Screen)....Get all jobs applications of a candidate',
    description: 'Returns all jobs applications',
  })
  // @UseGuards(AuthGuard(), CandidateGuard)
  @UseGuards(AuthGuard())
  candidateApplications(
    @Req() req: AuthReq,
    @Query() query: candidateApplicationPaginationDto,
  ) {
    return this.candidateApplicationService.candidateApplications(
      req.user.id,
      query,
    );
  }

  @Get('analytics/StatusesByCandidate/:jobId')
  @ApiOkResponse({
    description: 'Array of application statusByCandidate counts',
    isArray: true,
  })
  async getStatusByCandidate(@Param('jobId') jobId: string) {
    const candidateApplicationAnalytics =
      await this.candidateApplicationService.getStatusByCandidate(jobId);
    return candidateApplicationAnalytics;
  }

  @Get('ByApplication/:id')
  @ApiOperation({
    summary: 'Get all job-applications by application Id',
  })
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'candidate_applications_read')
  findOne(@Param('id') id: string) {
    return this.candidateApplicationService.findOne(id);
  }

  @Get('candidateApplicationCandidateStatus')
  @UseGuards(AuthGuard())
  applicationStats(@Req() req: AuthReq) {
    return this.candidateApplicationService.getCandidateStatusCounts(
      req.user.id,
    );
  }

  @Get('candidateApplicationCompanyStatus')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'candidate_applications_read')
  applicationCompanyStats(@Req() req: AuthReq) {
    return this.candidateApplicationService.getCompanyStatusCounts(req.user.id);
  }

  @Get('ByCandidate')
  @ApiOperation({
    summary: 'Get all job-applications of a particular candidate',
  })
  @UseGuards(AuthGuard(), CandidateGuard)
  findByCandidate(@Req() req: AuthReq, @Query() query: paginationDto) {
    if (query.page && query.limit) {
      const { page, limit } = query;
      return this.candidateApplicationService.findByCandidate(
        req.user.id,
        page,
        limit,
      );
    } else {
      return this.candidateApplicationService.findByCandidate(req.user.id);
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard(), CandidateGuard)
  update(
    @Param('id') id: string,
    @Body() updateCandidateApplicationDto: UpdateCandidateApplicationDto,
  ) {
    return this.candidateApplicationService.update(
      id,
      updateCandidateApplicationDto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'candidate_applications_del')
  remove(@Param('id') id: string) {
    return this.candidateApplicationService.remove(id);
  }
}
