import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { MCQ } from 'src/mcq/entities/mcq.entity';
import { CodingQuestion } from 'src/coding-question/entities/coding-question.entity';
import axios from 'axios';
import { UserService } from 'src/user/user.service';
import { CandidateApplicationService } from 'src/candidate-application/candidate-application.service';
import { EnumsCandidate, EnumsCompany } from 'src/utils/classes';
import { StudentAssessment } from './entities/student-assessment.entity';
import {
  CreateStudentAssessmentDto,
  TestPointerDto,
} from './dto/create-student-assessment.dto';
import { UpdateStudentAssessmentDto } from './dto/update-student-assessment.dto';

@Injectable()
export class StudentAssessmentService {
  constructor(
    @InjectModel(StudentAssessment.name)
    private AssessmentModel: Model<StudentAssessment>,
    @InjectModel(MCQ.name)
    private McqModel: Model<MCQ>,
    // private eventsGateway: EventsGateway,
    private readonly userService: UserService,
    private readonly applicationService: CandidateApplicationService,
  ) {}

  async create(userId: string, dto: CreateStudentAssessmentDto) {
    console.log(dto.testPointers);
    // Create a new StudentAssessment entity
    const StudentAssessment = await this.AssessmentModel.create({
      userCandidate: userId,
      companyAssessment: dto.companyAssessment,
      job: dto.job,
      testPointers: dto.testPointers,
      AssessmentStartTime: dto.AssessmentStartTime,
      AssessmentExpEndTime: dto.AssessmentExpEndTime,
    });
    return StudentAssessment;

    // now find that doc and return
    // const candidateAssessment = await this.AssessmentModel.findOne({
    //   candidate: userId,
    //   companyAssessment: dto.companyAssessment,
    // });
    // // .populate({
    // //   path: 'mcqs',
    // //   select: '_id title options',
    // // })
    // if (!candidateAssessment) {
    //   throw new NotFoundException('No company assessment found');
    // }

    // console.log(candidateAssessment);
    // return candidateAssessment;
  }
  // async findAll(page?: number, limit?: number) {
  //   let result;

  //   if (page !== undefined && limit !== undefined) {
  //     let skip = (page - 1) * limit;
  //     if (skip < 0) {
  //       skip = 0;
  //     }

  //     result = await this.AssessmentModel.aggregate([
  //       {
  //         $facet: {
  //           assessments: [{ $skip: skip }, { $limit: +limit }],
  //           totalDocs: [{ $count: 'count' }],
  //         },
  //       },
  //     ]);
  //   } else {
  //     result = await this.AssessmentModel.aggregate([
  //       {
  //         $facet: {
  //           assessments: [],
  //           totalDocs: [{ $count: 'count' }],
  //         },
  //       },
  //     ]);
  //   }
  //   const assessments = result[0].assessments;
  //   const totalDocs =
  //     result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

  //   return {
  //     assessments: assessments,
  //     total: totalDocs,
  //   };
  // }

  // async findByassessmentId(assessmentId: string, page?: number, limit?: number) {
  //   let result;
  //   const matchStage: any = {
  //     exam: new mongoose.Types.ObjectId(assessmentId),
  //   };

  //   const lookup1 = {
  //     $lookup: {
  //       from: 'users', // collection named from which lookup
  //       localField: 'candidate', // collection field to be lookup from other
  //       foreignField: '_id',
  //       as: 'candidateInfo',
  //       pipeline: [{ $project: { name: 1, email: 2 } }], // fields to populate
  //     },
  //   };
  //   const lookup2 = {
  //     $lookup: {
  //       from: 'exams',
  //       localField: 'exam',
  //       foreignField: '_id',
  //       as: 'examInfo',
  //       pipeline: [{ $project: { title: 1 } }],
  //     },
  //   };

  //   if (page !== undefined && limit !== undefined) {
  //     let skip = (page - 1) * limit;
  //     if (skip < 0) {
  //       skip = 0;
  //     }

  //     result = await this.AssessmentModel.aggregate([
  //       {
  //         $facet: {
  //           assessments: [
  //             { $match: matchStage },
  //             lookup1,
  //             lookup2,
  //             { $skip: skip },
  //             { $limit: +limit },
  //           ],
  //           totalDocs: [{ $match: matchStage }, { $count: 'count' }],
  //         },
  //       },
  //     ]);
  //   } else {
  //     result = await this.AssessmentModel.aggregate([
  //       {
  //         $facet: {
  //           assessments: [{ $match: matchStage }, lookup1, lookup2],
  //           totalDocs: [{ $match: matchStage }, { $count: 'count' }],
  //         },
  //       },
  //     ]);
  //   }

  //   const assessments = result[0].assessments;
  //   const totalDocs =
  //     result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

  //   return {
  //     assessments: assessments,
  //     total: totalDocs,
  //   };
  // }

  // async findByExamsWithPagination(exams: any[], page?: number, limit?: number) {
  //   let assessments: any = [];
  //   let totalDocs = 0;
  //   const lookup1 = {
  //     $lookup: {
  //       from: 'users', // collection named from which lookup
  //       localField: 'candidate', // collection field to be lookup from other
  //       foreignField: '_id',
  //       as: 'candidateInfo',
  //       pipeline: [{ $project: { name: 1, email: 2 } }],
  //     },
  //   };
  //   const lookup2 = {
  //     $lookup: {
  //       from: 'exams',
  //       localField: 'exam',
  //       foreignField: '_id',
  //       as: 'examInfo',
  //       pipeline: [{ $project: { title: 1 } }],
  //     },
  //   };

  //   if (page !== undefined && limit !== undefined) {
  //     let skip = (page - 1) * limit;
  //     if (skip < 0) {
  //       skip = 0;
  //     }

  //     for (const exam of exams) {
  //       const assessmentId = new mongoose.Types.ObjectId(exam._id);

  //       const matchStage: any = {
  //         exam: {
  //           $in: [assessmentId],
  //         },
  //       };

  //       const result = await this.AssessmentModel.aggregate([
  //         {
  //           $facet: {
  //             assessments: [
  //               { $match: matchStage },
  //               lookup1,
  //               lookup2,
  //               { $skip: skip },
  //               { $limit: +limit },
  //             ],
  //             totalDocs: [{ $match: matchStage }, { $count: 'count' }],
  //           },
  //         },
  //       ]);

  //       assessments = assessments.concat(result[0].assessments);
  //       totalDocs +=
  //         result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
  //     }
  //   }

  //   return {
  //     allAssessments: assessments,
  //     total: totalDocs,
  //   };
  // }

  // async findByExams(exams: any[]) {
  //   let assessments: any = [];
  //   let totalDocs = 0;
  //   const lookup1 = {
  //     $lookup: {
  //       from: 'users', // collection named from which lookup
  //       localField: 'candidate', // collection field to be lookup from other
  //       foreignField: '_id',
  //       as: 'candidateInfo',
  //       pipeline: [{ $project: { name: 1, email: 2 } }],
  //     },
  //   };
  //   const lookup2 = {
  //     $lookup: {
  //       from: 'exams',
  //       localField: 'exam',
  //       foreignField: '_id',
  //       as: 'examInfo',
  //       pipeline: [{ $project: { title: 1 } }],
  //     },
  //   };

  //   for (const exam of exams) {
  //     const assessmentId = new mongoose.Types.ObjectId(exam._id);

  //     const matchStage: any = {
  //       exam: {
  //         $in: [assessmentId],
  //       },
  //     };

  //     const result = await this.AssessmentModel.aggregate([
  //       {
  //         $facet: {
  //           assessments: [{ $match: matchStage }, lookup1, lookup2],
  //           totalDocs: [{ $match: matchStage }, { $count: 'count' }],
  //         },
  //       },
  //     ]);

  //     assessments = assessments.concat(result[0].assessments);
  //     totalDocs +=
  //       result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
  //   }

  //   return {
  //     allAssessments: assessments,
  //     total: totalDocs,
  //   };
  // }

  // async findTestByCandidate(userId: string, page?: number, limit?: number) {
  //   let result;
  //   const matchStage: any = {
  //     candidate: new mongoose.Types.ObjectId(userId),
  //     'testPointer.isFinished': true,
  //   };
  //   const lookup = {
  //     $lookup: {
  //       from: 'exams', // collection named from which lookup
  //       localField: 'exam', // collection field to be lookup from other
  //       foreignField: '_id',
  //       as: 'examInfo',
  //     },
  //   };

  //   if (page !== undefined && limit !== undefined) {
  //     let skip = (page - 1) * limit;
  //     if (skip < 0) {
  //       skip = 0;
  //     }

  //     result = await this.AssessmentModel.aggregate([
  //       {
  //         $facet: {
  //           applications: [
  //             { $match: matchStage },
  //             lookup,
  //             { $skip: skip },
  //             { $limit: +limit },
  //           ],
  //           totalDocs: [{ $match: matchStage }, { $count: 'count' }],
  //         },
  //       },
  //     ]);
  //   } else {
  //     result = await this.AssessmentModel.aggregate([
  //       {
  //         $facet: {
  //           applications: [{ $match: matchStage }, lookup],
  //           totalDocs: [{ $match: matchStage }, { $count: 'count' }],
  //         },
  //       },
  //     ]);
  //   }

  //   const applications = result[0].applications;
  //   const totalDocs =
  //     result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

  //   return {
  //     applications: applications,
  //     total: totalDocs,
  //   };
  // }

  // async testResult(id: string) {
  //   return this.AssessmentModel.findById(id);
  // }

  // findOne(id: string) {
  //   return this.AssessmentModel.findById(id);
  // }

  // async assessmentReport(candId: string, jobId: string) {
  //   const assessment = await this.AssessmentModel.findOne({
  //     candidate: candId,
  //     job: jobId,
  //   });

  //   if (!assessment) {
  //     throw new NotFoundException('Assessment not found');
  //   }

  //   // const matchStage = {
  //   //   candidate: new mongoose.Types.ObjectId(candId),
  //   //   job: new mongoose.Types.ObjectId(jobId),
  //   // };
  //   // const lookupJobs = {
  //   //   $lookup: {
  //   //     from: 'jobs',
  //   //     localField: 'job',
  //   //     foreignField: '_id',
  //   //     as: 'jobDetail',
  //   //     pipeline: [{ $project: { title: 1 } }],
  //   //   },
  //   // };
  //   // const result = await this.AssessmentModel.aggregate([
  //   //   { $match: matchStage },
  //   //   // {
  //   //   //   $facet: {
  //   //   //     tags: [lookupJobs],
  //   //   //   },
  //   //   // },
  //   // ]);
  //   // return result;
  //   return assessment;
  // }

  // async update(userId: string, assessmentId: string, dto: any) {
  //   // Calculate percentage
  //   function calculatePercentage(StudentAssessment: any) {
  //     const totalMCQs = StudentAssessment.mcqs.length;
  //     const totalCodings = StudentAssessment.codings.length;
  //     const totalPossiblePoints = totalMCQs + totalCodings;

  //     const pointsEarned = StudentAssessment.testPointer.points;
  //     const percentage = (pointsEarned / totalPossiblePoints) * 100;

  //     return percentage;
  //   }
  //   // Function to calculate individualTime
  //   function calculateIndividualTime(
  //     totalTime: number,
  //     remainingTime: number,
  //   ): number {
  //     // ): number[] {
  //     console.log('totalTime', totalTime);
  //     console.log('remainingTime', remainingTime);
  //     const individualTime = totalTime - remainingTime;
  //     console.log('individualTime', individualTime);
  //     return individualTime;
  //     // return [individualTime];
  //   }
  //   // Find the StudentAssessment by exam ID and candidate userId
  //   const StudentAssessment = await this.AssessmentModel.findOne({
  //     exam: assessmentId,
  //     candidate: userId,
  //   })
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

  //   // console.log('StudentAssessment', StudentAssessment);

  //   if (!StudentAssessment) {
  //     throw new NotFoundException(
  //       `StudentAssessment with exam ID ${assessmentId} not found`,
  //     );
  //   }

  //   if (
  //     StudentAssessment &&
  //     StudentAssessment.testPointer.isFinished == true
  //   ) {
  //     return {
  //       isFinished: true,
  //     };
  //   }

  //   const { testPointer } = StudentAssessment;
  //   const { job } = StudentAssessment;
  //   const jobId = job.toString();
  //   console.log('job', job);
  //   console.log('jobId', jobId);

  //   // Get the current index from the testPointer
  //   let currentIndex = testPointer.index;

  //   let nextQuestion;

  //   // console.log('testpointer', testPointer);

  //   // Save the answer to the respective array based on activeMcqs or activeCoding
  //   if (testPointer.activeMcqs == true) {
  //     // check answer of mcq to the correct options
  //     // get mcq from bank to check
  //     const mcq = await this.McqModel.findById(
  //       dto.question.questionId,
  //     ).populate('correctOption');
  //     // console.log(mcq?.correctOption);

  //     // now check and set

  //     if (mcq) {
  //       const isCorrect = mcq.correctOption === dto.question.answer;
  //       // console.log(isCorrect);
  //       // Add the question to mcqQuestions with the correct property
  //       const mcqQuestion = {
  //         questionId: mcq._id,
  //         answer: dto.question.answer,
  //         correct: isCorrect, // Set correct based on the comparison
  //       };
  //       // call percentage function
  //       const percentage = calculatePercentage(StudentAssessment);
  //       // console.log("Candidate Percentage:", percentage);
  //       StudentAssessment.testPointer.obtainPercentage = percentage;

  //       StudentAssessment.mcqQuestions = [
  //         ...StudentAssessment.mcqQuestions,
  //         mcqQuestion,
  //       ];

  //       // Update points if the answer is correct
  //       if (isCorrect) {
  //         StudentAssessment.testPointer.points += 1;
  //       }
  //     }
  //   } else if (testPointer.activeCoding == true) {
  //     // code for compiler results
  //     // get coding question from question id
  //     // console.log(dto.question.questionId);
  //     const question = await this.CodingModel.findById(dto.question.questionId);
  //     // // console.log("dto.question.questionId", dto.question.questionId);
  //     // // console.log('question', question);
  //     if (!question) {
  //       throw new NotFoundException('Question not found');
  //     }
  //     // just save the answer into codingQuestions array
  //     const codingQuestion = {
  //       questionId: question._id,
  //       answer: dto.question.answer,
  //       correct: false,
  //     };
  //     StudentAssessment.codingQuestions = [
  //       ...StudentAssessment.codingQuestions,
  //       codingQuestion,
  //     ];
  //   }

  //   // check for time if time is reached then END paper
  //   // consumedTime >= totalTime
  //   if (testPointer.totalTime - dto.remainingTime >= testPointer.totalTime) {
  //     testPointer.index = 0;
  //     testPointer.activeCoding = false;
  //     testPointer.activeMcqs = false;
  //     testPointer.isFinished = true;
  //     testPointer.totalTime = 0;
  //     testPointer.remainingTime = 0;
  //     // Save the updated StudentAssessment entity
  //     await StudentAssessment.save();

  //     // update status in candidateApplication

  //     // TODO
  //     await this.applicationStatusUpdate(userId, jobId);
  //     return {
  //       isFinished: true,
  //     };
  //   }
  //   // console.log("testPointer", testPointer);

  //   // now to send next question
  //   if (testPointer.activeMcqs) {
  //     // if length exceeds then move to coding question array
  //     if (currentIndex >= StudentAssessment.mcqs.length) {
  //       // check if there is coding questions then send wrna end exam
  //       if (StudentAssessment.codings.length == 0) {
  //         // Save the updated StudentAssessment entity
  //         await StudentAssessment.save();

  //         // TODO
  //         await this.applicationStatusUpdate(userId, jobId);
  //         return {
  //           isFinished: true,
  //         };
  //       }
  //       testPointer.index = 0;
  //       testPointer.activeCoding = true;
  //       testPointer.activeMcqs = false;
  //       testPointer.isFinished = false;
  //       // testPointer.totalTime = 0;

  //       // get first question from codings array and send to user
  //       currentIndex = 0;
  //       console.log('currentIndex::', currentIndex);
  //       nextQuestion = StudentAssessment.codings[currentIndex];
  //       console.log('nextQuestion::', nextQuestion);
  //       testPointer.index += 1;
  //       // TODO: time taken

  //       let TotalTime;
  //       if ((testPointer.index = 1)) {
  //         TotalTime = testPointer.totalTime;
  //       } else {
  //         // TotalTime =
  //         //   testPointer.individualTime[testPointer.individualTime.length - 1];
  //         TotalTime = testPointer.remainingTime;
  //       }

  //       // Calculate individualTime and update totalTime
  //       const individualTime = calculateIndividualTime(
  //         TotalTime,
  //         dto.remainingTime,
  //       );
  //       testPointer.individualTime.push(individualTime); // Store individualTime for the current question

  //       console.log('individualTime:1', individualTime);
  //       console.log(
  //         'individualTime.push',
  //         testPointer.individualTime.push(individualTime),
  //       );

  //       testPointer.remainingTime = dto.remainingTime;

  //       // console.log(StudentAssessment.codings);
  //       // console.log('This is next question.....', nextQuestion);

  //       // Save the updated StudentAssessment entity
  //       await StudentAssessment.save();
  //       console.log('first se gya mcqs response....', nextQuestion);
  //       return {
  //         question: nextQuestion,
  //         isFinished: false,
  //         isCodingQuestion: true,
  //       };
  //     }

  //     nextQuestion = StudentAssessment.mcqs[currentIndex];
  //     testPointer.index += 1;
  //     testPointer.remainingTime = dto.remainingTime;
  //     // TODO: time taken
  //     let TotalTime;
  //     if ((testPointer.index = 1)) {
  //       TotalTime = testPointer.totalTime;
  //     } else {
  //       // TotalTime =
  //       //   testPointer.individualTime[testPointer.individualTime.length - 1];
  //       TotalTime = testPointer.remainingTime;
  //     }

  //     // Calculate individualTime and update totalTime
  //     const individualTime = calculateIndividualTime(
  //       TotalTime,
  //       dto.remainingTime,
  //     );
  //     testPointer.individualTime.push(individualTime); // Store individualTime for the current question

  //     console.log('individualTime:CQ', individualTime);
  //     console.log(
  //       'individualTime.push:CQ',
  //       testPointer.individualTime.push(individualTime),
  //     );

  //     // Save the updated StudentAssessment entity
  //     await StudentAssessment.save();
  //     console.log('second se gya response....', nextQuestion);
  //     return {
  //       question: nextQuestion,
  //       isCodingQuestion: false,
  //       isFinished: false,
  //     };
  //   } else if (testPointer.activeCoding) {
  //     // if coding array length reaches, end paper
  //     if (currentIndex >= StudentAssessment.codings.length) {
  //       // loop through StudentAssessment.codingQuestions, from in it get question from db, call compiler with answer, and if true then update array with that question and set correct = true otherwise correct = false

  //       const updatedQuestions = await Promise.all(
  //         StudentAssessment.codingQuestions.map(async (question) => {
  //           const questionFound = await this.CodingModel.findById(
  //             question.questionId,
  //           );

  //           if (!questionFound) {
  //             throw new NotFoundException('Coding Question not found');
  //           }

  //           // convert question into desired format
  //           function transformData(originalData: any, dto: any) {
  //             const organizedData = {
  //               test: '1',
  //               language: questionFound?.language,
  //               executionMode: 'code',
  //               code: dto.answer,
  //               // code: dto.question.answer.replace(/<p>|<\/p>/g, ''),
  //               stdin: '',
  //               args: '',
  //               functionName: originalData.functionName,
  //               testCases: originalData.testCases.map((testCase: any) => ({
  //                 input: JSON.parse(testCase.input),
  //                 output: testCase.output,
  //               })),
  //             };
  //             return organizedData;
  //           }

  //           const transformedData = transformData(questionFound, question);
  //           //api call from compiler for result
  //           try {
  //             const response = await axios.post(
  //               `${process.env.COMPILER_LINK}`,
  //               transformedData,
  //             );
  //             // console.log('compiler result:', response.data);
  //             if (response.data.stdout == true) {
  //               const codingQuestion = {
  //                 questionId: question.questionId,
  //                 answer: question.answer,
  //                 correct: true,
  //               };
  //               // StudentAssessment.codingQuestions[index] = codingQuestion;
  //               // console.log(StudentAssessment.codingQuestions[index]);
  //               StudentAssessment.testPointer.points += 1;
  //               // TODO marks on basis of difficulty level
  //               // if ((question.difficultyLevel = "easy")) {
  //               //   StudentAssessment.testPointer.points += 0.5;
  //               // } else if ((question.difficultyLevel = "medium")) {
  //               //   StudentAssessment.testPointer.points += 1;
  //               // } else if ((question.difficultyLevel = "hard")) {
  //               //   StudentAssessment.testPointer.points += 3;
  //               // }
  //               // StudentAssessment.testPointer.points += 1;
  //               // call percentage function
  //               const percentage = calculatePercentage(StudentAssessment);
  //               StudentAssessment.testPointer.obtainPercentage = percentage;
  //               return codingQuestion;
  //               // await StudentAssessment.save();
  //             } else if (response.data.stdout == false) {
  //               const codingQuestion = {
  //                 questionId: question.questionId,
  //                 answer: question.answer,
  //                 correct: false,
  //               };
  //               return codingQuestion;
  //             }
  //           } catch (error) {
  //             throw new InternalServerErrorException(error);
  //           }
  //         }),
  //       );
  //       // console.log('updated questions are', updatedQuestions);
  //       StudentAssessment.codingQuestions = updatedQuestions as {
  //         questionId: string;
  //         answer: string;
  //         correct?: boolean;
  //       }[];

  //       // now ending the paper
  //       testPointer.index = 0;
  //       testPointer.activeCoding = false;
  //       testPointer.activeMcqs = false;
  //       testPointer.isFinished = true;
  //       testPointer.totalTime = 0;
  //       testPointer.remainingTime = 0;
  //       // TODO: time taken
  //       // Calculate individualTime and update totalTime
  //       const individualTime = calculateIndividualTime(
  //         testPointer.totalTime,
  //         dto.remainingTime,
  //       );
  //       // testPointer.individualTime = individualTime;
  //       testPointer.individualTime.push(individualTime);

  //       console.log('individualTime:2', individualTime);
  //       console.log(
  //         'individualTime.push:2',
  //         testPointer.individualTime.push(individualTime),
  //       );
  //       // Save the updated StudentAssessment entity
  //       await StudentAssessment.save();
  //       // console.log(StudentAssessment.codingQuestions);

  //       // TODO
  //       await this.applicationStatusUpdate(userId, jobId);
  //       return {
  //         isFinished: true,
  //       };
  //     }
  //     currentIndex = testPointer.index;
  //     nextQuestion = StudentAssessment.codings[currentIndex];
  //     testPointer.index += 1;
  //     // TODO: time taken

  //     testPointer.remainingTime = dto.remainingTime;
  //     // Save the updated StudentAssessment entity
  //     await StudentAssessment.save();
  //     console.log('third se gya response....', nextQuestion);
  //     return {
  //       question: nextQuestion,
  //       isCodingQuestion: true,
  //       isFinished: false,
  //     };
  //   } else {
  //     testPointer.index = 0;
  //     testPointer.activeCoding = false;
  //     testPointer.activeMcqs = false;
  //     testPointer.isFinished = true;
  //     testPointer.totalTime = 0;
  //     testPointer.remainingTime = 0;
  //     // Save the updated StudentAssessment entity
  //     await StudentAssessment.save();
  //     // TODO
  //     await this.applicationStatusUpdate(userId, jobId);
  //     return {
  //       isFinished: true,
  //     };
  //   }
  // }

  async update(
    userId: string,
    assessmentId: string,
    dto: UpdateStudentAssessmentDto,
  ) {
    // Calculate percentage
    function calculatePercentage(StudentAssessment: any) {
      const totalMCQs = StudentAssessment.mcqs.length;
      const totalCodings = StudentAssessment.codings.length;
      const totalPossiblePoints = totalMCQs + totalCodings;

      const pointsEarned = StudentAssessment.testPointer.points;
      const percentage = (pointsEarned / totalPossiblePoints) * 100;

      return percentage;
    }
    function calculateIndividualTime(totalTime: any, remainingTime: any) {
      const individualTime = totalTime - remainingTime;
      return individualTime;
    }
    // Find the StudentAssessment by company assessment ID and userCandidate
    const StudentAssessment = await this.AssessmentModel.findOne({
      companyAssessment: assessmentId,
      userCandidate: userId,
    }).populate({
      path: 'testPointers.questAnswers.questSchemas',
      // model: 'questSchemas',|||
    });

    // console.log('StudentAssessment', StudentAssessment);

    if (!StudentAssessment) {
      throw new NotFoundException(
        `StudentAssessment with assessment ID ${assessmentId} not found`,
      );
    }
    return StudentAssessment;
  }

  async findOne(assessmentId: string) {
    const assessmentFound = await this.AssessmentModel.findById(assessmentId)
      .populate({
        path: 'testPointers',
        populate: {
          path: 'testId',
          select:
            'testName totalTime testType language tag createdBy type description compositionEasy compositionMedium compositionHard',
        },
      })
      .populate({ path: 'companyAssessment' });

    if (!assessmentFound) throw new NotFoundException('Assessment not found');
    return assessmentFound;
  }
  async findStudentAssessment(
    jobId: string,
    companyAssessmentid: string,
    userid: string,
  ) {
    const assessmentFound = await this.AssessmentModel.findOne({
      userCandidate: userid,
      companyAssessment: companyAssessmentid,
      job: jobId,
    }).populate({
      path: 'testPointers.testId',
      select:
        'testName testType totalTime compositionEasy compositionMedium compositionHard',
    });
    if (!assessmentFound) {
      throw new BadRequestException(`Assessment not found`);
    }
    return assessmentFound;
  }

  // async checkProgress(assessmentId: string) {
  //   // Find the assessment based on the provided ID
  //   const assessment = await this.AssessmentModel.findById(assessmentId)
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

  //   if (!assessment) {
  //     throw new NotFoundException('Assessment not found');
  //   }

  //   // Check if the assessment is finished
  //   if (assessment.testPointer.isFinished) {
  //     return { isFinished: true };
  //   }

  //   // Check if the number of attempts is greater than 2
  //   if (assessment.testPointer.attempts > 2) {
  //     // Finish the test
  //     assessment.testPointer.index = 0;
  //     assessment.testPointer.activeCoding = false;
  //     assessment.testPointer.activeMcqs = false;
  //     assessment.testPointer.isFinished = true;
  //     assessment.testPointer.totalTime = 0;
  //     assessment.testPointer.remainingTime = 0;

  //     // Save the updated assessment
  //     await assessment.save();

  //     return { isFinished: true };
  //   }

  //   // Determine whether to send an MCQ or a coding question based on the testPointer
  //   let nextQuestion;
  //   let currentIndex;
  //   if (assessment.testPointer.activeMcqs) {
  //     // Get the next MCQ question
  //     // if index is 0 then send question at index 0, else send question at previous index
  //     if (assessment.testPointer.index == 0) {
  //       currentIndex = assessment.testPointer.index;
  //     } else {
  //       currentIndex = assessment.testPointer.index - 1;
  //     }

  //     nextQuestion = assessment.mcqs[currentIndex];
  //     // Increment the attempts
  //     assessment.testPointer.attempts++;
  //     console.log('attempts++>>>!', assessment.testPointer.attempts++);

  //     // Increment the index for the next question
  //     assessment.testPointer.index = currentIndex + 1;

  //     // Save the updated assessment
  //     await assessment.save();
  //     return {
  //       question: nextQuestion,
  //       isCodingQuestion: false,
  //       isFinished: false,
  //     };
  //   } else if (assessment.testPointer.activeCoding) {
  //     // Get the next coding question
  //     // if index is 0 then send question at index 0, else send question at previous index
  //     if (assessment.testPointer.index == 0) {
  //       currentIndex = assessment.testPointer.index;
  //     } else {
  //       currentIndex = assessment.testPointer.index - 1;
  //     }
  //     nextQuestion = assessment.codings[currentIndex];
  //     // Increment the attempts
  //     assessment.testPointer.attempts++;
  //     console.log('attempts++>>>!!!', assessment.testPointer.attempts++);

  //     // Increment the index for the next question
  //     assessment.testPointer.index = currentIndex + 1;

  //     // Save the updated assessment
  //     await assessment.save();
  //     return {
  //       question: nextQuestion,
  //       isCodingQuestion: true,
  //       isFinished: false,
  //     };
  //   }

  //   // If there are no more questions, finish test
  //   assessment.testPointer.index = 0;
  //   assessment.testPointer.activeCoding = false;
  //   assessment.testPointer.activeMcqs = false;
  //   assessment.testPointer.isFinished = true;
  //   assessment.testPointer.totalTime = 0;
  //   assessment.testPointer.remainingTime = 0;

  //   // Save the updated assessment
  //   await assessment.save();

  //   return { isFinished: true };
  // }

  // remove(id: string) {
  //   return this.AssessmentModel.findByIdAndRemove(id);
  // }

  // findStudentAssessment(userid: string, assessmentId: string, jobId: string) {
  //   return this.AssessmentModel.findOne({
  //     candidate: userid,
  //     exam: assessmentId,
  //     job: jobId,
  //   });
  // }
}
