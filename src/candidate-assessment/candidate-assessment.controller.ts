import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  Req,
  UseGuards,
  Param,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { CandidateAssessmentService } from './candidate-assessment.service';
import { CreateCandidateAssessmentDto } from './dto/create-candidate-assessment.dto';
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
import { UpdateCandidateAssessmentDto } from './dto/update-candidate-assessment.dto';

import {
  AssessmentCodingObj,
  AssessmentMcqObj,
  CandidateResults,
  Assessment,
  paginationDto,
  AssessmentsDto,
  AssessementStatsRefreshResponse,
} from 'src/utils/classes';
import { AuthReq } from 'src/types';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import { BadRequestException } from '@nestjs/common';
import { calculateTotalQuestions } from 'src/utils/funtions';
import { CompanyTeamGuard } from 'src/auth/jwt.team.guard';
import { JobService } from 'src/job/job.service';
import { UserService } from 'src/user/user.service';
import { CandidateApplicationService } from 'src/candidate-application/candidate-application.service';
import { ExamService } from 'src/exam/exam.service';
import { codingQuestion } from 'src/exam/dto/ExamMcqQuestion.dto';
@ApiTags('Candidate Assessment')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('/api')
export class CandidateAssessmentController {
  constructor(
    private readonly candidateAssessmentService: CandidateAssessmentService,
    private readonly examService: ExamService,
    private readonly codingService: CodingQuestionsService,
    private readonly jobService: JobService,
    private readonly mcqService: McqService,
    private readonly restrictionsService: SubPlanRestrictionsService,
    private readonly userService: UserService,
    private readonly applicationService: CandidateApplicationService,
  ) {}

  // @Post('assessments/create-candidate-assessment')
  // @UseGuards(AuthGuard(), CandidateGuard)
  // @ApiOkResponse({
  //   type: codingQuestion,
  // })
  // async createCandidateAssessment(
  //   @Body() dto: CreateCandidateAssessmentDto,
  //   @Req() req: AuthReq,
  // ) {
  //   const userId = req.user.id;
  //   // check here if previous assessment is in DB todo
  //   // get exam by ID
  //   const exam = await this.examService.findById(dto.exam);
  //   const job = await this.jobService.findById(dto.job);
  //   if (!job) {
  //     throw new NotFoundException('Job not found');
  //   }
  //   const compId = job?.createdBy?.toString();
  //   if (!exam) {
  //     throw new NotFoundException('Exam not found');
  //   }
  //   // get random mcqs from exam difficulty composition
  //   const mcqSize = [
  //     exam.mcqDifficultyComposition.easy,
  //     exam.mcqDifficultyComposition.medium,
  //     exam.mcqDifficultyComposition.hard,
  //   ];
  //   // console.log(exam.language, exam.tags, mcqSize);

  //   // get random coding  from exam difficulty composition
  //   const codingSize = [
  //     exam.codingDifficultyComposition.easy,
  //     exam.codingDifficultyComposition.medium,
  //     exam.codingDifficultyComposition.hard,
  //   ];

  //   // Check companySubscription plan and Permission for examBank
  //   const exams = await this.restrictionsService.checkFeaturesAllowed(
  //     compId,
  //     'exams',
  //   );

  //   let mcqs: any;
  //   let codings: any;
  //   if (exams == true) {
  //     mcqs = await this.mcqService.getQuestionsByDiffTags(
  //       exam.language,
  //       exam.tags,
  //       mcqSize,
  //     );
  //     codings = await this.codingService.getQuestionsByDiffTags(
  //       exam.language,
  //       exam.tags,
  //       codingSize,
  //     );
  //   } else if (exams == false) {
  //     mcqs = await this.mcqService.getQuestionsByDiffTagsComp(
  //       compId,
  //       exam.language,
  //       exam.tags,
  //       mcqSize,
  //     );
  //     codings = await this.codingService.getQuestionsByDiffTagsComp(
  //       compId,
  //       exam.language,
  //       exam.tags,
  //       codingSize,
  //     );
  //     // console.log({ mcqs, codings });
  //   }

  //   // check if this candidate has already attempted the test
  //   // console.log(exams, codings, mcqs);
  //   const assessmentFound = await this.candidateAssessmentService
  //     .findCandidateAssessment(userId, dto.exam, dto.job)
  //     .populate({
  //       path: 'mcqs',
  //       select: '_id options title',
  //     })
  //     .populate({
  //       path: 'codings',
  //       select: '_id title description templates',
  //     })
  //     .populate({
  //       path: 'mcqQuestions.questionId',
  //       select: 'correctOption',
  //     });
  //   // console.log('assessmentFound....', assessmentFound);

  //   if (assessmentFound) {
  //     if (assessmentFound.testPointer.isFinished == true) {
  //       return {
  //         isFinished: true,
  //       };
  //     }
  //     // check testPointer index and send relevant question
  //     // Check if the number of attempts is greater than 2
  //     if (assessmentFound.testPointer.attempts > 2) {
  //       // Finish the test
  //       assessmentFound.testPointer.index = 0;
  //       assessmentFound.testPointer.activeCoding = false;
  //       assessmentFound.testPointer.activeMcqs = false;
  //       assessmentFound.testPointer.isFinished = true;
  //       assessmentFound.testPointer.totalTime = 0;
  //       assessmentFound.testPointer.remainingTime = 0;

  //       // Save the updated assessment
  //       await assessmentFound.save();
  //       // TODO: update status of candidate application
  //       // await applicationStatusUpdate(dto.job, userId);
  //       return { isFinished: true };
  //     }

  //     // Determine whether to send an MCQ or a coding question based on the testPointer
  //     let nextQuestion;
  //     let currentIndex;
  //     // const totalQuestions = mcqs.length + codings.length;
  //     // let questionNumber = 0;
  //     // console.log('total number of questions.....', totalQuestions);
  //     if (assessmentFound.testPointer.activeMcqs) {
  //       // Get the next MCQ question
  //       // if index is 0 then send question at index 0, else send question at previous index
  //       if (assessmentFound.testPointer.index == 0) {
  //         currentIndex = assessmentFound.testPointer.index;
  //         // questionNumber = mcqs.length + 1;
  //       } else {
  //         currentIndex = assessmentFound.testPointer.index - 1;
  //         // questionNumber = currentIndex;
  //       }
  //       // console.log('mcqs is true....', questionNumber);

  //       nextQuestion = assessmentFound.mcqs[currentIndex];
  //       // Increment the attempts
  //       assessmentFound.testPointer.attempts++;
  //       console.log('attempts++>>', assessmentFound.testPointer.attempts++);

  //       // Increment the index for the next question
  //       assessmentFound.testPointer.index = currentIndex + 1;

  //       // Save the updated assessment
  //       await assessmentFound.save();
  //       console.log('currentIndexQuestion', currentIndex);
  //       console.log('remaintime', assessmentFound.testPointer.remainingTime);
  //       return {
  //         questionIndex: currentIndex,
  //         remainingTime: assessmentFound.testPointer.remainingTime,
  //         question: nextQuestion,
  //         isCodingQuestion: false,
  //         isFinished: false,
  //       };
  //     } else if (assessmentFound.testPointer.activeCoding) {
  //       // const totalQuestions = mcqs.length + codings.length;
  //       let questionNumber = 0;
  //       // Get the next coding question
  //       // if index is 0 then send question at index 0, else send question at previous index
  //       if (assessmentFound.testPointer.index == 0) {
  //         currentIndex = assessmentFound.testPointer.index;
  //         questionNumber = mcqs.length + 1;
  //       } else {
  //         currentIndex = assessmentFound.testPointer.index - 1;
  //         questionNumber = mcqs.length + currentIndex;
  //       }
  //       // console.log(
  //       //   questionNumber,
  //       //   mcqs.length,
  //       //   assessmentFound.testPointer.index,
  //       // );
  //       nextQuestion = assessmentFound.codings[currentIndex];
  //       // Increment the attempts
  //       assessmentFound.testPointer.attempts++;

  //       // Increment the index for the next question
  //       assessmentFound.testPointer.index = currentIndex + 1;

  //       // Save the updated assessment
  //       await assessmentFound.save();
  //       return {
  //         questionIndex: questionNumber,
  //         remainingTime: assessmentFound.testPointer.remainingTime,
  //         question: nextQuestion,
  //         isCodingQuestion: true,
  //         isFinished: false,
  //       };
  //     }
  //   }

  //   const assessment = await this.candidateAssessmentService.create(
  //     dto,
  //     userId,
  //     mcqs,
  //     codings,
  //   );

  //   // console.log('assessment created');
  //   // console.log('assessment......', assessment.mcqs, assessment.codings);

  //   // now check if there is mcq, then send first mcq question otherwise send coding first question
  //   // console.log("assessment.mcqs.length", assessment.mcqs.length);
  //   if (assessment.mcqs.length > 0) {
  //     console.log('mcq se gya');
  //     // now send first question from mcq array
  //     const firstMCQQuestion = assessment && assessment.mcqs[0];
  //     // console.log(assessment);
  //     if (assessment) {
  //       assessment.testPointer.index = 1;
  //       assessment.testPointer.remainingTime = exam.totalTime;
  //       assessment.testPointer.activeMcqs = true;
  //       assessment.testPointer.totalTime = exam.totalTime;
  //       assessment.testPointer.attempts = 1;
  //       assessment.testPointer.points = 0;
  //       console.log('attempts++>>>', assessment.testPointer.attempts);

  //       await assessment.save();
  //       // console.log('assesmment updated...........', assessment);
  //       return {
  //         question: firstMCQQuestion,
  //         isCodingQuestion: false,
  //         time: exam.totalTime,
  //       };
  //     }
  //   }

  //   const firstCodingQuestion = assessment && assessment.codings[0];
  //   console.log('coding se gya');
  //   if (assessment) {
  //     assessment.testPointer.index = 1;
  //     assessment.testPointer.remainingTime = exam.totalTime;
  //     assessment.testPointer.activeCoding = true;
  //     assessment.testPointer.totalTime = exam.totalTime;
  //     assessment.testPointer.attempts = 1;
  //     assessment.testPointer.points = 0;
  //     await assessment.save();
  //     return {
  //       question: firstCodingQuestion,
  //       isCodingQuestion: true,
  //       time: exam.totalTime,
  //     };
  //   }
  // }

  // @Get('testing/:userid')
  // async testing(@Param('userid') userid: string) {
  //   const assessmentFound =
  //     await this.candidateAssessmentService.applicationStatusUpdate(userid);
  // }

  // @Get('assessments/stats/:examid/:jobid')
  // @UseGuards(AuthGuard(), CandidateGuard)
  // @ApiOkResponse({ type: AssessementStatsRefreshResponse })
  // async getStatsAssessments(
  //   @Req() req: AuthReq,
  //   @Param('examid') examid: string,
  //   @Param('jobid') jobid: string,
  // ) {
  //   if (examid && jobid) {
  //     console.log(examid, jobid, req.user.id);
  //     // get exam by examid
  //     const exam = await this.examService.findOne(examid);
  //     // console.log('exam found.......', exam);
  //     // find assessment to send attempts in response
  //     const assessmentFound = await this.candidateAssessmentService
  //       .findCandidateAssessment(req.user.id, examid, jobid)
  //       .populate({
  //         path: 'mcqs',
  //         select: '_id options title',
  //       })
  //       .populate({
  //         path: 'codings',
  //         select: '_id title description templates',
  //       })
  //       .populate({
  //         path: 'mcqQuestions.questionId',
  //         select: 'correctOption',
  //       });
  //     console.log('assess found...', assessmentFound);
  //     const totalQuestions = calculateTotalQuestions(
  //       exam.codingDifficultyComposition,
  //       exam.mcqDifficultyComposition,
  //     );
  //     if (!assessmentFound) {
  //       return {
  //         exam: {
  //           title: exam.title,
  //           totalTime: exam.totalTime,
  //           totalQuestions,
  //         },
  //         attempts: 0,
  //         timeRemaining: 0,
  //       };
  //     }

  //     // console.log('this is assessment', assessmentFound);

  //     return {
  //       exam: { title: exam.title, totalTime: exam.totalTime, totalQuestions },
  //       attempts: assessmentFound.testPointer.attempts,
  //       timeRemaining: assessmentFound.testPointer.remainingTime,
  //     };
  //   } else {
  //     throw new BadRequestException('Jobid or examid not correct');
  //   }
  // }

  @Get('assessments/candidateAssessments')
  @ApiOperation({
    summary: 'Get all assessments of a particular candidate or paginate them',
  })
  @ApiResponse({
    status: 200,
    type: AssessmentsDto,
  })
  @UseGuards(AuthGuard(), CandidateGuard)
  async findTestByCandidate(
    @Req() req: AuthReq,
    @Query() query: paginationDto,
  ) {
    const { id } = req.user;
    if (query.page && query.limit) {
      const { page, limit } = query;
      return this.candidateAssessmentService.findTestByCandidate(
        id,
        page,
        limit,
      );
    } else {
      return this.candidateAssessmentService.findTestByCandidate(id);
    }
  }

  @Get('assessments/allResults')
  @ApiOperation({
    summary:
      'Get all assessments results of a particular company or paginate them',
  })
  @ApiResponse({
    status: 200,
    type: [CandidateResults],
  })
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'assessments_read')
  async fin(@Req() req: AuthReq, @Query() query: paginationDto) {
    const { id } = req.user;
    let assessments;
    const exams = await this.examService.findByCompany(id, query);
    const exam = exams.exams;
    // console.log('aaaa', exam);
    // return;

    if (query.page && query.limit) {
      const { page, limit } = query;
      assessments =
        await this.candidateAssessmentService.findByExamsWithPagination(
          exam,
          page,
          limit,
        );
    } else {
      assessments = await this.candidateAssessmentService.findByExams(exam);
    }

    const companyName = req.user.name;
    // TODO Remove any and specify type

    const assessmentData: any = assessments.allAssessments.map(
      (assessment: any) => ({
        companyName: companyName,
        candidateName: assessment.candidateInfo[0].name, // Access the first element of the array
        candidateEmail: assessment.candidateInfo[0].email,
        examTitle: assessment.examInfo[0].title,
        Marks: assessment.testPointer.points,
        percentage: assessment.testPointer.obtainPercentage.toFixed(2),
        assessmentCreatedAt: assessment.createdAt,
      }),
    );
    return assessmentData;
  }

  @Get('assessments/:id')
  @ApiResponse({
    status: 200,
    type: Assessment,
  })
  @ApiOkResponse({
    type: CreateCandidateAssessmentDto,
  })
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'assessments_read')
  findOne(@Param('id') id: string) {
    return this.candidateAssessmentService.findOne(id);
  }

  @Get('assessments')
  @ApiOperation({
    summary: 'Get all assessments or paginate them',
  })
  @ApiResponse({
    status: 200,
    type: Assessment,
  })
  @ApiOkResponse({
    type: [CreateCandidateAssessmentDto],
  })
  findAll(@Query() query: paginationDto) {
    if (query.page && query.limit) {
      const { page, limit } = query;
      return this.candidateAssessmentService.findAll(page, limit);
    } else {
      return this.candidateAssessmentService.findAll();
    }
  }

  @Get('assessmentsByExam/:examId')
  @ApiOperation({
    summary: 'Get all assessments of an Exam or paginate them',
    description: 'Returns all assessments of an exam',
  })
  @ApiResponse({
    status: 200,
    type: Assessment,
  })
  @UseGuards(AuthGuard())
  @ApiOkResponse({
    type: [CreateCandidateAssessmentDto],
  })
  async getAssessmentsByExamId(
    @Param('examId') examId: string,
    @Query() query: paginationDto,
  ) {
    if (query.page && query.limit) {
      const { page, limit } = query;
      return this.candidateAssessmentService.findByExamId(examId, page, limit);
    } else {
      return this.candidateAssessmentService.findByExamId(examId);
    }
  }

  @Get('assessments/candidateResult/:id')
  @ApiOperation({
    summary: 'Get result of a single assessment by Assessement id',
    description: 'Returns result of a single assessment',
  })
  @UseGuards(AuthGuard(), CandidateGuard)
  async singleTestResult(@Param('id') id: string) {
    const result = await this.candidateAssessmentService.testResult(id);
    if (result) {
      // checks for if isfinish == true than show result
      return { points: result.testPointer.points };
    } else {
      return { error: 'Assessment not found' };
    }
  }

  @Get('assessments/:assessmentId/progress')
  async getAssessmentProgress(@Param('assessmentId') assessmentId: string) {
    return await this.candidateAssessmentService.checkProgress(assessmentId);
  }

  @Get('assessmentReport')
  @ApiOperation({
    summary: 'Get candidate assessmentReport',
  })
  assessmentReport(
    @Param('candId') candId: string,
    @Param('jobId') jobId: string,
  ) {
    return this.candidateAssessmentService.assessmentReport(candId, jobId);
  }

  @Patch('assessments/:examid')
  @ApiExtraModels(AssessmentCodingObj, AssessmentMcqObj)
  @ApiOkResponse({
    // schema: { anyOf: refs(AssessmentCodingObj, AssessmentMcqObj) },
    type: codingQuestion,
  })
  @UseGuards(AuthGuard(), CandidateGuard)
  update(
    @Param('examid') examid: string,
    @Body() dto: UpdateCandidateAssessmentDto,
    @Req() req: AuthReq,
  ) {
    const userId = req.user.id;
    return this.candidateAssessmentService.update(userId, examid, dto);
  }

  // TODO: not in use
  @Delete('assessments/:id')
  remove(@Param('id') id: string) {
    return this.candidateAssessmentService.remove(id);
  }
}
