// import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
// import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';
// import { QuestionType } from './create-student-assessment.dto';

// export class UpdateCandidateAssessment {
//   // @ApiProperty({
//   //   description: 'The ID of the exam',
//   // })
//   // @IsNotEmpty()
//   // @IsString()
//   // exam: string;

//   @ApiProperty({
//     description: 'The Remaining time of the exam',
//   })
//   @IsNotEmpty()
//   @IsNumber()
//   remainingTime: number;

//   @ApiProperty({
//     description: 'The answer to the question',
//   })
//   @IsNotEmpty()
//   @IsObject()
//   question: QuestionType;

//   // @ApiProperty({
//   //   description: 'The mcq Question ids and answers',
//   // })
//   // @IsObject({ each: true })
//   @ApiHideProperty()
//   mcqQuestions: {
//     questionId: string;
//     answer: string;
//     correct: boolean;
//   }[];

//   // @ApiProperty({
//   //   description: 'The coding Question ids and answers',
//   // })
//   // @IsObject({ each: true })
//   @ApiHideProperty()
//   codingQuestions: {
//     questionId: string;
//     answer: string;
//     correct: boolean;
//   }[];

//   // @ApiProperty({
//   //   description: 'The testPointer for assessment',
//   // })
//   @ApiHideProperty()
//   testPointer: {
//     index: number;
//     // mcqtimeLeft: number;
//     activeMcqs: boolean;
//     activeCoding: boolean;
//     // codingtimeLeft: number;
//     isFinished: boolean;
//     attempts: number;
//     points: number;
//     obtainPercentage: number;
//     remainingTime: number;
//     individualTime: [0];
//   };
// }
