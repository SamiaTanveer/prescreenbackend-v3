import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Req,
  Delete,
  UseGuards,
  Query,
  SetMetadata,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ExamResponseCompoDto, ExamResponseCustomDto } from './dto/exam.dto';
import { AuthReq } from 'src/types';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import {
  CompanyAssessmentPaginationDto,
  ExamResponsePagination,
  SingleExamRes,
} from 'src/utils/classes';
import { CompanyTeamGuard } from 'src/auth/jwt.team.guard';
import { checkUser, getupdatedFeaturesAllowed } from 'src/utils/funtions';
import { CompanyAssessmentService } from './companyAssessment.service';
import { CreateCompanyAssessmentDto } from './dto/create-company-assessment.dto';
import { UpdateComAssessmentDto } from './dto/update-com-assessment.dto';

@ApiTags('Company Assessment')
@Controller('/api')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
export class CompanyAssessmentController {
  constructor(
    private readonly companyAssessmentService: CompanyAssessmentService,
    // private readonly mcqService: McqService,
    // private readonly questionService: CodingQuestionsService,
    private readonly restrictionsService: SubPlanRestrictionsService,
  ) {}

  @Post('/create-company-assessment')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'company_assessment_write')
  @ApiOperation({ summary: 'Creates a company assessment' })
  @ApiResponse({
    status: 201,
    description: 'Created Company Assessment',
    type: CreateCompanyAssessmentDto,
  })
  async create(@Body() dto: CreateCompanyAssessmentDto, @Req() req: AuthReq) {
    const { id, userType } = req.user;

    const userid = checkUser(userType, req.user.company, req.user.id);

    // Check limit
    const feature = await this.restrictionsService.checkFeaturesUsed(
      userid,
      'assessments',
      {},
      {},
      dto,
      {},
    );

    const companyAssessment = this.companyAssessmentService.create(id, dto);

    const generalCount = getupdatedFeaturesAllowed('assessments', feature);

    // Update jobs used
    await this.restrictionsService.updateFeatures(req.user.id, {
      featuresUsed: { jobsUsed: generalCount },
    });

    return companyAssessment;
  }

  // TODO:add total candidates, not started candidates, inprogress
  @Get('/company-assessments')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'company_assessment_read')
  @ApiOperation({
    description:
      'Get all assessments according to subscription plan or paginate them',
  })
  @ApiResponse({
    status: 200,
    type: ExamResponsePagination,
  })
  async findAll(
    @Req() req: AuthReq,
    @Query() query: CompanyAssessmentPaginationDto,
  ) {
    const { id } = req.user;
    return this.companyAssessmentService.findAll(id, query);
    // if its superadmin, let him go
    // if (userType === 'superAdmin') {
    //   return this.companyAssessmentService.findAll(query);
    //   // return this.companyAssessmentService.findByCompany(req.user.id, query);

    //   // if (query.page && query.limit && query.title) {
    //   //   const { page, limit, title } = query;
    //   //   return this.companyAssessmentService.findByCompany(req.user.id, page, limit, title);
    //   // } else {
    //   //   return this.companyAssessmentService.findByCompany(req.user.id);
    //   // }
    // }
    // check for usertype to send company id or userid(if company)
    // const userid = checkUser(userType, req.user.company, req.user.id);
    // //  Check Permission for examBank
    // const exams = await this.restrictionsService.checkFeaturesAllowed(
    //   userid,
    //   'exams',
    // );
    // // console.log('exams true or false...', exams);
    // if (exams == true) {
    //   return this.companyAssessmentService.findCompanyGeneral(req.user.id, query);
    //   // if (query.page && query.limit && query.title) {
    //   //   const { page, limit, title } = query;
    //   //   return this.companyAssessmentService.findAll(page, limit, title);
    //   // } else {
    //   //   return this.companyAssessmentService.findAll();
    //   // }
    // } else if (exams == false) {
    //   return this.companyAssessmentService.findByCompany(req.user.id, query);
    //   // if (query.page && query.limit && query.title) {
    //   //   const { page, limit, title } = query;
    //   //   return this.companyAssessmentService.findByCompany(req.user.id, page, limit, title);
    //   // } else {
    //   //   return this.companyAssessmentService.findByCompany(req.user.id);
    //   // }
    // }
  }
  @Get('/company-assessmentsForJobPosts')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @ApiOperation({
    description:
      'Get all assessments according to subscription plan or paginate them',
  })
  @ApiResponse({
    status: 200,
    type: [SingleExamRes],
  })
  async findAllForJobsPost(@Req() req: AuthReq) {
    const userid = req.user.id;
    return this.companyAssessmentService.findAllForJobPost(userid);
    // if its superadmin, let him go
    // if (userType === 'superAdmin') {
    //   return this.companyAssessmentService.findAll(query);
    //   // return this.companyAssessmentService.findByCompany(req.user.id, query);

    //   // if (query.page && query.limit && query.title) {
    //   //   const { page, limit, title } = query;
    //   //   return this.companyAssessmentService.findByCompany(req.user.id, page, limit, title);
    //   // } else {
    //   //   return this.companyAssessmentService.findByCompany(req.user.id);
    //   // }
    // }
    // check for usertype to send company id or userid(if company)
    // const userid = checkUser(userType, req.user.company, req.user.id);
    // //  Check Permission for examBank
    // const exams = await this.restrictionsService.checkFeaturesAllowed(
    //   userid,
    //   'exams',
    // );
    // // console.log('exams true or false...', exams);
    // if (exams == true) {
    //   return this.companyAssessmentService.findCompanyGeneral(req.user.id, query);
    //   // if (query.page && query.limit && query.title) {
    //   //   const { page, limit, title } = query;
    //   //   return this.companyAssessmentService.findAll(page, limit, title);
    //   // } else {
    //   //   return this.companyAssessmentService.findAll();
    //   // }
    // } else if (exams == false) {
    //   return this.companyAssessmentService.findByCompany(req.user.id, query);
    //   // if (query.page && query.limit && query.title) {
    //   //   const { page, limit, title } = query;
    //   //   return this.companyAssessmentService.findByCompany(req.user.id, page, limit, title);
    //   // } else {
    //   //   return this.companyAssessmentService.findByCompany(req.user.id);
    //   // }
    // }
  }

  // @Get('studentAssessmentsByExam/:assessmentId')
  // @UseGuards(AuthGuard())
  // @ApiOperation({
  //   summary: 'Get all assessments of a company assessment or paginate them',
  //   description: 'Returns all student assessments of a company assessment',
  // })
  // @ApiOkResponse({
  //   // type: [CreateCandidateAssessmentDto],
  // })
  // async getAssessmentsByExamId(
  //   @Param('assessmentId') assessmentId: string,
  //   @Query() query: paginationDto,
  // ) {
  //   if (query.page && query.limit) {
  //     const { page, limit } = query;
  //     return this.companyAssessmentService.findByExamId(
  //       assessmentId,
  //       page,
  //       limit,
  //     );
  //   }
  // }

  // @Get('examForCandidate/:examId')
  // @UseGuards(AuthGuard())
  // @ApiOperation({ summary: 'Get Exam By ID' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Returns an Exam',
  //   type: ExamDto,
  // })
  // findOneForCandidate(@Param('examId') id: string) {
  //   return this.companyAssessmentService.findOne(id);
  // }

  // TODO: used by candidate, company
  @Get('company-assessment/:comAssessmentId')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'company_assessment_read')
  @ApiOperation({ summary: 'Get company assessment By ID' })
  @ApiExtraModels(ExamResponseCompoDto, ExamResponseCustomDto)
  @ApiOkResponse({
    schema: {
      anyOf: refs(ExamResponseCompoDto, ExamResponseCustomDto),
    },
  })
  findOne(@Param('comAssessmentId') comAssessmentId: string) {
    return this.companyAssessmentService.findOneWithTestsPopulate(
      comAssessmentId,
    );
  }

  @Put('company-assessment/:id')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'company_assessment_update')
  @ApiOperation({ summary: 'Edits the Assessment' })
  @ApiExtraModels(ExamResponseCompoDto, ExamResponseCustomDto)
  @ApiOkResponse({
    schema: {
      anyOf: refs(ExamResponseCompoDto, ExamResponseCustomDto),
    },
  })
  update(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() dto: UpdateComAssessmentDto,
  ) {
    return this.companyAssessmentService.update(id, req.user.id, dto);
  }

  @Delete('company-assessment/:id')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'company_assessment_del')
  @ApiOperation({ summary: 'Deletes a company assessment by its id' })
  remove(@Param('id') id: string, @Req() req: AuthReq) {
    return this.companyAssessmentService.remove(id, req.user.id);
  }
}
