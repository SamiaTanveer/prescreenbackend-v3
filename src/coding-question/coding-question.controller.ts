import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Req,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { CodingQuestionsService } from './coding-question.service';
import { CodingQuestionDto } from './dto/create-coding-question.dto';
import { UpdateCodingQuestionDto } from './dto/update-coding-question.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  CodingPaginationDto,
  ResponseCodingDto,
  ResponseQuestionsManDto,
  paginationDto,
} from 'src/utils/classes';
import { CodingSearchDto } from './dto/searcCodingQuestion.dto';
import { AuthReq } from 'src/types';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import { CompanyTeamGuard } from 'src/auth/jwt.team.guard';
import { checkUser } from 'src/utils/funtions';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import mongoose from 'mongoose';

@ApiTags('Coding Questions')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('/api')
export class CodingQuestionsController {
  constructor(
    private readonly codingQuestionsService: CodingQuestionsService,
    private readonly restrictionsService: SubPlanRestrictionsService,
  ) {}

  // TODO: not in use
  // @Get('search-codingQuestions')
  // @UseGuards(AuthGuard(), CompanyTeamGuard)
  // @SetMetadata('permission', 'Questions_read')
  // async search(
  //   @Query() searchDto: CodingSearchDto,
  // ): Promise<CodingQuestionDto[]> {
  //   return this.codingQuestionsService.searchCodingQuestions(searchDto);
  // }
  // TODO: not in use
  @Post('/randomQ')
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

    // Check permission for codingBank
    const codingQuestion = await this.restrictionsService.checkFeaturesAllowed(
      req.user.id,
      'codingQuestion',
    );

    const objId = new mongoose.Types.ObjectId(req.user.id);
    const tagId = new mongoose.Types.ObjectId(tag);

    if (codingQuestion == true) {
      return this.codingQuestionsService.getQuestionsByDiffTagsCompGen(
        objId,
        language,
        tagId,
        size,
      );
    } else if (codingQuestion == false) {
      return this.codingQuestionsService.getQuestionsByDiffTagsComp(
        objId,
        language,
        tagId,
        size,
      );
    }

    // return this.codingQuestionsService.getQuestionsByDiffTags(
    //   language,
    //   tags,
    //   size,
    // );
  }
  // ******************** in use ******************
  @Post('/coding-questions')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'Questions_write')
  @ApiOperation({ summary: 'Create a Coding Question' })
  @ApiResponse({
    status: 201,
    description: 'Created Coding Question',
    type: CodingQuestionDto,
  })
  async createQuestion(@Body() dto: CodingQuestionDto, @Req() req: AuthReq) {
    const { userType } = req.user;
    const id = checkUser(userType, req.user.company, req.user.id);
    dto.createdBy = id;
    dto.updatedBy = req.user.id;

    // Check if userType is superAdmin and set questionType to 'general'
    if (req.user.userType === 'superAdmin') {
      dto.questionType = 'general';
    } else {
      dto.questionType = 'private';
    }

    // Check limit
    // const feature = await this.restrictionsService.checkFeaturesUsed(
    //   id,
    //   'codingQuestion',
    //   [{}],
    //   dto,
    //   {},
    // );

    // const generalCount = getupdateCodingQuestions(dto, feature);
    // console.log('generalCount', generalCount);

    const newQuestion = await this.codingQuestionsService.createQuestion(dto);

    return newQuestion;
    // Update Coding-question used
    // await this.restrictionsService.updateFeatures(id, {
    //   featuresUsed: {
    //     codingQuestionUsed: generalCount,
    //   },
    // });
  }

  @Get('coding-questions/generalQuest')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @ApiOperation({
    summary: 'Get general coding questions for paid companies',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all general Coding Questions',
    type: [CodingQuestionDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Coding Questions not found',
  })
  async generalQuestions(
    @Req() req: AuthReq,
    @Query() query: CodingPaginationDto,
  ) {
    const userid = checkUser(req.user.userType, req.user.company, req.user.id);
    // Check permission for codingBank
    const codingQuestion = await this.restrictionsService.checkFeaturesAllowed(
      userid,
      'codingQuestion',
    );

    if (codingQuestion == true) {
      console.log('codingQuestion', codingQuestion);
      return this.codingQuestionsService.generalQuestions(userid, query);
    }
    if (codingQuestion == false) {
      throw new BadRequestException('You have no acess to Question Bank');
    }
  }

  @Get('/coding-questions/byCompany')
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: 'Get all coding questions of a company or paginate them',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all Coding Questions of a company',
    type: [CodingQuestionDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Coding Questions not found',
  })
  questionsByCompany(@Req() req: AuthReq, @Query() query: CodingPaginationDto) {
    return this.codingQuestionsService.questByCompany(req.user.id, query);
  }

  @Get('/coding-questions')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'Questions_read')
  @ApiOperation({
    summary:
      'Get all coding questions  according to subscriptionPlan or paginate them',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all Coding Questions',
    type: ResponseCodingDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Coding Questions not found',
  })
  async getAllQuestions(
    @Req() req: AuthReq,
    @Query() query: CodingPaginationDto,
  ) {
    const { userType } = req.user;
    const userid = checkUser(userType, req.user.company, req.user.id);

    if (userType === 'superAdmin') {
      return this.codingQuestionsService.getAllQuestions(query);
      // return this.codingQuestionsService.questByCompany(req.user.id, query);
    }
    // Check permission for codingBank
    const codingQuestion = await this.restrictionsService.checkFeaturesAllowed(
      userid,
      'codingQuestion',
    );
    console.log('is coding question allowed?...', codingQuestion);
    if (codingQuestion == true) {
      // console.log('CQ', codingQuestion);
      return this.codingQuestionsService.companyGeneralquest(
        req.user.id,
        query,
      );
    }
    if (codingQuestion == false) {
      // console.log('CQ', codingQuestion);
      return this.codingQuestionsService.questByCompany(req.user.id, query);
    }
  }

  @Get('/adminCoding-questions')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({ summary: 'Get superAdmin coding questions' })
  @ApiResponse({
    status: 200,
    type: CodingQuestionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Coding Questions not found',
  })
  adminQuestions(@Req() req: AuthReq, @Query() query: CodingPaginationDto) {
    return this.codingQuestionsService.questByCompany(req.user.id, query);
  }

  @Get('/coding-questions/:id')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'Questions_read')
  @ApiOperation({ summary: 'Get coding question By ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a Coding Question',
    type: CodingQuestionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Coding Question not found',
  })
  getQuestionById(@Param('id') id: string) {
    return this.codingQuestionsService.getQuestionById(id);
  }

  @Post('/coding-questionsByDifficulty')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'Questions_read')
  @ApiOperation({ summary: 'Get coding question By Difficulty' })
  @ApiResponse({
    status: 200,
    description: 'Returns Coding Questions',
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
    description: 'questions not found',
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
    // if its admin then let him go
    if (userType === 'superAdmin') {
      // TODO: either show only superAdmin or all?
      // return this.codingQuestionsService.getQuestionsByLangTagsComp(
      return this.codingQuestionsService.getQuestionsByLangSingleTagComp(
        req.user.id,
        language,
        tag,
      );
    }
    // check userid for company or company Teams
    const userId = checkUser(userType, req.user.company, req.user.id);

    if (!language) {
      throw new BadRequestException('Language is required');
    }
    // Check permission for codingBank
    const codingQuestion = await this.restrictionsService.checkFeaturesAllowed(
      userId,
      'codingQuestion',
    );
    if (codingQuestion == true) {
      // return this.codingQuestionsService.getQuestionsByLangTagsCompGen(
      return this.codingQuestionsService.getQuestionsByLangSingleTagCompGen(
        userId,
        language,
        tag,
      );
      // return this.codingQuestionsService.getQuestionsByLangTags(language, tags);
    } else if (codingQuestion == false) {
      // return this.codingQuestionsService.getQuestionsByLangTagsComp(
      return this.codingQuestionsService.getQuestionsByLangSingleTagComp(
        userId,
        language,
        tag,
      );
    }
  }

  @Post('/coding-questionsByDifficultyManual')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'Questions_read')
  @ApiOperation({ summary: 'Get Coding questions By Difficulty Manuallly' })
  @ApiResponse({
    status: 200,
    description: 'Returns Coding questions',
    type: ResponseQuestionsManDto,
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
    console.log('get coding', dto);
    // if its admin then let him go
    if (userType === 'superAdmin') {
      return this.codingQuestionsService.getQuestionsByLangSingleTagCompMan(
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
    const Coding = await this.restrictionsService.checkFeaturesAllowed(
      userid,
      'codingQuestion',
    );

    if (Coding == true) {
      return this.codingQuestionsService.getQuestionsByLangSingleTagCompGenMan(
        userid,
        language,
        tag,
        { page, limit },
      );
    } else if (Coding == false) {
      return this.codingQuestionsService.getQuestionsByLangSingleTagCompMan(
        userid,
        language,
        tag,
        { page, limit },
      );
    }
  }

  @Put('coding-questions/:id')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'codingQuestions_update')
  @ApiOperation({ summary: 'Edits the Coding Question' })
  @ApiResponse({
    status: 200,
    description: 'Returns an edited Coding Question',
    type: CodingQuestionDto,
  })
  async updateQuestion(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() updateCodingQuestionDto: UpdateCodingQuestionDto,
  ) {
    const userId = checkUser(req.user.userType, req.user.company, req.user.id);
    updateCodingQuestionDto.updatedBy = req.user.id;
    return this.codingQuestionsService.updateQuestion(
      userId,
      id,
      updateCodingQuestionDto,
    );
  }

  @Delete('coding-questions/:id')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'codingQuestions_del')
  @ApiOperation({ summary: 'Deletes a Coding Question by its id' })
  async deleteQuestion(@Param('id') id: string, @Req() req: AuthReq) {
    console.log('remoooove');
    return this.codingQuestionsService.deleteQuestion(id, req.user.id);
  }
}
