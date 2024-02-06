import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Req,
  UseGuards,
  Param,
  Query,
  SetMetadata,
  NotFoundException,
  BadRequestException,
  Res,
  UnprocessableEntityException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CandidateGuard } from 'src/auth/jwt.candidate.guard';
import { CodingQuestionsService } from 'src/coding-question/coding-question.service';
import { McqService } from 'src/mcq/mcq.service';

import {
  AssessmentCodingObj,
  AssessmentMcqObj,
  CandidateResults,
  Assessment,
  paginationDto,
  AssessmentsDto,
  StartTestObj,
  GetAnswerObj,
  StudentAssessmentResponse,
  PopulatedTest,
  TestStatuses,
} from 'src/utils/classes';
import { AuthReq } from 'src/types';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import { JobService } from 'src/job/job.service';
import { UserService } from 'src/user/user.service';
import { CandidateApplicationService } from 'src/candidate-application/candidate-application.service';
import { codingQuestion } from 'src/exam/dto/ExamMcqQuestion.dto';
import { StudentAssessmentService } from './student-assessment.service';
import {
  CreateStudentAssessmentDto,
  QuesAnswersDto,
  TestPointerDto,
} from './dto/create-student-assessment.dto';
import { UpdateStudentAssessmentDto } from './dto/update-student-assessment.dto';
import { CompanyAssessmentService } from 'src/companyAssessment/companyAssessment.service';
import { TestService } from 'src/Test/Test.service';
import { Response } from 'express';
import { Test } from 'src/Test/entities/Test.entity';
import { StudentAssessment } from './entities/student-assessment.entity';
import { CreateTestDto } from 'src/Test/dto/CreateTest.dto';
import { getupdatedFeaturesAllowed } from 'src/utils/funtions';
@ApiTags('Student Assessment')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('/api')
export class StudentAssessmentController {
  constructor(
    private readonly StuAssessmentService: StudentAssessmentService,
    private readonly companyAssessmentService: CompanyAssessmentService,
    private readonly mcqService: McqService,
    private readonly codingService: CodingQuestionsService,
    private readonly testService: TestService,
    private readonly jobService: JobService,
    private readonly restrictionsService: SubPlanRestrictionsService,
    private readonly userService: UserService,
    private readonly applicationService: CandidateApplicationService,
  ) {}

  public getTargetTest(testPointers: any, testId: string) {
    const targetTest: any = testPointers.find(
      (t: any) => t.testId.toString() === testId,
    );
    return targetTest;
  }

  @Post('assessments/create-student-assessment')
  @UseGuards(AuthGuard(), CandidateGuard)
  // @ApiOkResponse({
  //   type: StudentAssessmentResponse,
  // })
  async createStudentAssessment(
    @Body() dto: CreateStudentAssessmentDto,
    @Req() req: AuthReq,
    // @Res() res: Response,
  ) {
    // console.log('dto...', dto);
    const { companyAssessment } = dto;
    // check job also by finding it
    const jobFound = await this.jobService.findById(dto.job);
    if (!jobFound) {
      throw new BadRequestException('Job not Found for assessment');
    }
    // find the company Assessment
    const companyAssessmentFound =
      await this.companyAssessmentService.findByIdAndPopulate(
        companyAssessment,
      );

    if (!companyAssessmentFound) {
      throw new NotFoundException('No Company Assessment Found');
    }
    // Get the tests array and set the testIds inside the studentAssessment testPointers
    const { tests } = companyAssessmentFound;
    console.log('tests....', tests);
    const testPointers: TestPointerDto[] = tests.map((test) => {
      if (test.testType === 'Mcq') {
        return {
          testId: test.id,
          questSchemas: 'MCQ',
          testStatus: 'notStarted',
        };
      } else if (test.testType === 'CodingQuestion') {
        return {
          testId: test.id,
          questSchemas: 'CodingQuestion',
          testStatus: 'notStarted',
        };
      }
      return { testId: '', questSchemas: '', testStatus: '' };
    });

    dto.testPointers = testPointers;

    // Check limit
    const feature = await this.restrictionsService.checkFeaturesUsed(
      req.user.id,
      'assessments',
      {},
      {},
      dto,
      {},
    );

    console.log('dto to save...', dto);
    // // console.log(testPointers);
    const createdAssessment = await this.StuAssessmentService.create(
      req.user.id,
      dto,
    );

    // if (feature !== true) {
    // Update assessments used
    const generalCount = getupdatedFeaturesAllowed('assessments', feature);

    await this.restrictionsService.updateFeatures(req.user.id, {
      featuresUsed: { testsUsed: generalCount },
    });
    // } else if (feature == true) {
    // await this.restrictionsService.updateFeatures(req.user.id, {
    //  featuresUsed: { assessmentsUsed: 'noLimit' },
    //});
    // }

    await createdAssessment.populate({
      path: 'testPointers.testId',
      select: 'testName totalTime testType language',
    });

    // return {
    //   assessment: createdAssessment,
    // };
    return true;
  }

  @Get('assessments/show_student_assessment/:companyAssessment/:job')
  @UseGuards(AuthGuard(), CandidateGuard)
  @ApiOkResponse({
    type: StudentAssessmentResponse,
  })
  async showAssessmentDetails(
    @Param('companyAssessment')
    companyAssessment: string,
    @Param('job') job: string,
    @Req() req: AuthReq,
  ) {
    console.log(
      'params...companyassessmentId..',
      companyAssessment,
      'job id...',
      job,
    );

    const studentAssessment =
      await this.StuAssessmentService.findStudentAssessment(
        job,
        companyAssessment,
        req.user.id,
      );

    console.log('student assessment....', studentAssessment.testPointers);
    const { testPointers } = studentAssessment;
    // check if all test questions array is empty it means FIRST attempt
    let allEmpty = false;
    allEmpty = testPointers.every((test) => test.quesAnswers.length <= 0);
    // send testInfo and totalExamTime
    if (allEmpty) {
      let totalExamTime = 0;
      testPointers.map((test: any) => {
        // console.log(test.testId.testType);
        if (test.testId.testType === 'Mcq') {
          totalExamTime += test.testId.totalTime;
        } else if (test.testId.testType === 'CodingQuestion') {
          totalExamTime += test.testId.totalTime;
        }
        return 0;
      });
      console.log('total Exam time....', totalExamTime);
      await studentAssessment.save();
      return {
        assessment: studentAssessment,
        totalExamTime,
      };
    }
    // TODO:
    // else give user perform aggregation for remaining total time of all tests
    // completed tests(not included), notStartedTEsts(included), resume tests(included)
    return {
      assessment: studentAssessment,
      // totalExamTime,
    };
  }

  @Post('assessments/start-testBlock')
  @UseGuards(AuthGuard(), CandidateGuard)
  // @ApiOkResponse({
  //   type: codingQuestion,
  // })
  async startTest(
    @Body()
    dto: StartTestObj,
  ) {
    console.log('start test dto...', dto);

    const studentAssessment = await this.StuAssessmentService.findOne(
      dto.studentAssessment,
    );

    console.log('student assessment....', studentAssessment);
    const { testPointers } = studentAssessment;

    // check if any test is already started
    testPointers.map((test: any) => {
      if (test.current && test.testId.id !== dto.testId) {
        throw new BadRequestException(
          `${test.testId.testName} is already started. Please complete it first...`,
        );
      }
    });
    // find the target test first
    const targetTest: any = testPointers.find(
      (t: any) => t.testId.id.toString() === dto.testId,
    );
    console.log('target test...', targetTest);
    // condition for asked test already started if it is already started and in resume state plus send remaining time
    // TODO:
    if (
      targetTest.testStatus === TestStatuses.resume &&
      targetTest.index <= targetTest.quesAnswers.length
    ) {
      let remainingTime =
        targetTest.expEndTime.getTime() - targetTest.remainTime.getTime();
      // console.log('remaining Time', remainingTime);
      remainingTime = Math.max(
        0,
        Math.min(remainingTime, targetTest.remainTime),
      );
      const remainingTimeInMinutes = Math.floor(remainingTime / (1000 * 60));
      console.log('remaining Time in minutes....', remainingTimeInMinutes);

      return {
        test: targetTest,
        totalTestTime: remainingTimeInMinutes,
      };
    }

    // As this test is on FIRST ATTEMPT
    // now set the questions inside that targetTest by putting ids of those questions inside the testPointers
    let questions = [];
    if (targetTest.questSchemas === 'MCQ') {
      questions = await this.mcqService.getQuestionsByDiffTagsComp(
        new mongoose.Types.ObjectId(targetTest.testId.createdBy.toString()),
        targetTest.testId.language,
        new mongoose.Types.ObjectId(targetTest.testId.tag.toString()),
        [
          targetTest.testId.compositionEasy,
          targetTest.testId.compositionMedium,
          targetTest.testId.compositionHard,
        ],
      );
      const questionsIdsIntoArray = questions.length ? questions.flat() : [];

      questions = questionsIdsIntoArray.map((questionId: any) => ({
        questionId: questionId.toString(),
        answer: '',
        isCorrect: false,
        timeTaken: 0,
      }));

      // start the test by current true and dates
      // pushing the questions in quesAnswers array
      targetTest.quesAnswers = questions;
      await studentAssessment.save();

      return {
        test: targetTest,
        totalTestTime: targetTest.testId.totalTime,
      };
    } else if (targetTest.questSchemas === 'CodingQuestion') {
      questions = await this.codingService.getQuestionsByDiffTagsComp(
        new mongoose.Types.ObjectId(targetTest.testId.createdBy.toString()),
        targetTest.testId.language,
        new mongoose.Types.ObjectId(targetTest.testId.tag.toString()),
        [
          targetTest.testId.compositionEasy,
          targetTest.testId.compositionMedium,
          targetTest.testId.compositionHard,
        ],
      );
      const questionsIdsIntoArray = questions.length ? questions.flat() : [];

      questions = questionsIdsIntoArray.map((questionId: any) => ({
        questionId: questionId.toString(),
        answer: '',
        isCorrect: false,
        timeTaken: 0,
      }));

      // start the test by current true and dates
      // pushing the questions in quesAnswers array
      targetTest.quesAnswers = questions;
      await studentAssessment.save();

      return {
        studentAssessment,
        message: `Test ${targetTest.testId.testName} is started`,
      };
    }
  }

  @Post('assessments/sendQuestion')
  @UseGuards(AuthGuard(), CandidateGuard)
  // @ApiOkResponse({
  //   type: codingQuestion,
  // })
  async sendQuestion(
    @Body()
    dto: GetAnswerObj,
  ) {
    console.log('send Question....', dto);
    const studentAssessment = await this.StuAssessmentService.findOne(
      dto.studentAssessment,
    );

    const { testPointers } = studentAssessment;
    // get the test, the user chose, to start it
    const targetTest: any = testPointers.find(
      (t: any) => t.testId.id === dto.testId,
    );
    console.log('targetTest ...', targetTest);
    // check if this test is already completed
    if (
      targetTest.isFinished &&
      targetTest.testStatus === 'completed' &&
      targetTest.index == targetTest.quesAnswers.length
    ) {
      throw new BadRequestException('You cannot attempt a completed test');
    }
    // now check if the attempts are more than 3
    if (studentAssessment.attempts > 2) {
      console.log('attempts are more than 3', targetTest.attempts);
      targetTest.current = false;
      targetTest.testStatus = 'completed';
      targetTest.isFinished = true;
      await studentAssessment.save();
      return {
        isFinished: true,
      };
    }
    // check if this test time is OVER
    let remainingTime =
      targetTest.expEndTime.getTime() - targetTest.remainTime.getTime();
    // console.log('remaining Time', remainingTime);
    remainingTime = Math.max(0, Math.min(remainingTime, targetTest.remainTime));
    const remainingTimeInMinutes = Math.floor(remainingTime / (1000 * 60));

    console.log('Time over?', remainingTimeInMinutes);
    if (remainingTimeInMinutes < 0) {
      targetTest.current = false;
      targetTest.testStatus = 'completed';
      targetTest.isFinished = true;
      await studentAssessment.save();
      return {
        isFinished: true,
      };
    }
    if (dto.questionId && dto.answer && dto.studentAssessment && dto.testId) {
      console.log('inside the resume part');
      // update the question tests here and send the next question, update the index also
      // update the MCQ TEST
      if (targetTest.questSchemas === 'MCQ' && targetTest.quesAnswers) {
        // update the mcq questions test
        // first finding the question with questionId
        // console.log(targetTest.quesAnswers);
        const mcq = await this.mcqService.getById(dto.questionId);
        const quesToUpdate: QuesAnswersDto = targetTest.quesAnswers.find(
          (question: QuesAnswersDto) => question.questionId === dto.questionId,
        );
        // console.log(quesToUpdate);

        // update the time taken for the submittd question
        targetTest.quesAnswers.map((question: QuesAnswersDto) => {
          if (question.questionId === dto.questionId) {
            let timeTaken =
              new Date().getTime() - targetTest.serverStartTime.getTime();
            timeTaken = Number((timeTaken / (1000 * 60)).toFixed(2));
            console.log('timeTaken....', timeTaken);
            console.log('curerent....', new Date().getTime());
            console.log('server....', targetTest.serverStartTime.getTime());
            question.timeTaken = timeTaken;
          }
        });
        // first check if the answer is correct or not
        if (mcq.correctOption === dto.answer) {
          quesToUpdate.isCorrect = true;
        }
        // saving the answer object
        quesToUpdate.answer = dto.answer;
        targetTest.score += 1;

        // check if time is up, finish test
        let timeDiff: number = 0;
        if (targetTest.index == 1) {
          timeDiff = targetTest.expEndTime.getTime() - new Date().getTime();
        } else {
          timeDiff = targetTest.remainTime.getTime() - new Date().getTime();
        }
        // setting remain time
        targetTest.remainTime = new Date(new Date().getTime() + timeDiff);
        console.log('time diff....', timeDiff);
        let isTimeUp = false;
        if (timeDiff < 0) {
          isTimeUp = true;
        }
        if (isTimeUp) {
          // terminate the test
          console.log('inside time up');
          targetTest.testStatus = 'completed';
          targetTest.isFinished = true;
          targetTest.current = false;

          await studentAssessment.save();
          return {
            isFinished: true,
          };
        }
        if (targetTest.index >= targetTest.quesAnswers.length) {
          // Submitted last question, now complete the test
          // terminate the test
          targetTest.testStatus = 'completed';
          targetTest.isFinished = true;
          targetTest.current = false;

          await studentAssessment.save();
          return {
            isFinished: true,
          };
        }
        const nxtMCQ = targetTest.quesAnswers[targetTest.index];
        // get the nextQuestion to send it
        const McqToSend = await this.mcqService.getById(nxtMCQ.questionId);
        targetTest.index += 1;
        console.log('next Question.....', McqToSend);

        await studentAssessment.save();

        return {
          nextQuestion: McqToSend,
          isFinished: false,
        };
      } else if (
        targetTest.questSchemas === 'CodingQuestion' &&
        targetTest.quesAnswers
      ) {
        // update the coding question test
      }
    }
    // send the FIRST question from the testPointers array which has current true
    if (dto.studentAssessment && dto.testId && dto.clientTime) {
      // first check if the asked test is in resume state, then send the correct question
      if (
        targetTest.current &&
        targetTest.testStatus == 'resume' &&
        targetTest.index <= targetTest.quesAnswers.length
      ) {
        let nowIndex = 0;
        if (targetTest.index > 1) {
          nowIndex = targetTest.index - 1;
        }
        if (targetTest.questSchemas === 'MCQ') {
          // console.log('inside the ', targetTest.questSchemas);
          // send question from mcqs test
          const questionToSend = targetTest.quesAnswers[nowIndex];
          studentAssessment.attempts += 1;
          await studentAssessment.save();
          // find the question and send
          const McqToSend = await this.mcqService.getById(
            questionToSend.questionId,
          );
          return {
            question: McqToSend,
            // totalTestTime: ,
          };
        } else if (targetTest.questSchema === 'CodingQuestion') {
          // send question from coding test
        }
      }

      // send first mcq question
      if (targetTest.questSchemas === 'MCQ' && targetTest.quesAnswers) {
        targetTest.index = 1;
        const firstMcqToSend = await this.mcqService.getById(
          targetTest.quesAnswers[0].questionId,
        );
        // update the attempt to one
        studentAssessment.attempts = 1;
        targetTest.current = true;
        targetTest.clientStartTime = dto.clientTime;
        targetTest.serverStartTime = new Date();
        targetTest.remainTime = targetTest.serverStartTime;
        targetTest.expEndTime = new Date(
          targetTest.serverStartTime.getTime() +
            targetTest.testId.totalTime * 60 * 1000,
        );
        console.log(targetTest.serverStartTime);
        console.log(targetTest.expEndTime);
        targetTest.testStatus = 'resume';
        await studentAssessment.save();
        console.log('updated student assessment....', studentAssessment);
        // send total time cause its FIRST QUESTION
        return {
          question: firstMcqToSend,
          totalTestTime: targetTest.totalTime,
        };
      } else if (
        targetTest.questSchemas == 'CodingQuestion' &&
        targetTest.quesAnswers
      ) {
        targetTest.index = 1;
        // Send first question from the Coding questions
        const firstCodingToSend = await this.codingService.getQuestionById(
          targetTest.quesAnswers[0].questionId,
        );
        // update the attempt to one
        studentAssessment.attempts = 1;
        targetTest.current = true;
        targetTest.serverStartTime = new Date();
        targetTest.clientStartTime = dto.clientTime;
        targetTest.expEndTime = new Date(
          new Date().getTime() + targetTest.testId.totalTime,
        );
        targetTest.testStatus = 'resume';
        await studentAssessment.save();
        console.log('updated student assessment....', studentAssessment);
        // send total time cause its FIRST QUESTION
        return {
          question: firstCodingToSend,
          totalTestTime: targetTest.totalTime,
        };
      } else {
        throw new BadRequestException(
          `Invalid questSchema : ${targetTest.questSchemas}`,
        );
      }
    }
    // please provide correct fields
    throw new UnprocessableEntityException(`Invalid data sending....`);
  }

  // @Get('assessments/StudentAssessments')
  // @ApiOperation({
  //   summary: 'Get all assessments of a particular candidate or paginate them',
  // })
  // @ApiResponse({
  //   status: 200,
  //   type: AssessmentsDto,
  // })
  // @UseGuards(AuthGuard(), CandidateGuard)
  // async findTestByCandidate(
  //   @Req() req: AuthReq,
  //   @Query() query: paginationDto,
  // ) {
  //   const { id } = req.user;
  //   if (query.page && query.limit) {
  //     const { page, limit } = query;
  //     return this.StuAssessmentService.findTestByCandidate(
  //       id,
  //       page,
  //       limit,
  //     );
  //   } else {
  //     return this.StuAssessmentService.findTestByCandidate(id);
  //   }
  // }

  // @Get('assessments/allResults')
  // @ApiOperation({
  //   summary:
  //     'Get all assessments results of a particular company or paginate them',
  // })
  // @ApiResponse({
  //   status: 200,
  //   type: [CandidateResults],
  // })
  // @UseGuards(AuthGuard(), CompanyTeamGuard)
  // @SetMetadata('permission', 'assessments_read')
  // async fin(@Req() req: AuthReq, @Query() query: paginationDto) {
  //   const { id } = req.user;
  //   let assessments;
  //   const exams = await this.examService.findByCompany(id, query);
  //   const exam = exams.exams;
  //   // console.log('aaaa', exam);
  //   // return;

  //   if (query.page && query.limit) {
  //     const { page, limit } = query;
  //     assessments =
  //       await this.StuAssessmentService.findByExamsWithPagination(
  //         exam,
  //         page,
  //         limit,
  //       );
  //   } else {
  //     assessments = await this.StuAssessmentService.findByExams(exam);
  //   }

  //   const companyName = req.user.name;
  //   // TODO Remove any and specify type

  //   const assessmentData: any = assessments.allAssessments.map(
  //     (assessment: any) => ({
  //       companyName: companyName,
  //       candidateName: assessment.candidateInfo[0].name, // Access the first element of the array
  //       candidateEmail: assessment.candidateInfo[0].email,
  //       examTitle: assessment.examInfo[0].title,
  //       Marks: assessment.testPointer.points,
  //       percentage: assessment.testPointer.obtainPercentage.toFixed(2),
  //       assessmentCreatedAt: assessment.createdAt,
  //     }),
  //   );
  //   return assessmentData;
  // }

  // @Get('assessments/:id')
  // @ApiResponse({
  //   status: 200,
  //   type: Assessment,
  // })
  // @ApiOkResponse({
  //   type: CreateStudentAssessmentDto,
  // })
  // @UseGuards(AuthGuard(), CompanyTeamGuard)
  // @SetMetadata('permission', 'assessments_read')
  // findOne(@Param('id') id: string) {
  //   return this.StuAssessmentService.findOne(id);
  // }

  // @Get('assessments')
  // @ApiOperation({
  //   summary: 'Get all assessments or paginate them',
  // })
  // @ApiResponse({
  //   status: 200,
  //   type: Assessment,
  // })
  // @ApiOkResponse({
  //   type: [CreateStudentAssessmentDto],
  // })
  // findAll(@Query() query: paginationDto) {
  //   if (query.page && query.limit) {
  //     const { page, limit } = query;
  //     return this.StuAssessmentService.findAll(page, limit);
  //   } else {
  //     return this.StuAssessmentService.findAll();
  //   }
  // }

  // @Get('assessmentsByExam/:examId')
  // @ApiOperation({
  //   summary: 'Get all assessments of an Exam or paginate them',
  //   description: 'Returns all assessments of an exam',
  // })
  // @ApiResponse({
  //   status: 200,
  //   type: Assessment,
  // })
  // @UseGuards(AuthGuard())
  // @ApiOkResponse({
  //   type: [CreateStudentAssessmentDto],
  // })
  // async getAssessmentsByExamId(
  //   @Param('examId') examId: string,
  //   @Query() query: paginationDto,
  // ) {
  //   if (query.page && query.limit) {
  //     const { page, limit } = query;
  //     return this.StuAssessmentService.findByExamId(examId, page, limit);
  //   } else {
  //     return this.StuAssessmentService.findByExamId(examId);
  //   }
  // }

  // @Get('assessments/candidateResult/:id')
  // @ApiOperation({
  //   summary: 'Get result of a single assessment by Assessement id',
  //   description: 'Returns result of a single assessment',
  // })
  // @UseGuards(AuthGuard(), CandidateGuard)
  // async singleTestResult(@Param('id') id: string) {
  //   const result = await this.StuAssessmentService.testResult(id);
  //   if (result) {
  //     // checks for if isfinish == true than show result
  //     return { points: result.testPointer.points };
  //   } else {
  //     return { error: 'Assessment not found' };
  //   }
  // }

  // @Get('assessments/:assessmentId/progress')
  // async getAssessmentProgress(@Param('assessmentId') assessmentId: string) {
  //   return await this.StuAssessmentService.checkProgress(assessmentId);
  // }

  // @Get('assessmentReport')
  // @ApiOperation({
  //   summary: 'Get candidate assessmentReport',
  // })
  // assessmentReport(
  //   @Param('candId') candId: string,
  //   @Param('jobId') jobId: string,
  // ) {
  //   return this.StuAssessmentService.assessmentReport(candId, jobId);
  // }

  @Patch('assessments/:assessmentId')
  @ApiExtraModels(UpdateStudentAssessmentDto, AssessmentMcqObj)
  @ApiOkResponse({
    // schema: { anyOf: refs(AssessmentCodingObj, AssessmentMcqObj) },
    type: codingQuestion,
  })
  @UseGuards(AuthGuard(), CandidateGuard)
  update(
    @Param('assessmentId') assessmentId: string,
    @Body() dto: UpdateStudentAssessmentDto,
    @Req() req: AuthReq,
  ) {
    const userId = req.user.id;
    return this.StuAssessmentService.update(userId, assessmentId, dto);
  }

  // not in use
  // @Delete('assessments/:id')
  // remove(@Param('id') id: string) {
  //   return this.StuAssessmentService.remove(id);
  // }
}
