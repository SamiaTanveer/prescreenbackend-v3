import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  Query,
  UseGuards,
  Post,
  Req,
  SetMetadata,
  Patch,
  Delete,
  BadRequestException,
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
import {
  CompanyTestPaginationDto,
  TestPaginationDto,
  manualTestResponseDto,
  singleTestsRes,
  testResponseDto,
} from 'src/utils/classes';
import { AuthGuard } from '@nestjs/passport';
import { TestService } from './Test.service';
import { CreateManualTestDto, CreateTestDto } from './dto/CreateTest.dto';
import { AuthReq } from 'src/types';
import { CompanyTeamGuard } from 'src/auth/jwt.team.guard';
import { UpdateTestDto } from './dto/update-Test.dto';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { McqService } from 'src/mcq/mcq.service';
import { CodingQuestionsService } from 'src/coding-question/coding-question.service';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import {
  checkUser,
  getupdatedFeaturesAllowed,
  isValidObjectId,
} from 'src/utils/funtions';

@ApiTags('Tests')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('/api')
export class TestController {
  constructor(
    private readonly testService: TestService,
    private readonly mcqService: McqService,
    private readonly questionService: CodingQuestionsService,
    private readonly restrictionsService: SubPlanRestrictionsService,
  ) {}

  // ************************************ in use *********************************
  @Post('create-Test')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'test_create')
  @ApiOperation({ summary: 'Create a Test' })
  @ApiResponse({
    status: 201,
    description: 'Test Created',
    type: CreateTestDto,
  })
  async CreateTest(@Body() dto: CreateTestDto, @Req() req: AuthReq) {
    const userId = req.user.id;
    const userType = req.user.userType;
    const { language, tag } = dto;

    // if user is super admin, then let him go
    if (userType === 'superAdmin') {
      if (dto.testType == 'Mcq') {
        // const MCQs: any = await this.mcqService.getMcqsByLangTagsComp(
        const MCQs: any = await this.mcqService.getMcqsByLangSingleTagComp(
          userId,
          language,
          tag,
        );

        if (
          dto.compositionEasy &&
          dto.compositionMedium &&
          dto.compositionHard
        ) {
          // check if mcqs are in range as asked by user
          if (
            MCQs.easy.count < dto.compositionEasy ||
            MCQs.medium.count < dto.compositionMedium ||
            MCQs.hard.count < dto.compositionHard
          ) {
            throw new BadRequestException(
              'Not enough MCQ questions available in one or more difficulty levels.',
            );
          }
        }
      } else if (dto.testType == 'codingQuestion') {
        const Questions: any =
          // await this.questionService.getQuestionsByLangTagsComp(
          await this.questionService.getQuestionsByLangSingleTagComp(
            userId,
            language,
            tag,
          );

        if (
          dto.compositionEasy &&
          dto.compositionMedium &&
          dto.compositionHard
        ) {
          // check if coding questions are in range as asked by user
          if (
            Questions.easy.count < dto.compositionEasy ||
            Questions.medium.count < dto.compositionMedium ||
            Questions.hard.count < dto.compositionHard
          ) {
            throw new BadRequestException(
              'Not enough Coding questions available in one or more difficulty levels',
            );
          }
        }
      }

      try {
        const createdTest = await this.testService.create(
          userType,
          userId,
          dto,
        );
        // console.log('createdExam', createdExam);
        return createdTest;
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
      userId,
      'codingQuestion',
    );
    if (dto.testType == 'codingQuestion' && codingQuestion == true) {
      const Questions: any =
        // await this.questionService.getQuestionsByLangTagsCompGen(
        await this.questionService.getQuestionsByLangSingleTagCompGen(
          userId,
          language,
          tag,
        );

      // check if coding questions are in range as asked by user
      if (
        Questions.easy.count < dto.compositionEasy ||
        Questions.medium.count < dto.compositionMedium ||
        Questions.hard.count < dto.compositionHard
      ) {
        throw new BadRequestException(
          'Not enough Coding questions available in one or more difficulty levels',
        );
      }
    } else if (dto.testType == 'codingQuestion' && codingQuestion == false) {
      // const Questions = await this.questionService.getQuestionsByLangTagsComp(
      const Questions =
        await this.questionService.getQuestionsByLangSingleTagComp(
          userId,
          language,
          tag,
        );
      // console.log('Questions', Questions);

      if (
        Questions.easy.count < dto.compositionEasy ||
        Questions.medium.count < dto.compositionMedium ||
        Questions.hard.count < dto.compositionHard
      ) {
        throw new BadRequestException(
          'Not enough Coding questions available in one or more difficulty levels',
        );
      }
    }

    // Check permission for mcqsBank
    const mcqs = await this.restrictionsService.checkFeaturesAllowed(
      userId,
      'mcqs',
    );
    if (dto.testType == 'Mcq' && mcqs == true) {
      // const MCQs: any = await this.mcqService.getMcqsByLangTagsCompGen(
      const MCQs: any = await this.mcqService.getMcqsByLangSingleTagCompGen(
        userId,
        language,
        tag,
      );

      // check if mcqs are in range as asked by user

      if (
        MCQs.easy.count < dto.compositionEasy ||
        MCQs.medium.count < dto.compositionMedium ||
        MCQs.hard.count < dto.compositionHard
      ) {
        throw new BadRequestException(
          'Not enough MCQ questions available in one or more difficulty levels.',
        );
      }
    } else if (dto.testType == 'Mcq' && mcqs == false) {
      // const MCQs: any = await this.mcqService.getMcqsByLangTagsComp(
      const MCQs: any = await this.mcqService.getMcqsByLangSingleTagComp(
        userId,
        language,
        tag,
      );

      if (
        MCQs.easy.count < dto.compositionEasy ||
        MCQs.medium.count < dto.compositionMedium ||
        MCQs.hard.count < dto.compositionHard
      ) {
        throw new BadRequestException(
          'Not enough MCQ questions available in one or more difficulty levels.',
        );
      }
    }

    try {
      // Check limit
      const feature = await this.restrictionsService.checkFeaturesUsed(
        userId,
        'tests',
        dto,
        {},
        {},
        {},
      );

      const createdTest = await this.testService.create(userType, userId, dto);

      // if (feature !== true) {
      const generalCount = getupdatedFeaturesAllowed('tests', feature);

      // Update tests used
      await this.restrictionsService.updateFeatures(req.user.id, {
        featuresUsed: { testsUsed: generalCount },
      });
      // } else if (feature == true) {
      //await this.restrictionsService.updateFeatures(req.user.id, {
      // featuresUsed: { testsUsed: 'noLimit' },
      //});
      //}

      return createdTest;
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.title === 1) {
        throw new BadRequestException(
          'Title already exists. Choose a unique title.',
        );
      }
      throw error;
    }
  }

  // ******************************* in use ********************************
  @Post('createManualTest')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'test_create')
  @ApiOperation({ summary: 'Create a Test' })
  @ApiResponse({
    status: 201,
    description: 'Test Created',
    type: CreateManualTestDto,
  })
  async createManualTest(
    @Body() dto: CreateManualTestDto,
    @Req() req: AuthReq,
  ) {
    const userId = checkUser(req.user.userType, req.user.company, req.user.id);
    const userType = req.user.userType;
    const { customQuestions, testType } = dto;

    // if user is super admin, then let him go
    if (userType === 'superAdmin') {
      try {
        if (testType === 'Mcq') {
          dto.customQuestionsType = 'MCQ';

          // check for the mcq custom questions admin is giving
          const validation = customQuestions.map(async (questionId: string) => {
            const isValidId = isValidObjectId(questionId);
            // console.log(isValidId);
            if (!isValidId) {
              throw new BadRequestException(
                'Provided question id is not valid',
              );
            }
            const mcq = await this.mcqService.getById(questionId);

            if (
              mcq.createdBy.toString() !== userId &&
              mcq.questionType === 'private'
            ) {
              throw new BadRequestException(
                'You cannot access other companies mcqs',
              );
            }
          });
          await Promise.all(validation);
        } else if (testType === 'codingQuestion') {
          dto.customQuestionsType = 'CodingQuestion';

          customQuestions.forEach(async (questionId: string) => {
            const isValidId = isValidObjectId(questionId);
            // console.log(isValidId);
            if (!isValidId) {
              throw new BadRequestException(
                'Provided question id is not valid',
              );
            }
            const Question =
              await this.questionService.getQuestionById(questionId);

            if (
              Question.createdBy.toString() !== userId &&
              Question.questionType === 'private'
            ) {
              throw new BadRequestException(
                'You cannot access other companies Coding questions',
              );
            }
          });
        }

        const createdTest = await this.testService.createManual(
          userType,
          userId,
          dto,
        );
        return createdTest;
      } catch (error) {
        if (error.code === 11000 && error.keyPattern.title === 1) {
          throw new BadRequestException(
            'Title already exists. Choose a unique title.',
          );
        }
        throw error;
      }
    }
    try {
      if (testType === 'Mcq') {
        dto.customQuestionsType = 'MCQ';

        // check questions are valid for the company
        customQuestions.forEach(async (questionId: string) => {
          const isValidId = isValidObjectId(questionId);
          if (!isValidId) {
            throw new BadRequestException('Provided question id is not valid');
          }
          const mcq = await this.mcqService.getById(questionId);

          if (
            mcq.createdBy.toString() !== userId &&
            mcq.questionType === 'private'
          ) {
            throw new BadRequestException(
              'You cannot access other companies mcqs',
            );
          }
        });
      } else if (testType === 'codingQuestion') {
        dto.customQuestionsType = 'CodingQuestion';
        const codingQuestion =
          await this.restrictionsService.checkFeaturesAllowed(
            userId,
            'codingQuestion',
          );
        // check questions are valid for that company
        customQuestions.forEach(async (questionId: string) => {
          const isValidId = isValidObjectId(questionId);
          // console.log(isValidId);
          if (!isValidId) {
            throw new BadRequestException('Provided question id is not valid');
          }
          const Question =
            await this.questionService.getQuestionById(questionId);
          if (Question.questionType === 'general' && codingQuestion !== true) {
            throw new BadRequestException(
              'You donot have access to coding questions bank',
            );
          } else if (codingQuestion === true) {
            if (
              Question.createdBy.toString() !== userId &&
              Question.questionType === 'private'
            ) {
              throw new BadRequestException(
                'You cannot access other companies Coding questions',
              );
            }
          }
        });
      }

      // Check limit
      const feature = await this.restrictionsService.checkFeaturesUsed(
        userId,
        'tests',
        dto,
        {},
        {},
        {},
      );

      const createdTest = await this.testService.createManual(
        userType,
        userId,
        dto,
      );

      const generalCount = getupdatedFeaturesAllowed('tests', feature);

      // Update tests used
      await this.restrictionsService.updateFeatures(req.user.id, {
        featuresUsed: { testsUsed: generalCount },
      });

      // console.log('created test....', createdTest);
      return createdTest;
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.title === 1) {
        throw new BadRequestException(
          'Title already exists. Choose a unique title.',
        );
      }
      throw error;
    }
  }

  // *************************** in use *************************************
  @Get('/tests')
  @UseGuards(AuthGuard())
  @SetMetadata('permission', 'test_read')
  @ApiOperation({
    summary:
      'Get all Tests for companies  or search by testName, tag, language and sort them',
    description: 'Get all Tests or paginate them',
  })
  // @ApiExtraModels(testResponseDto, manualTestResponseDto)
  // @ApiOkResponse({
  //   schema: {
  //     anyOf: refs(testResponseDto, manualTestResponseDto),
  //   },
  // })
  @ApiResponse({
    status: 200,
    description: 'Returns the Tests both types',
    type: testResponseDto,
  })
  async getAllTests(
    @Query() query: CompanyTestPaginationDto,
    @Req() req: AuthReq,
  ) {
    const userid = checkUser(req.user.userType, req.user.company, req.user.id);
    const tests = await this.restrictionsService.checkFeaturesAllowed(
      userid,
      'tests',
    );
    if (tests === true) {
      return await this.testService.getByCompany(req.user.id, query, tests);
    } else if (tests === false) {
      return await this.testService.getByCompany(req.user.id, query, tests);
    }
  }

  // ************************************* in use **************************************
  @Get('/allTests')
  @UseGuards(AuthGuard(), AdminGuard)
  @SetMetadata('permission', 'test_read')
  @ApiOperation({
    summary:
      "Get admin's all Tests or search by testName, tag, language and sort them",
    description: 'Get all Tests or paginate them',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the Test by id',
    type: testResponseDto,
  })
  async getAdminAllTests(
    @Query() query: TestPaginationDto,
    @Req() req: AuthReq,
  ) {
    return await this.testService.getTestsForAdmin(req.user.id, query);
  }

  // ******************************* in use *****************************
  @Get('/tests/getOne/:testId')
  // @SetMetadata('permission', 'test_read')
  @ApiOperation({ summary: 'Get the Test by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the Test by id',
    type: singleTestsRes,
  })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Test not found',
  // })
  getTestById(@Param('testId') testId: string) {
    return this.testService.findById(testId);
  }

  // *********************** in use *************************
  @Put('tests/:testId')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'test_update')
  @ApiResponse({
    type: CreateTestDto,
    description: 'Test updated',
  })
  async updateTest(
    @Param('testId') testId: string,
    @Body() dto: UpdateTestDto,
    @Req() req: AuthReq,
  ) {
    dto.updatedBy = req.user.id;
    // TODO: verify login user is either member of same team
    return this.testService.update(req.user.id, testId, dto);
  }

  // ***************************** in use ***********************888
  @Patch('/tests/:testId')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({ summary: 'Add test into General Bank' })
  async PutTestIntoBank(@Param('testId') testId: string) {
    return this.testService.PutTestIntoBank(testId);
  }

  // *************************** in use *************************8
  @Patch('/tests/:testId')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({ summary: 'Edit picked tests' })
  async updatepickedTest(
    @Req() req: AuthReq,
    @Param('testId') testId: string,
    @Body() dto: UpdateTestDto,
  ) {
    if (req.user.userType) {
      return this.testService.updatepickedTest(testId, dto);
    }
    throw new BadRequestException('Failed to update test.');
  }

  // ***************************** in use **********************************
  @Delete('tests/remove/:id')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'test_del')
  @ApiOperation({ summary: 'Deletes a test by its id' })
  remove(@Param('id') id: string, @Req() req: AuthReq) {
    return this.testService.remove(id, req.user.id);
  }
}
