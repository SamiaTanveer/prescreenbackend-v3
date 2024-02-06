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
  BadRequestException,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { McqService } from 'src/mcq/mcq.service';
import { CodingQuestionsService } from 'src/coding-question/coding-question.service';
import { ExamDto } from './dto/exam.dto';
import { AuthReq } from 'src/types';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import { ExamPaginationDto, ExamResponsePagination } from 'src/utils/classes';
import { CompanyTeamGuard } from 'src/auth/jwt.team.guard';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { checkUser } from 'src/utils/funtions';

@ApiTags('Exam')
@Controller('/api')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
export class ExamController {
  constructor(
    private readonly examService: ExamService,
    private readonly mcqService: McqService,
    private readonly questionService: CodingQuestionsService,
    private readonly restrictionsService: SubPlanRestrictionsService,
  ) {}

  @Post('exaam/create-exam')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'exams_write')
  @ApiOperation({ summary: 'Creates an Exam' })
  @ApiResponse({
    status: 201,
    description: 'Created Exam',
    type: CreateExamDto,
  })
  async create(@Body() dto: CreateExamDto, @Req() req: AuthReq) {
    const { id, userType } = req.user;
    const { language, tag } = dto;

    // TODO: check zero quest and mcq
    // if user is super admin, then let him go
    if (userType === 'superAdmin') {
      const Questions: any =
        // await this.questionService.getQuestionsByLangTagsComp(
        await this.questionService.getQuestionsByLangSingleTagComp(
          id,
          language,
          tag,
        );
      // check if coding questions are in range as asked by user
      if (
        Questions.easy.count < dto.codingDifficultyComposition.easy ||
        Questions.medium.count < dto.codingDifficultyComposition.medium ||
        Questions.hard.count < dto.codingDifficultyComposition.hard
      ) {
        throw new BadRequestException(
          'Not enough Coding questions available in one or more difficulty levels',
        );
      }
      // const MCQs: any = await this.mcqService.getMcqsByLangTagsComp(
      const MCQs: any = await this.mcqService.getMcqsByLangSingleTagComp(
        id,
        language,
        tag,
      );

      // check if mcqs are in range as asked by user
      if (
        MCQs.easy.count < dto.mcqDifficultyComposition.easy ||
        MCQs.medium.count < dto.mcqDifficultyComposition.medium ||
        MCQs.hard.count < dto.mcqDifficultyComposition.hard
      ) {
        throw new BadRequestException(
          'Not enough MCQ questions available in one or more difficulty levels.',
        );
      }
      try {
        dto.createdBy = id;

        if (req.user.userType === 'superAdmin') {
          dto.examType = 'general';
        }

        const createdExam = await this.examService.create(dto);
        // console.log('createdExam', createdExam);
        return createdExam;
      } catch (error) {
        if (error.code === 11000 && error.keyPattern.title === 1) {
          throw new BadRequestException(
            'Title already exists. Choose a unique title.',
          );
        }
        throw error;
      }
    }

    // Check permission for codingBank
    const codingQuestion = await this.restrictionsService.checkFeaturesAllowed(
      id,
      'codingQuestion',
    );
    if (codingQuestion == true) {
      const Questions: any =
        // await this.questionService.getQuestionsByLangTagsCompGen(
        await this.questionService.getQuestionsByLangSingleTagComp(
          req.user.id,
          language,
          tag,
        );
      // check if coding questions are in range as asked by user
      if (
        Questions.easy.count < dto.codingDifficultyComposition.easy ||
        Questions.medium.count < dto.codingDifficultyComposition.medium ||
        Questions.hard.count < dto.codingDifficultyComposition.hard
      ) {
        throw new BadRequestException(
          'Not enough Coding questions available in one or more difficulty levels',
        );
      }
    } else if (codingQuestion == false) {
      // const Questions = await this.questionService.getQuestionsByLangTagsComp(
      const Questions =
        await this.questionService.getQuestionsByLangSingleTagComp(
          req.user.id,
          language,
          tag,
        );
      // console.log('Questions', Questions);
      if (
        Questions.easy.count < dto.codingDifficultyComposition.easy ||
        Questions.medium.count < dto.codingDifficultyComposition.medium ||
        Questions.hard.count < dto.codingDifficultyComposition.hard
      ) {
        throw new BadRequestException(
          'Not enough Coding questions available in one or more difficulty levels',
        );
      }
    }

    // Check permission for mcqsBank
    const mcqs = await this.restrictionsService.checkFeaturesAllowed(
      id,
      'mcqs',
    );
    if (mcqs == true) {
      // const MCQs: any = await this.mcqService.getQuestionsByLangTags(
      //   language,
      //   tags,
      // );
      // const MCQs: any = await this.mcqService.getMcqsByLangTagsCompGen(
      const MCQs: any = await this.mcqService.getMcqsByLangSingleTagComp(
        req.user.id,
        language,
        tag,
      );

      // check if mcqs are in range as asked by user
      if (
        MCQs.easy.count < dto.mcqDifficultyComposition.easy ||
        MCQs.medium.count < dto.mcqDifficultyComposition.medium ||
        MCQs.hard.count < dto.mcqDifficultyComposition.hard
      ) {
        throw new BadRequestException(
          'Not enough MCQ questions available in one or more difficulty levels.',
        );
      }
    } else if (mcqs == false) {
      // const MCQs: any = await this.mcqService.getMcqsByLangTagsComp(
      const MCQs: any = await this.mcqService.getMcqsByLangSingleTagComp(
        req.user.id,
        language,
        tag,
      );
      if (
        MCQs.easy.count < dto.mcqDifficultyComposition.easy ||
        MCQs.medium.count < dto.mcqDifficultyComposition.medium ||
        MCQs.hard.count < dto.mcqDifficultyComposition.hard
      ) {
        throw new BadRequestException(
          'Not enough MCQ questions available in one or more difficulty levels.',
        );
      }
    }

    try {
      dto.createdBy = id;

      if (req.user.userType !== 'superAdmin') {
        dto.examType = 'private';
      }

      // TODO
      const createdExam = await this.examService.create(dto);
      return createdExam;
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.title === 1) {
        throw new BadRequestException(
          'Title already exists. Choose a unique title.',
        );
      }
      throw error;
    }
  }

  // @Post('/create-exam')
  // @UseGuards(AuthGuard(), CompanyTeamGuard)
  // @SetMetadata('permission', 'exams_write')
  // @ApiOperation({ summary: 'Creates an Exam' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Created Exam',
  //   type: CreateExamDto,
  // })
  // async create(@Body() dto: CreateExamDto, @Req() req: AuthReq) {
  //   const { id, userType } = req.user;
  //   const { language, tags } = dto;

  //   // TODO: check zero quest and mcq
  //   // if user is super admin, then let him go
  //   if (userType === 'superAdmin') {
  //     const Questions: any =
  //       await this.questionService.getQuestionsByLangTagsComp(
  //         id,
  //         language,
  //         tags,
  //       );
  //     // check if coding questions are in range as asked by user
  //     if (
  //       Questions.easy.count < dto.codingDifficultyComposition.easy ||
  //       Questions.medium.count < dto.codingDifficultyComposition.medium ||
  //       Questions.hard.count < dto.codingDifficultyComposition.hard
  //     ) {
  //       throw new BadRequestException(
  //         'Not enough Coding questions available in one or more difficulty levels',
  //       );
  //     }
  //     const MCQs: any = await this.mcqService.getMcqsByLangTagsComp(
  //       id,
  //       language,
  //       tags,
  //     );

  //     // check if mcqs are in range as asked by user
  //     if (
  //       MCQs.easy.count < dto.mcqDifficultyComposition.easy ||
  //       MCQs.medium.count < dto.mcqDifficultyComposition.medium ||
  //       MCQs.hard.count < dto.mcqDifficultyComposition.hard
  //     ) {
  //       throw new BadRequestException(
  //         'Not enough MCQ questions available in one or more difficulty levels.',
  //       );
  //     }
  //     try {
  //       dto.createdBy = id;

  //       if (req.user.userType === 'superAdmin') {
  //         dto.examType = 'general';
  //       }

  //       const createdExam = await this.examService.create(dto);
  //       // console.log('createdExam', createdExam);
  //       return createdExam;
  //     } catch (error) {
  //       if (error.code === 11000 && error.keyPattern.title === 1) {
  //         throw new BadRequestException(
  //           'Title already exists. Choose a unique title.',
  //         );
  //       }
  //       throw error;
  //     }
  //   }

  //   // Check permission for codingBank
  //   const codingQuestion = await this.restrictionsService.checkFeaturesAllowed(
  //     id,
  //     'codingQuestion',
  //   );
  //   if (codingQuestion == true) {
  //     const Questions: any =
  //       // const Questions: any = await this.questionService.getQuestionsByLangTags(
  //       await this.questionService.getQuestionsByLangTagsCompGen(
  //         req.user.id,
  //         language,
  //         tags,
  //       );
  //     // check if coding questions are in range as asked by user
  //     if (
  //       Questions.easy.count < dto.codingDifficultyComposition.easy ||
  //       Questions.medium.count < dto.codingDifficultyComposition.medium ||
  //       Questions.hard.count < dto.codingDifficultyComposition.hard
  //     ) {
  //       throw new BadRequestException(
  //         'Not enough Coding questions available in one or more difficulty levels',
  //       );
  //     }
  //   } else if (codingQuestion == false) {
  //     const Questions = await this.questionService.getQuestionsByLangTagsComp(
  //       req.user.id,
  //       language,
  //       tags,
  //     );
  //     // console.log('Questions', Questions);
  //     if (
  //       Questions.easy.count < dto.codingDifficultyComposition.easy ||
  //       Questions.medium.count < dto.codingDifficultyComposition.medium ||
  //       Questions.hard.count < dto.codingDifficultyComposition.hard
  //     ) {
  //       throw new BadRequestException(
  //         'Not enough Coding questions available in one or more difficulty levels',
  //       );
  //     }
  //   }

  //   // Check permission for mcqsBank
  //   const mcqs = await this.restrictionsService.checkFeaturesAllowed(
  //     id,
  //     'mcqs',
  //   );
  //   if (mcqs == true) {
  //     // const MCQs: any = await this.mcqService.getQuestionsByLangTags(
  //     //   language,
  //     //   tags,
  //     // );
  //     const MCQs: any = await this.mcqService.getMcqsByLangTagsCompGen(
  //       req.user.id,
  //       language,
  //       tags,
  //     );

  //     // check if mcqs are in range as asked by user
  //     if (
  //       MCQs.easy.count < dto.mcqDifficultyComposition.easy ||
  //       MCQs.medium.count < dto.mcqDifficultyComposition.medium ||
  //       MCQs.hard.count < dto.mcqDifficultyComposition.hard
  //     ) {
  //       throw new BadRequestException(
  //         'Not enough MCQ questions available in one or more difficulty levels.',
  //       );
  //     }
  //   } else if (mcqs == false) {
  //     const MCQs: any = await this.mcqService.getMcqsByLangTagsComp(
  //       req.user.id,
  //       language,
  //       tags,
  //     );
  //     if (
  //       MCQs.easy.count < dto.mcqDifficultyComposition.easy ||
  //       MCQs.medium.count < dto.mcqDifficultyComposition.medium ||
  //       MCQs.hard.count < dto.mcqDifficultyComposition.hard
  //     ) {
  //       throw new BadRequestException(
  //         'Not enough MCQ questions available in one or more difficulty levels.',
  //       );
  //     }
  //   }

  //   try {
  //     dto.createdBy = id;

  //     if (req.user.userType !== 'superAdmin') {
  //       dto.examType = 'private';
  //     }

  //     const createdExam = await this.examService.create(dto);
  //     return createdExam;
  //   } catch (error) {
  //     if (error.code === 11000 && error.keyPattern.title === 1) {
  //       throw new BadRequestException(
  //         'Title already exists. Choose a unique title.',
  //       );
  //     }
  //     throw error;
  //   }
  // }

  @Get('/exams')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'exams_read')
  @ApiOperation({
    description:
      'Get all Exams according to subscription plan or paginate them',
  })
  @ApiResponse({
    status: 200,
    type: ExamResponsePagination,
  })
  async findAll(@Req() req: AuthReq, @Query() query: ExamPaginationDto) {
    const { userType } = req.user;
    // if its superadmin, let him go
    if (userType === 'superAdmin') {
      return this.examService.findAll(query);
      // return this.examService.findByCompany(req.user.id, query);

      // if (query.page && query.limit && query.title) {
      //   const { page, limit, title } = query;
      //   return this.examService.findByCompany(req.user.id, page, limit, title);
      // } else {
      //   return this.examService.findByCompany(req.user.id);
      // }
    }
    // check for usertype to send company id or userid(if company)
    const userid = checkUser(userType, req.user.company, req.user.id);
    //  Check Permission for examBank
    const exams = await this.restrictionsService.checkFeaturesAllowed(
      userid,
      'exams',
    );
    // console.log('exams true or false...', exams);
    if (exams == true) {
      return this.examService.findCompanyGeneral(req.user.id, query);
      // if (query.page && query.limit && query.title) {
      //   const { page, limit, title } = query;
      //   return this.examService.findAll(page, limit, title);
      // } else {
      //   return this.examService.findAll();
      // }
    } else if (exams == false) {
      return this.examService.findByCompany(req.user.id, query);
      // if (query.page && query.limit && query.title) {
      //   const { page, limit, title } = query;
      //   return this.examService.findByCompany(req.user.id, page, limit, title);
      // } else {
      //   return this.examService.findByCompany(req.user.id);
      // }
    }
  }

  @Get('/adminExams')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({
    description: 'Get superAdmin Exams.',
  })
  @ApiResponse({
    status: 200,
    type: ExamResponsePagination,
  })
  async adminExams(@Req() req: AuthReq, @Query() query: ExamPaginationDto) {
    const { userType } = req.user;
    if (userType === 'superAdmin') {
      return this.examService.findByCompany(req.user.id, query);
    }
  }

  @Get('examForCandidate/:examId')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Get Exam By ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns an Exam',
    type: ExamDto,
  })
  findOneForCandidate(@Param('examId') id: string) {
    return this.examService.findOne(id);
  }

  // TODO: used by candidate, company
  @Get('exams/:examId')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'exams_read')
  @ApiOperation({ summary: 'Get Exam By ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns an Exam',
    type: ExamDto,
  })
  findOne(@Param('examId') id: string) {
    return this.examService.findOne(id);
  }

  // @Get('exams/candidate/:id')
  // @UseGuards(AuthGuard())
  // @ApiOperation({ summary: 'Get Exam By ID by candidate' })
  // @ApiExtraModels(ExamCodingQuestion, ExamMcqQuestion)
  // @ApiOkResponse({
  //   schema: { anyOf: refs(ExamCodingQuestion, ExamMcqQuestion) },
  // })
  // findExam(@Param('id') id: string) {
  //   // const userId = req.user.id;
  //   return this.examService.findExam(id);
  // }

  @Put('exams/:id')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'exams_update')
  @ApiOperation({ summary: 'Edits the Exam' })
  @ApiResponse({
    status: 200,
    description: 'Returns an edited Exam',
    type: ExamDto,
  })
  update(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() updateExamDto: UpdateExamDto,
  ) {
    return this.examService.update(id, req.user.id, updateExamDto);
  }

  @Delete('exams/:id')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'exams_del')
  @ApiOperation({ summary: 'Deletes an Exam by its id' })
  remove(@Param('id') id: string, @Req() req: AuthReq) {
    return this.examService.remove(id, req.user.id);
  }
}
