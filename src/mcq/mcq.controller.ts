import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Put,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { McqService } from './mcq.service';
import { CreateMCQDto, MCQDtoResponse } from './dto/create-mcq.dto';
import { UpdateMcqDto } from './dto/update-mcq.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  McqPaginationDto,
  QuestAdminPaginationDto,
  QuestPaginationDto,
  ResponseCodingQuestionsDto,
  ResponseMCQDto,
  ResponseManualQuestsDto,
  ResponseMcqsQuestionsDto,
  paginationDto,
} from 'src/utils/classes';
import { MCQSearchDto } from './dto/searchMcq.dto';
import { MCQ } from './entities/mcq.entity';
import { AuthReq } from 'src/types';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import { CompanyTeamGuard } from 'src/auth/jwt.team.guard';
import { checkUser } from 'src/utils/funtions';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { CodingQuestionsService } from 'src/coding-question/coding-question.service';
import mongoose from 'mongoose';

@ApiTags('MCQ API')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('/api')
export class McqController {
  constructor(
    private readonly mcqService: McqService,
    private readonly codingService: CodingQuestionsService,
    private readonly restrictionsService: SubPlanRestrictionsService,
  ) {}
  // FIXME: Not in use
  @Post('mcq/randomQ')
  @UseGuards(AuthGuard())
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tag: {
          type: 'string',
        },
        language: {
          type: 'string',
        },
        size: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
      },
    },
  })
  async getRandomQ(
    @Req() req: AuthReq,
    @Body()
    dto: {
      tag: string;
      language: string;
      size: number[];
    },
  ) {
    const { language, tag, size } = dto;
    if (!language) {
      throw new BadRequestException('Language is required');
    }

    // Check permission for mcqsBank
    const mcqs = await this.restrictionsService.checkFeaturesAllowed(
      req.user.id,
      'mcqs',
    );

    const objId = new mongoose.Types.ObjectId(req.user.id);
    const tagId = new mongoose.Types.ObjectId(tag);

    if (mcqs == true) {
      return this.mcqService.getQuestionsByDiffTagsCompGen(
        objId,
        language,
        tagId,
        size,
      );
    } else if (mcqs == false) {
      return this.mcqService.getQuestionsByDiffTagsComp(
        objId,
        language,
        tagId,
        size,
      );
    }
  }

  // TODO: subscription plan checks when in use
  // @Get('search-mcqs')
  // @UseGuards(AuthGuard(), CompanyTeamGuard)
  // @SetMetadata('permission', 'Questions_read')
  // async search(@Query() searchDto: MCQSearchDto): Promise<MCQ[]> {
  //   return this.mcqService.searchMCQs(searchDto);
  // }

  // ***************************** in use **************************
  @Post('/create-mcqs')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'Questions_write')
  @ApiOperation({
    summary: 'Create MCQS',
    description: 'Provide array of MCQs',
  })
  @ApiResponse({
    status: 201,
    description: 'Mcqs Created Successfully',
  })
  async create(@Body() dto: CreateMCQDto, @Req() req: AuthReq) {
    const { userType } = req.user;
    // console.log('id', id);

    const id = checkUser(userType, req.user.company, req.user.id);

    // adding CREATED_BY field in mcq DOCUMENT
    dto.createdBy = id;
    dto.updatedBy = req.user.id;

    // Check if userType is superAdmin and set questionType to 'general'
    if (req.user.userType === 'superAdmin') {
      dto.questionType = 'general';
    } else {
      dto.questionType = 'private';
    }

    // mcqsDoc frontend mcqs

    //Check limit
    // const feature = await this.restrictionsService.checkFeaturesUsed(
    //   id,
    //   'mcqs',
    //   mcqDocs,
    //   {},
    //   {},
    // );

    // const generalCount = getupdateQuestions(mcqDocs, feature);
    // console.log('generalCount:', generalCount);

    const newMCQ = await this.mcqService.createMCQ(dto);
    return newMCQ;
    // Update MCQs used
    // await this.restrictionsService.updateFeatures(id, {
    //   featuresUsed: {
    //     mcqUsed: generalCount,
    //   },
    // });

    // if (req.user.userType == 'superAdmin') {
    //   mcqDocs
    // }
  }

  @Get('/mcq-questions')
  @ApiOperation({
    summary: 'Get all MCQS of company or paginate them',
    description: 'Returns all mcqs of a company',
  })
  @ApiResponse({
    status: 200,
    type: ResponseMCQDto,
  })
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'Questions_read')
  async findAll(@Req() req: AuthReq, @Query() query: McqPaginationDto) {
    // Check permission for mcqsBank
    // console.log(req.user);

    const { userType } = req.user;
    // if superadmin, let him go!
    if (userType === 'superAdmin') {
      return this.mcqService.getAllMCQ(query);
      // return this.mcqService.getByCompany(req.user.id, query);
      // } else {
      //   return this.mcqService.getByCompany(req.user.id);
      // }
    }
    const mcqs = await this.restrictionsService.checkFeaturesAllowed(
      req.user.id,
      'mcqs',
    );
    // console.log('is mcqs allowed?....', mcqs);

    if (mcqs == true) {
      return this.mcqService.companyGeneral(req.user.id, query);
    }
    if (mcqs == false) {
      return this.mcqService.getByCompany(req.user.id, query);
    }
  }
  // ********************** in use ****************
  @Get('/all-questions')
  @ApiOperation({
    summary: 'Get all MCQS/Coding Questions of company or paginate them',
    description: 'Returns all mcqs of a company',
  })
  @ApiExtraModels(ResponseCodingQuestionsDto, ResponseMcqsQuestionsDto)
  @ApiOkResponse({
    schema: {
      anyOf: refs(ResponseCodingQuestionsDto, ResponseMcqsQuestionsDto),
    },
  })
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'Questions_read')
  async findAllQuestions(
    @Req() req: AuthReq,
    @Query() query: QuestPaginationDto,
  ) {
    const { userType } = req.user;
    const userid = checkUser(userType, req.user.company, req.user.id);
    // console.log(query);
    // if superadmin, let him go!
    if (userType === 'superAdmin') {
      return this.mcqService.getAllMCQ(query);
      // return this.mcqService.getByCompany(req.user.id, query);
      // } else {
      //   return this.mcqService.getByCompany(req.user.id);
      // }
    }
    // if type is mcq, then check for mcqBank
    if (query.type === 'mcq') {
      const mcqs = await this.restrictionsService.checkFeaturesAllowed(
        userid,
        'mcqs',
      );
      // console.log('is mcqs allowed?....', mcqs);
      if (mcqs == true) {
        return this.mcqService.getMcqs(userid, query, mcqs);
        // return this.mcqService.companyGeneral(req.user.id, query);
      }
      if (mcqs == false) {
        return this.mcqService.getMcqs(userid, query, mcqs);
        // return this.mcqService.getByCompany(req.user.id, query);
      }
    } else if (query.type === 'codingQuestion') {
      // if type is codingQuestion, check for coding bank
      const codings = await this.restrictionsService.checkFeaturesAllowed(
        userid,
        'codingQuestion',
      );
      // console.log('is coding question allowed?....', codings);
      if (codings == true) {
        // return this.codingService.companyGeneralquest(req.user.id, query);
        return this.codingService.getCodingQuestion(userid, query, codings);
      }
      if (codings == false) {
        // return this.codingService.questByCompany(req.user.id, query);
        return this.codingService.getCodingQuestion(userid, query, codings);
      }
    }
  }

  @Get('mcq-questions/generalQuest')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'Questions_read')
  @ApiOperation({
    summary: 'Get general coding questions for paid companies',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all general Coding Questions',
    type: ResponseMCQDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Coding Questions not found',
  })
  async generalQuestions(
    @Req() req: AuthReq,
    @Query() query: McqPaginationDto,
  ) {
    const userid = checkUser(req.user.userType, req.user.company, req.user.id);
    // Check permission for mcqsBank
    const mcqs = await this.restrictionsService.checkFeaturesAllowed(
      userid,
      'mcqs',
    );
    if (mcqs == true) {
      return this.mcqService.generalQuestions(userid, query);
    }
    if (mcqs == false) {
      throw new BadRequestException('You have no access to Question Bank');
    }
  }

  @Get('/mcq-questions/byCompany')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Get mcq-questions by company or paginate them' })
  @ApiResponse({
    status: 200,
    type: CreateMCQDto,
  })
  async find(@Req() req: AuthReq, @Query() query: McqPaginationDto) {
    return this.mcqService.getByCompany(req.user.id, query);
  }

  @Get('/admin-allMcqs')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({ summary: 'show admin mcqs, codings and filter them' })
  @ApiExtraModels(ResponseCodingQuestionsDto, ResponseMcqsQuestionsDto)
  @ApiOkResponse({
    schema: {
      anyOf: refs(ResponseCodingQuestionsDto, ResponseMcqsQuestionsDto),
    },
  })
  async showQuestionsToAdmin(
    @Req() req: AuthReq,
    @Query() query: QuestAdminPaginationDto,
  ) {
    if (query.type === 'mcq') {
      return this.mcqService.getMcqsForAdmin(req.user.id, query);
    } else if (query.type === 'codingQuestion') {
      return this.codingService.getCodingsForAdmin(req.user.id, query);
    }
  }
  // ***************************** in use **************************
  @Get('/mcq-questions/:id')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'Questions_read')
  @ApiResponse({
    status: 200,
    type: MCQDtoResponse,
  })
  async findOne(@Param('id') id: string) {
    return this.mcqService.getById(id);
  }
  // ***************************** in use **************************
  @Post('/mcq-questionsByDifficulty')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'Questions_read')
  @ApiOperation({ summary: 'Get Mcqs By Difficulty' })
  @ApiResponse({
    status: 200,
    description: 'Returns MCQS',
    schema: {
      type: 'object',
      properties: {
        easy: {
          type: 'object',
          properties: {
            id: {
              type: 'array',
              items: { type: 'string' },
            },
            count: {
              type: 'number',
            },
          },
        },
        medium: {
          type: 'object',
          properties: {
            id: {
              type: 'array',
              items: { type: 'string' },
            },
            count: {
              type: 'number',
            },
          },
        },
        hard: {
          type: 'object',
          properties: {
            id: {
              type: 'array',
              items: { type: 'string' },
            },
            count: {
              type: 'number',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'MCQS not found',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tag: {
          type: 'string',
        },
        // tags: {
        //   type: 'array',
        //   items: {
        //     type: 'string',
        //   },
        // },
        language: {
          type: 'string',
        },
      },
    },
  })
  async getQuestionByDifficulty(
    @Req() req: AuthReq,
    @Body() dto: { tag: string; language: string },
  ) {
    const { userType } = req.user;
    const { language, tag } = dto;
    // console.log('get mcq', dto);
    // if its admin then let him go
    if (userType === 'superAdmin') {
      // return this.mcqService.getMcqsByLangTagsComp(req.user.id, language, tags);
      return this.mcqService.getMcqsByLangSingleTagComp(
        req.user.id,
        language,
        tag,
      );
    }
    const userid = checkUser(userType, req.user.company, req.user.id);

    if (!language) {
      throw new BadRequestException('Language is required');
    }
    // Check permission for mcqsBank
    const mcqs = await this.restrictionsService.checkFeaturesAllowed(
      userid,
      'mcqs',
    );

    if (mcqs == true) {
      // return this.mcqService.getQuestionsByLangTags(language, tags);
      // return this.mcqService.getMcqsByLangTagsCompGen(
      return this.mcqService.getMcqsByLangSingleTagCompGen(
        userid,
        language,
        tag,
      );
    } else if (mcqs == false) {
      // return this.mcqService.getMcqsByLangTagsComp(req.user.id, language, tags);
      return this.mcqService.getMcqsByLangSingleTagComp(userid, language, tag);
    }
  }
  // ***************************** in use **************************
  @Post('/mcq-questionsByDifficultyManual')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'Questions_read')
  @ApiOperation({ summary: 'Get Mcqs By Difficulty Manuallly' })
  @ApiResponse({
    status: 200,
    description: 'Returns MCQS',
    type: ResponseManualQuestsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'MCQS not found',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tag: {
          type: 'string',
        },
        // tags: {
        //   type: 'array',
        //   items: {
        //     type: 'string',
        //   },
        // },
        language: {
          type: 'string',
        },
      },
    },
  })
  async getQuestionByDifficultyManual(
    @Req() req: AuthReq,
    @Query() query: paginationDto,
    @Body() dto: { tag: string; language: string },
  ) {
    const { userType } = req.user;
    const { language, tag } = dto;
    const { page, limit } = query;
    // console.log('get mcq', dto);
    // if its admin then let him go
    if (userType === 'superAdmin') {
      // return this.mcqService.getMcqsByLangTagsComp(req.user.id, language, tags);
      return this.mcqService.getMcqsByLangSingleTagCompMan(
        req.user.id,
        language,
        tag,
        { page, limit },
      );
    }
    const userid = checkUser(userType, req.user.company, req.user.id);

    if (!language) {
      throw new BadRequestException('Language is required');
    }
    // Check permission for mcqsBank
    const mcqs = await this.restrictionsService.checkFeaturesAllowed(
      userid,
      'mcqs',
    );

    if (mcqs == true) {
      // return this.mcqService.getQuestionsByLangTags(language, tags);
      // return this.mcqService.getMcqsByLangTagsCompGen(
      return this.mcqService.getMcqsByLangSingleTagCompGenMan(
        userid,
        language,
        tag,
        { page, limit },
      );
    } else if (mcqs == false) {
      // return this.mcqService.getMcqsByLangTagsComp(req.user.id, language, tags);
      return this.mcqService.getMcqsByLangSingleTagCompMan(
        userid,
        language,
        tag,
        { page, limit },
      );
    }
  }
  // ***************************** in use **************************
  @Put('/mcq-questions/:id')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'mcqs_update')
  @ApiResponse({
    status: 200,
    type: CreateMCQDto,
  })
  update(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() updateMcqDto: UpdateMcqDto,
  ) {
    // console.log(updateMcqDto);
    const userId = checkUser(req.user.userType, req.user.company, req.user.id);
    updateMcqDto.updatedBy = req.user.id;
    return this.mcqService.updateMCQ(userId, id, updateMcqDto);
  }
  // ***************************** in use **************************
  @Delete('/mcq-questions/:id')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'mcqs_del')
  async remove(@Param('id') id: string, @Req() req: AuthReq) {
    const userid = checkUser(req.user.userType, req.user.company, req.user.id);
    return this.mcqService.deleteMCQ(id, userid);
  }
}
