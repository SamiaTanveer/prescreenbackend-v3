import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateProjectDto } from 'src/Projects/dto/create-project';
import {
  CreateManualTestDto,
  CreateTestDto,
} from 'src/Test/dto/CreateTest.dto';
import { Test } from 'src/Test/entities/Test.entity';
import { CreateBenefitDto } from 'src/benefits/dto/create-benefit.dto';
import { UpdateCandidateDto } from 'src/candidate/dto/update-candidate.dto';
import { CreateCategoryDto } from 'src/categories/dto/create-category.dto';
import { TestCase } from 'src/coding-question/dto/create-coding-question.dto';
import { UpdateCompanyyDto } from 'src/company/dto/updatecompany.dto';
import { ExamCodingQuestion } from 'src/exam/dto/ExamCodingQuestion.dto';
import { ExamMcqQuestion } from 'src/exam/dto/ExamMcqQuestion.dto';
import { Difficulty } from 'src/exam/dto/create-exam.dto';
import { ExamDto } from 'src/exam/dto/exam.dto';
import { CreateJobDto, CreatedBY } from 'src/job/dto/create-job.dto';
import { UpdateSkillDto } from 'src/skills/dto/update-skil.dto';
import { TestPointerDto } from 'src/student-assessment/dto/create-student-assessment.dto';
import { StudentAssessment } from 'src/student-assessment/entities/student-assessment.entity';
import { CreateSubscriptionPlanDto } from 'src/subscription-plan/dto/create-subscription-plan.dto';
import { CreateTagDto, TagsAnalytics } from 'src/tag/dto/create-tag.dto';
import { CreateUserDto } from 'src/user/dto/create_user.dto';

export class QuestionObj {
  @ApiProperty()
  easy: { count: DifficultyCount };
  @ApiProperty()
  medium: { count: DifficultyCount };
  @ApiProperty()
  hard: { count: DifficultyCount };
}
export class StartTestObj {
  @ApiProperty()
  testId: string;
  // @ApiProperty()
  // comAssessmentId: string;
  @ApiProperty()
  studentAssessment: string;
}
export class GetAnswerObj {
  @ApiPropertyOptional({ type: String })
  questionId?: string;
  @ApiPropertyOptional({ type: String })
  answer?: string;
  @ApiProperty({ type: String })
  studentAssessment: string;
  @ApiProperty({ type: String })
  testId: string;
  @ApiPropertyOptional({ type: Date })
  clientTime?: Date;
}
export const TestStatuses = {
  notStarted: 'notStarted',
  resume: 'resume',
  completed: 'completed',
};
export class PopulatedTest extends TestPointerDto {
  @ApiProperty()
  testId: Test;
  // @ApiProperty()
  // index: number;
}

export class examObj {
  @ApiProperty()
  totalTime: number;
  @ApiProperty()
  totalQuestions: number;
}

export class AssessementStatsRefreshResponse {
  @ApiProperty()
  exam: examObj;
  @ApiProperty()
  attempts: number;
  @ApiProperty()
  timeRemaining: number;
}

export class DifficultyCount {
  @ApiProperty()
  count: number;
}

export class Picture {
  @ApiProperty()
  url: string;
  @ApiProperty()
  path: string;
  @ApiProperty()
  originalname: string;
}

export class CandidateObj {
  @ApiProperty({
    example: 'john Doe',
    description: 'The name of the candidate',
  })
  name: string;

  @ApiProperty({
    example: 'Pakistani',
    description: 'nationality of candidate',
  })
  nationality: string;

  @ApiProperty({
    description: 'The portfolio link of the candidate',
  })
  portfolioSite: string;

  @ApiProperty({
    description: 'The linkedin profile link of the candidate',
  })
  linkedin: string;

  @ApiProperty({
    example: 'johnDoe@xyz.abc',
    description: 'The email of the candidate',
  })
  email: string;

  @ApiProperty({
    example: '+923008648940',
    description: 'The phone number of the candidate',
  })
  phone: string;

  @ApiProperty({ example: 'male', description: 'The gender of the candidate' })
  gender: string;

  @ApiProperty({
    example: 'thisispassword',
    description: 'The password of the candidate',
  })
  password: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty({
    description: 'Candidate Avatar',
    type: Picture,
  })
  avatar: Picture;

  @ApiProperty({
    description: 'Candidate CvUrl',
    type: Picture,
  })
  cvUrl: Picture;

  @ApiProperty({
    description: 'Candidate CoverLetter',
    type: Picture,
  })
  coverLetterUrl: Picture;
}

export class CandidateAdminAnalytics extends CandidateObj {
  @ApiProperty({
    example: '0',
    description: 'number of applied jobs',
  })
  jobCount: number;
  @ApiProperty({
    example: '0',
    description: 'number of sent assessments links ',
  })
  examInvitesCount: number;
  @ApiProperty({
    example: '0',
    description: 'number of assessments attempts',
  })
  testCount: number;
}

export class message {
  @ApiProperty({
    description: 'Message according to success',
  })
  message: string;
}

export class OtpTime {
  @ApiProperty({
    example: 232444,
    description: 'The time remaining',
  })
  otpTime: number;
}

export class OtpTimeMessage {
  @ApiProperty({
    example: 'Please check your email for Otp',
    description: 'Email sent',
  })
  message: string;

  @ApiProperty({
    example: 232444,
    description: 'The time remaining',
  })
  otpTime: number;
}

export class userToSend {
  @ApiProperty({
    description: 'The name of the user',
  })
  name: string;
  @ApiProperty({
    description: 'The email of the user',
  })
  email: string;
  @ApiProperty({
    description: 'The id of the user',
  })
  userId: string;
  @ApiProperty({
    description: 'The user type of the user',
  })
  type: string;
}

export class LoginResponse {
  @ApiProperty({
    description: 'The user who logs in',
  })
  user: userToSend;

  @ApiProperty({
    description: 'The token for the user',
  })
  token: string;
}

export class Template {
  @ApiProperty()
  templateLanguage: string;

  @ApiProperty()
  template: string;
}

export class paginationDto {
  @IsOptional()
  @ApiPropertyOptional({ type: Number, example: 1 })
  page?: number;

  @IsOptional()
  @ApiPropertyOptional({ type: Number, example: 6 })
  limit?: number;
}

export class allApplicationsOfCompanyDto {
  @IsOptional()
  @ApiPropertyOptional({ type: Number, example: 1 })
  page?: number;

  @IsOptional()
  @ApiPropertyOptional({ type: Number, example: 6 })
  limit?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'name: asc or stage: desc or appliedDate: asc',
  })
  @IsOptional()
  sort?: string;
}

export class SortingDto {
  @ApiPropertyOptional({ type: String, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  language?: string;
  @ApiPropertyOptional({ type: String, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  title?: string;
}

// TODO: set correct fields accordingly
export class stuAssessmentDto extends paginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;
  @ApiPropertyOptional({ type: String, example: 'title:asc or title:desc' })
  @IsOptional()
  sort?: string;
}

export class McqPaginationDto extends paginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;
  @ApiPropertyOptional({ type: String, example: 'title:asc or title:desc' })
  @IsOptional()
  sort?: string;
}

export class QuestPaginationDto extends paginationDto {
  @ApiProperty()
  @IsString()
  type?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(['easy', 'medium', 'hard', ''])
  difficulty?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(['you', 'library', ''])
  createdBy?: string;
  // @ApiPropertyOptional({ type: String, example: 'title:asc or title:desc' })
  // @IsOptional()
  // sort?: string;
}

export class SubscriptionPlanDto extends paginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  coupon?: string;
  @ApiPropertyOptional()
  @IsOptional()
  isActive?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // @IsEnum(['you', 'library', ''])
  // createdBy?: string;
  @ApiPropertyOptional({ type: String, example: 'title:asc or title:desc' })
  @IsOptional()
  sort?: string;
}

export class QuestAdminPaginationDto extends paginationDto {
  @ApiProperty()
  @IsString()
  type?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(['easy', 'medium', 'hard', ''])
  difficulty?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(['you', 'companies', ''])
  createdBy?: string;
  // @ApiPropertyOptional({ type: String, example: 'title:asc or title:desc' })
  // @IsOptional()
  // sort?: string;
}

export class ExamPaginationDto extends paginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;
  @ApiPropertyOptional({ type: String, example: 'title:asc or title:desc' })
  @IsOptional()
  sort?: string;
}

export class CompanyAssessmentPaginationDto extends paginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  test?: string;
  @ApiPropertyOptional({
    type: String,
    example:
      'name:asc or name:desc, createdBy: asc, createdAt: asc, title: desc',
  })
  @IsOptional()
  sort?: string;
}

export class CodingPaginationDto extends paginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;
  @ApiPropertyOptional({ type: String, example: 'title:asc or title:desc' })
  @IsOptional()
  sort?: string;
}

export class jobPaginationDto extends paginationDto {
  @ApiProperty({
    description: 'Job status',
  })
  @IsOptional()
  @ApiPropertyOptional()
  jobStatus?: string;

  @ApiProperty({
    description: 'job name',
  })
  @IsOptional()
  @ApiPropertyOptional()
  title?: string;

  @ApiProperty({
    description: 'jobType -- full-time, part-time, remote',
  })
  @IsOptional()
  @IsEnum(['full-time', 'part-time', 'remote', 'internship', 'contract'])
  @ApiPropertyOptional()
  jobType?: string;

  @ApiProperty({
    example: '',
    description:
      'title: asc or dueDate: desc or datePosted: desc or jobType: desc',
  })
  @ApiPropertyOptional()
  @IsOptional()
  sort?: string;
}

export class feedbackPaginationDto extends paginationDto {
  @ApiProperty({
    example: '',
    description: 'comments',
  })
  @IsOptional()
  @ApiPropertyOptional()
  comments?: string;
  @ApiProperty({
    example: 3,
    description: 'rating',
  })
  @IsOptional()
  @ApiPropertyOptional()
  rating?: number;
  @ApiPropertyOptional({ type: String, example: 'rating:asc or rating:desc' })
  @IsOptional()
  sort?: string;
}

export class tagsPaginationDto extends paginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
  @ApiPropertyOptional({ type: String, example: 'title:asc or title:desc' })
  @IsOptional()
  sort?: string;
}

export class candidateApplicationPaginationDto extends paginationDto {
  @ApiPropertyOptional({ example: 'accept |Interviewing | hired | rejected' })
  @IsOptional()
  @IsString()
  applicationStatus?: string;
  @ApiPropertyOptional({
    example: 'applied | Pending Assessment | view result| rejected',
  })
  @IsOptional()
  @IsString()
  candidateStatus?: string;
  // @ApiPropertyOptional({ type: String, example: 'title:asc or title:desc' })
  // @IsOptional()
  // sort?: string;
}

export class TagsResponseDto {
  @ApiProperty({ type: [CreateTagDto] })
  allTags: CreateTagDto[];
  @ApiProperty({ type: Number })
  total: number;
}
export class ProjectRes {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  liveUrl: string;

  @ApiProperty()
  projectPic: Picture;

  @ApiProperty()
  skillsUsed: string[];

  @ApiProperty()
  user: string;
}
export class ProjectsResponseDto {
  @ApiProperty({ type: [ProjectRes] })
  projects: ProjectRes[];
  @ApiProperty({ type: Number })
  total: number;
}

export class StudentAssessmentResponse {
  @ApiProperty({ type: [StudentAssessment] })
  assessment: StudentAssessment[];
  @ApiProperty({ type: Number })
  totalExamTime: number;
}

export class TagsAnalyticsDto {
  @ApiProperty({ type: [TagsAnalytics] })
  allTags: TagsAnalytics[];
  @ApiProperty({ type: Number })
  total: number;
}

export class CodingQuestionResponse {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  questionType: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  title: string;

  @ApiProperty({
    example: 'javascript',
    description: 'The programming language used for the question.',
  })
  @IsOptional()
  language: string;

  @ApiProperty({
    description: 'the template for the given langauge.',
    type: [Template],
  })
  @IsOptional()
  templates: Template[];

  @ApiProperty({
    example: 'calculateSum',
    description: 'The name of the function to be implemented.',
  })
  functionName: string;

  @ApiProperty({
    description: 'tags',
    type: [CreateTagDto],
  })
  tags: CreateTagDto[];

  @ApiProperty({
    example: [{ input: '1', output: '3' }],
    description: 'Test cases for the question in JSON format.',
  })
  // @IsString({ each: true })
  testCases: TestCase[];

  // @ApiProperty({
  //   example: '1213sjdjfj3t318ui489w234',
  //   description: 'The ref id of the company',
  // })
  @ApiHideProperty()
  @IsOptional()
  createdBy: string;

  @ApiProperty({
    example: 'medium',
    description: 'The difficulty Level of the Question',
  })
  @IsOptional()
  difficultyLevel: string;
}

export class ResponseCodingDto {
  @ApiProperty({ type: [CodingQuestionResponse] })
  codingQuestions: CodingQuestionResponse[];

  @ApiProperty({ type: Number })
  total: number;
}

export class MCQResponse {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  questionType: string;

  @ApiProperty()
  description: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'description',
    description: 'extra information for the MCQ',
  })
  question: string;

  @ApiProperty({
    example: ['Option A', 'Option B', 'Option C', 'Option D'],
    description: 'Array of options for the MCQ',
  })
  @IsNotEmpty()
  options: string[];

  @ApiProperty({
    example: 'Option A',
    description: 'The correct option for the MCQ',
  })
  @IsNotEmpty()
  @IsString()
  correctOption: string;

  @ApiProperty({
    example: 'easy',
    description: 'easy, medium or hard',
  })
  @IsNotEmpty()
  @IsString()
  difficultyLevel: string;

  @ApiProperty({
    example: 'JavaScript',
    description: 'Language MCQ falls in',
  })
  @IsNotEmpty()
  language: string;

  @ApiProperty({
    type: String,
    description: 'tag',
  })
  tag: string;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  createdBy: string;
}

export class ResponseMCQDto {
  @ApiProperty({ type: [MCQResponse] })
  mcqQuestions: MCQResponse[];

  @ApiProperty({ type: Number })
  total: number;
}

export class ResponseManualQuestsDto {
  @ApiProperty({ type: [MCQResponse] })
  questions: MCQResponse[];

  @ApiProperty({ type: Number })
  total: number;
}

export class ResponseMcqsQuestionsDto {
  @ApiProperty({ type: [MCQResponse] })
  questions: MCQResponse[];

  @ApiProperty({ type: Number })
  total: number;
}

export class ResponseCodingQuestionsDto {
  @ApiProperty({ type: [CodingQuestionResponse] })
  questions: CodingQuestionResponse[];

  @ApiProperty({ type: Number })
  total: number;
}

export class ResponseQuestionsManDto {
  @ApiProperty({ type: [CodingQuestionResponse] })
  questions: CodingQuestionResponse[];

  @ApiProperty({ type: Number })
  total: number;
}

export class ExamResponse {
  @ApiProperty({
    example: 'this is a id of exam',
    description: 'The id of the Exam.',
  })
  _id: string;

  @ApiProperty({
    example: 'this is a Title',
    description: 'The title of the Exam.',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Sample Description',
    description: 'The description of the Exam.',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '72',
    description: 'The passing percentage for the Exam.',
  })
  passingPercent: number;

  @ApiProperty({
    example: '30',
    description: 'Duration Minutes for Exam.',
  })
  totalTime: number;

  @ApiProperty({
    example: 'Data Structures',
    description: 'Language for Exam.',
  })
  @IsNotEmpty()
  language: string;

  @ApiProperty({
    example: { easy: 5, medium: 10, hard: 12 },
    description: 'easy medium hard',
  })
  mcqDifficultyComposition: Difficulty;

  @ApiProperty({
    example: { easy: 5, medium: 10, hard: 12 },
    description: 'easy or medium or hard',
  })
  codingDifficultyComposition: Difficulty;

  @ApiProperty({
    type: [CreateTagDto],
    description: 'tags',
  })
  tags: CreateTagDto[];

  @ApiProperty({
    description: 'The id of the user',
  })
  @IsOptional()
  createdBy: string;
}

export class CompanyAssessmentDto {
  @ApiProperty()
  _id: string;
  @ApiProperty()
  name: string;

  @ApiProperty()
  tests: CreateTestDto[];

  @ApiProperty()
  createdBy: CreateUserDto;

  @ApiProperty()
  createdAt: string;
  @ApiProperty()
  completed: string;
  @ApiProperty()
  inprogress: string;
  @ApiProperty()
  totalcandidates: string;
  @ApiProperty()
  notstarted: string;
}

export class ExamResponsePagination {
  @ApiProperty({ type: [CompanyAssessmentDto] })
  companyAssessments: CompanyAssessmentDto[];

  @ApiProperty({ type: Number })
  total: number;
}

export class CompanyAssessmentResponsePagination {
  @ApiProperty({ type: [ExamResponse] })
  exams: ExamResponse[];

  @ApiProperty({ type: Number })
  total: number;
}

export class BillingCyclee {
  @ApiProperty({ type: Number })
  percentage: number;
  @ApiProperty({ type: String })
  cycleName: string;
}

export class planResponseDto {
  @ApiProperty({ type: String })
  _id: string;
  @ApiProperty({ type: String })
  planTitle: string;
  @ApiProperty({ type: Number })
  priceMonthly: number;
  @ApiProperty({ type: Boolean })
  isActive: boolean;
  @ApiProperty({ type: Boolean })
  isBlocked: boolean;
  @ApiProperty({ type: Boolean })
  coupon: boolean;
  @ApiProperty({ type: [BillingCyclee] })
  cycles: BillingCyclee[];
}

export class SubPlanResponsePagination {
  @ApiProperty({ type: [planResponseDto] })
  plans: planResponseDto[];

  @ApiProperty({ type: Number })
  total: number;
}

export class companyPaginationDto extends paginationDto {
  @ApiProperty({
    description: 'Company name',
  })
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;
  @ApiProperty({
    description: 'active ,inActive, expired',
  })
  @IsOptional()
  @ApiPropertyOptional()
  isActive?: string;
  @ApiProperty({
    description: 'true or false in string',
  })
  @IsOptional()
  @ApiPropertyOptional()
  isBlocked?: string;
  @ApiProperty({
    description: 'plan names',
  })
  @IsOptional()
  @ApiPropertyOptional()
  planName?: string;
  @ApiProperty({
    example: 'name: asc',
    description: 'name: asc or createdAt: desc, createdAt: asc, planCreatedAt',
  })
  @IsOptional()
  @ApiPropertyOptional()
  sort?: string;
}

export class browseCompanyPaginationDto extends paginationDto {
  @ApiProperty({
    description: 'Company name',
  })
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;
  @ApiProperty({
    description: 'Kohinoor, Fsd',
  })
  @IsOptional()
  @ApiPropertyOptional()
  location?: string;

  @ApiProperty({
    example: 'name: asc',
    description: 'name: asc || createdAt: asc',
  })
  @IsOptional()
  @ApiPropertyOptional()
  sort?: string;
}

export class candidatePaginationDto extends paginationDto {
  @ApiProperty({
    description: 'Candidate name',
  })
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;
  @ApiProperty({
    description: 'true or false in string',
  })
  @IsOptional()
  @ApiPropertyOptional()
  isBlocked?: string;
  @ApiProperty({
    example: 'name: asc',
    description: 'name: asc, test: asc, assessment: asc',
  })
  @IsOptional()
  @ApiPropertyOptional()
  sort?: string;
}

export class SkillPaginationDto extends paginationDto {
  @ApiProperty({
    example: 'javascript',
    description: 'skill Title',
  })
  @IsOptional()
  @ApiPropertyOptional()
  title?: string;
}

export class TestAdminPaginationDto extends paginationDto {
  @ApiProperty({
    example: 'Algortithms',
    description: 'Test name',
  })
  @IsOptional()
  @ApiPropertyOptional()
  testName?: string;
  // @ApiProperty({
  //   example: 'tag',
  //   description: 'tagName',
  // })
  // @IsOptional()
  // @ApiPropertyOptional()
  // tag?: string;
  // @ApiProperty({
  //   example: 'javascript',
  //   description: 'language name',
  // })
  // @IsOptional()
  // @ApiPropertyOptional()
  // language?: string;
  // @ApiProperty({
  //   example: 'testName: asc',
  //   description: 'testName: asc or testName: desc',
  // })
  // @IsOptional()
  // @ApiPropertyOptional()
  // sort?: string;
  @ApiProperty({
    example: 'Mcq',
    description: 'Mcq or codingQuestion',
  })
  @IsOptional()
  @ApiPropertyOptional()
  testType?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(['you', 'companies', ''])
  createdBy: string;
}

export class CompanyTestPaginationDto extends paginationDto {
  @ApiProperty({
    example: 'Algortithms',
    description: 'Test name',
  })
  @IsOptional()
  @ApiPropertyOptional()
  testName?: string;
  @ApiProperty({
    example: 'Mcq',
    description: 'Mcq or codingQuestion',
  })
  @IsOptional()
  @ApiPropertyOptional()
  testType?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(['you', 'library', ''])
  createdBy: string;
}

export class TestPaginationDto extends paginationDto {
  @ApiProperty({
    example: '',
    description: 'Test name',
  })
  @IsOptional()
  @ApiPropertyOptional()
  testName?: string;
  @ApiProperty({
    example: '',
    description: 'tagName',
  })
  @IsOptional()
  @ApiPropertyOptional()
  tag?: string;
  @ApiProperty({
    example: '',
    description: 'language name',
  })
  @IsOptional()
  @ApiPropertyOptional()
  language?: string;
  @ApiProperty({
    example: '',
    description: 'testName: asc or testName: desc',
  })
  @IsOptional()
  @ApiPropertyOptional()
  sort?: string;
  @ApiProperty({
    example: 'Mcq',
    description: 'Mcq or codingQuestion',
  })
  @IsOptional()
  @ApiPropertyOptional()
  testType?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(['you', 'companies', ''])
  createdBy: string;
}

export class jobsListingDto extends paginationDto {
  @IsOptional()
  @ApiPropertyOptional()
  jobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  employmentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  categories?: string;

  @ApiPropertyOptional()
  @IsOptional()
  benefits?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  requiredSkills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  MaxSalaryRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  MinSalaryRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  datePosted?: string;

  @ApiPropertyOptional()
  @IsOptional()
  jobStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  approvalStatus?: string;

  @ApiProperty({
    example: '',
    description:
      'title: asc or dueDate: desc or datePosted: desc or jobType: desc',
  })
  @ApiPropertyOptional()
  @IsOptional()
  sort?: string;
}

export class jobsListingCompanyDto extends paginationDto {
  @IsOptional()
  @ApiPropertyOptional()
  jobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  employmentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  salaryRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  datePosted?: string;

  @ApiPropertyOptional()
  @IsOptional()
  applicationDeadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  jobStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  approvalStatus?: string;

  @ApiProperty({
    example: '',
    description:
      'title: asc or dueDate: desc or datePosted: desc or jobType: desc',
  })
  @ApiPropertyOptional()
  @IsOptional()
  sort?: string;
}

export class applicationListingCompanyDto extends paginationDto {
  @IsOptional()
  @ApiPropertyOptional()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  score?: string;

  @ApiPropertyOptional()
  @IsOptional()
  stage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  appliedDate?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'name:asc or score:desc or stage: desc or appliedDate: desc',
  })
  @IsOptional()
  sort?: string;
}

export class identifierResponse {
  @ApiProperty({
    description: 'true or false',
  })
  isUserPresent: boolean;
  @ApiProperty({
    description: 'email',
  })
  email: string;
  @ApiProperty({
    description: 'examid',
  })
  examid: string;
  @ApiProperty({
    description: 'jobid',
  })
  job: string;
  @ApiProperty({
    description: 'name',
  })
  name?: string;
  @ApiProperty({
    description: 'phone',
  })
  phone?: string;
  @ApiProperty({
    description: 'gender',
  })
  gender?: string;
}

export class AssessmentMcqObj {
  @ApiProperty({
    example: false,
    description: 'true or false',
  })
  isFinished: boolean;

  @ApiProperty({
    description: 'question returned',
  })
  question: ExamMcqQuestion;

  @ApiProperty({
    example: false,
    description: 'false or true',
  })
  isCodingQuestion: boolean;
}

export class updateCompanyJob {
  @ApiPropertyOptional()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  MinSalaryRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  MaxSalaryRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  employmentType?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  jobType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  jobStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  applicationDeadline?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  applications?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  exam?: string;

  @ApiPropertyOptional()
  @IsOptional()
  createdBy?: string;
}

export class AssessmentCodingObj {
  @ApiProperty({
    example: false,
    description: 'true or false',
  })
  isFinished: boolean;

  @ApiProperty({
    description: 'question returned',
  })
  question: ExamCodingQuestion;

  @ApiProperty({
    example: false,
    description: 'false or true',
  })
  isCodingQuestion: boolean;
}
export class CompanySubResDto {
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  _id: string;
  @ApiProperty()
  subscriptionStatus: string;
}

export class UpdateCompanyyDtoRes {
  @ApiProperty()
  logo: Picture;

  @ApiProperty()
  banner: Picture;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  isBlocked: boolean;

  @ApiProperty()
  name: string;

  @ApiProperty()
  _id: string;

  @ApiProperty({
    type: CompanySubResDto,
  })
  companySubscription: CompanySubResDto;
  @ApiProperty({
    type: CreateSubscriptionPlanDto,
  })
  subscriptionPlan: CreateSubscriptionPlanDto;

  @ApiProperty({
    example: 'someone@company.com',
    description: 'Company Email',
  })
  @IsOptional()
  email: string;

  @ApiProperty({
    example: 'Web3',
    description: 'Industry name in which your company falls',
  })
  @IsOptional()
  industry: string;

  @ApiProperty({
    description: 'Company phone',
  })
  @IsOptional()
  phone: string;

  @ApiProperty({
    example: 'https://company.com',
    description: 'Company Website',
  })
  @IsOptional()
  website: string;

  @ApiProperty({
    example: 'https://company.com/',
    description: 'Company Linkedin',
  })
  @IsOptional()
  linkedin: string;

  @ApiProperty({
    example: 'abc is a web3 company',
    description: 'Description for your company',
  })
  @IsOptional()
  description: string;

  @ApiProperty({
    example: 'more description',
    description: 'Any more content',
  })
  @IsOptional()
  content: string;

  @ApiProperty({
    example: '23 Aug, 2023',
    description: 'Fouded Date for company',
  })
  @IsOptional()
  foundedDate: string;

  @ApiProperty({
    example: '',
    description: 'Company address',
  })
  @IsOptional()
  address: string;

  @ApiProperty({
    example: 'New York',
    description: 'Company city',
  })
  @IsOptional()
  city: string;

  @ApiProperty({
    example: 'Pakistan',
    description: 'Company Country',
  })
  @IsOptional()
  country: string;
}

export class companyResponseDto {
  @ApiProperty({ type: [UpdateCompanyyDtoRes] })
  companies: UpdateCompanyyDtoRes[];
  @ApiProperty({ type: Number })
  total: number;
}

export class UserRes {
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  isSocialLogin: boolean;
  @ApiProperty()
  company: string;
  @ApiProperty()
  candidate: string;
  @ApiProperty()
  subscriptionPlan: string;
  @ApiProperty()
  userType: string;
  @ApiProperty()
  lastLogin: Date;
  @ApiProperty()
  isEmailVerified: boolean;
  @ApiProperty()
  isBlocked: boolean;
  @ApiProperty()
  isActive: boolean;
  @ApiProperty()
  _id: string;
  @ApiProperty()
  assessmentsCount: boolean;
}

export class candidateResponseDto {
  @ApiProperty({ type: [UserRes] })
  candidates: UserRes[];
  @ApiProperty({ type: Number })
  total: number;
}

export class SkillResponseDto {
  @ApiProperty({ type: [UpdateCompanyyDto] })
  skills: UpdateSkillDto[];
  @ApiProperty({ type: Number })
  total: number;
}

export class testsRes extends CreateTestDto {
  @ApiProperty()
  type: string;
  @ApiProperty()
  _id: string;
}
export class testsManRes extends CreateTestDto {
  @ApiProperty()
  type: string;
  @ApiProperty()
  _id: string;
  @ApiProperty()
  customQuestions: string[];
  @ApiProperty()
  customQuestionsType: string;
}

export class createdByDto {
  @ApiProperty()
  _id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  userType: string;
}

export class singleTestsRes {
  @ApiProperty()
  testName: string;

  @ApiProperty()
  testType: string;

  @ApiProperty()
  _id: string;

  @ApiProperty()
  tag: string;

  @ApiProperty()
  language: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  compositionEasy: number;

  @ApiProperty()
  compositionMedium: number;

  @ApiProperty()
  compositionHard: number;

  @ApiProperty()
  totalTime: number;

  @ApiProperty()
  passingPercentage: number;

  @ApiProperty()
  createdBy: createdByDto;

  @ApiProperty()
  updatedBy: string;
}

export class testResponseDto {
  @ApiProperty({ type: [testsManRes] })
  tests: testsManRes[];
  @ApiProperty({ type: String })
  total: string;
}

export class manualTestsRes extends CreateManualTestDto {
  @ApiProperty()
  type: string;
  @ApiProperty()
  _id: string;
}
export class BothtestsDtoRes extends CreateManualTestDto {
  @ApiProperty()
  type: string;
  @ApiProperty()
  _id: string;
}

export class singleManualTestsRes extends CreateManualTestDto {
  @ApiProperty()
  type: string;
  @ApiProperty()
  _id: string;
}

export class manualTestResponseDto {
  @ApiProperty({ type: [manualTestsRes] })
  tests: manualTestsRes[];
  @ApiProperty({ type: String })
  total: string;
}

export class CandidateResults {
  @ApiProperty({
    example: 'company',
    description: 'company name',
  })
  companyName: string;

  @ApiProperty({
    example: 'candidate',
    description: 'candidate name',
  })
  candidateName: string;

  @ApiProperty({
    example: 'candidate@gmail.com',
    description: 'candidate email',
  })
  candidateEmail: string;

  @ApiProperty({
    example: 'JAVASCRIPT DEVELOPER',
    description: 'exam title',
  })
  examTitle: string;

  @ApiProperty({
    example: 20,
    description: 'Total marks by candidate',
  })
  Marks: number;

  @ApiProperty({
    description: 'time assessment was created',
  })
  assessmentCreatedAt: string;
}

export class Prop {
  @ApiProperty({
    example: '6528d9f3dbec99a939a5a60f',
    description: 'Candidate ID',
  })
  questionId: string;
  @ApiProperty({
    example: '6528d9f3dbec99a939a5a60f',
    description: 'Candidate ID',
  })
  answer: string;
  @ApiProperty({
    example: '6528d9f3dbec99a939a5a60f',
    description: 'Candidate ID',
  })
  correct: boolean;
}

export class CodingQuestion {
  @ApiProperty()
  questionId: string;
  @ApiProperty()
  answer: string;
}

export class Marks {
  @ApiProperty({
    // example: '6528d9f3dbec99a939a5a60f',
    // description: 'Candidate ID',
  })
  index: number;
  @ApiProperty({
    // example: '6528d9f3dbec99a939a5a60f',
    // description: 'Candidate ID',
  })
  mcqtimeLeft: number;
  @ApiProperty({
    // example: '6528d9f3dbec99a939a5a60f',
    // description: 'Candidate ID',
  })
  activeMcqs: boolean;
  @ApiProperty({
    // example: '6528d9f3dbec99a939a5a60f',
    // description: 'Candidate ID',
  })
  codingtimeLeft: number;
  @ApiProperty({
    // example: 'true',
    // description: 'Test completion status',
  })
  isFinished: boolean;
  @ApiProperty({
    // example: '2',
    // description: 'Number of test attempts',
  })
  attempts: number;
  @ApiProperty({
    // example: '50',
    // description: 'Obtained points in test',
  })
  points: number;
}

export class Assessment {
  @ApiProperty({
    example: '6528d9f3dbec99a939a5a60f',
    description: 'Candidate ID',
  })
  candidate: string;

  @ApiProperty({
    example: '6528d9f3dbec99a939a5a60f',
    description: 'Exam ID',
  })
  exam: ExamDto;

  @ApiProperty({
    description: 'MCQ Questions with Answers',
    type: [Prop],
  })
  mcqQuestions: Prop[];

  @ApiProperty({
    description: 'List of MCQs',
    type: [String],
    example: ['6528d9f3dbec99a939a5a60f'],
  })
  mcqs: string[];

  @ApiProperty({
    description: 'Coding Questions with Answers',
    type: [CodingQuestion],
  })
  codingQuestions: CodingQuestion[];

  @ApiProperty({
    description: 'List of Coding Questions',
    type: [String],
    example: ['6528d9f3dbec99a939a5a60f'],
  })
  codings: string[];

  @ApiProperty({
    description: 'Assessment Score',
    example: 85,
  })
  score: number;

  @ApiProperty({
    description: 'Assessment Status',
    enum: ['pending', 'completed', 'passed', 'failed'],
    example: 'completed',
  })
  status: string;

  @ApiProperty({
    description: 'Assessment Feedback',
    example: 'Good job!',
  })
  feedback: string;

  @ApiProperty({
    description: 'Test Pointer',
    type: [Marks],
  })
  testPointer: Marks[];
}

export class AssessmentsDto {
  @ApiProperty({ type: [Assessment] })
  applications: Assessment[];
  @ApiProperty({ type: Number })
  total: number;
}

export class FeedbackObject {
  @ApiProperty({ type: String })
  feedbackQuestion: string;
  @ApiProperty({ type: Number })
  rating: number;
  @ApiProperty({ type: String })
  suggestion: string;
}

export class CreateDto {
  @ApiProperty({ type: String, description: 'The job parameter as a string' })
  job: string;

  @ApiProperty({ type: String, description: 'The ref id of the user company' })
  company: string;
}
export class NormalCandidateApplyDto {
  @ApiProperty({ type: String, description: 'The job parameter as a string' })
  job: string;

  @ApiProperty({ type: String, description: 'The ref id of the user company' })
  company: string;

  @ApiProperty({ type: String, description: 'previous job title' })
  previousJobTitle: string;

  @ApiProperty({
    type: String,
    description: 'additional info to send to company',
  })
  addInfo: string;
}

export class IdentifierDto {
  @ApiProperty({
    type: String,
    description: 'The identifier for the invitation',
  })
  identifier: string;
}

export class TemplatePerObj {
  // candidate applications
  @ApiProperty({
    type: Boolean,
    example: false,
  })
  candidate_applications_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  candidate_applications_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  candidate_applications_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  candidate_applications_del: string;

  // assessments

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  company_assessment_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  company_assessment_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  company_assessment_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  company_assessment_del: string;

  // coding Questions

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  codingQuestions_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  codingQuestions_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  codingQuestions_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  codingQuestions_del: string;

  // mcqs

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  mcqs_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  mcqs_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  mcqs_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  mcqs_del: string;

  // examInvites

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  examInvites_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  examInvites_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  examInvites_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  examInvites_del: string;

  // exams

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  exams_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  exams_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  exams_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  exams_del: string;

  // jobs

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  jobs_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  jobs_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  jobs_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  jobs_del: string;

  // tags

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  tags_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  tags_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  tags_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  tags_del: string;
}
// Questions, Tests, Company Assessments, jobs, ExamInvites, applications
export class NewTemplatePerObj {
  // Questions
  @ApiProperty({
    type: Boolean,
    example: false,
  })
  Questions_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  Questions_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  Questions_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  Questions_del: string;

  // Tests
  @ApiProperty({
    type: Boolean,
    example: false,
  })
  tests_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  tests_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  tests_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  tests_del: string;

  // assessments

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  company_assessment_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  company_assessment_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  company_assessment_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  company_assessment_del: string;

  // candidate applications
  @ApiProperty({
    type: Boolean,
    example: false,
  })
  candidate_applications_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  candidate_applications_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  candidate_applications_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  candidate_applications_del: string;

  // exam invites

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  examInvites_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  examInvites_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  examInvites_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  examInvites_del: string;

  // company assessments

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  assessment_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  assessment_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  assessment_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  assessment_del: string;

  // jobs

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  jobs_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  jobs_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  jobs_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  jobs_del: string;

  // tags

  // @ApiProperty({
  //   type: Boolean,
  //   example: false,
  // })
  // tags_read: string;

  // @ApiProperty({
  //   type: Boolean,
  //   example: false,
  // })
  // tags_write: string;

  // @ApiProperty({
  //   type: Boolean,
  //   example: false,
  // })
  // tags_update: string;

  // @ApiProperty({
  //   type: Boolean,
  //   example: false,
  // })
  // tags_del: string;
}

export class TemplatePermissions {
  @ApiProperty({
    type: [TemplatePerObj],
    description: 'The identifier for the invitation',
  })
  allPermissions: TemplatePerObj[];
}

export class Permission {
  read: boolean;
  write: boolean;
  update: boolean;
  del: boolean;
}

export class PermissionsDTO {
  candidate_applications: Permission[];
  assesments: Permission[];
  codingQuestions: Permission[];
  mcqs: Permission[];
  examInvites: Permission[];
  exams: Permission[];
  jobs: Permission[];
  tags: Permission[];
}

export const EnumsCandidate = {
  applyPhase: { status: 'applied', message: '' },
  assessPhase: {
    status: 'Pending Assessment',
    message: 'Please check email for exam link',
  },
  resultPhase: { status: 'view Result', message: '' },
  interviewPhase: {
    status: 'Interview Call',
    message: 'Please check email for interview call',
  },
  hiredPhase: {
    status: 'hired',
    message: 'Contact company for further process',
  },
  rejectPhase: { status: 'rejected', message: '' },
};

export const EnumsCompany = {
  applyPhase: { status: 'accept', message: 'Pending assessment link' },
  assessPhase: {
    status: 'Link sent',
    message: 'Waiting for assessments',
  },
  resultPhase: { status: 'Send mail', message: 'Summon for interview' },
  interviewPhase: {
    status: 'Interviewing',
    message: '',
  },
  hiredPhase: {
    status: 'hired',
    message: '',
  },
  rejectPhase: { status: 'rejected', message: 'rejected candidates' },
};

// TODO: add more team members
export const companyTeamsEnums = {
  member1: 'recruiter',
  member2: 'interviewer',
  member3: 'admin',
};
// TODO: Add more team members
export enum UserRole {
  recruiter = 'recruiter',
  interviewer = 'interviewer',
  admin = 'admin',
}
export class IDClass {
  @ApiProperty({ type: String })
  _id: string;
}

export class RejectDto {
  @ApiProperty({ description: 'job id ', example: 'string' })
  jobid: string;
  @ApiProperty({ description: 'application id', example: 'string' })
  applicationId: string;
}

export class userAppliesDto {
  @ApiProperty({ description: 'name of user', example: 'toor' })
  name: string;
  @ApiProperty({
    description: 'user email',
    example: 'ehtashamalitoor50@gmail.com',
  })
  email: string;
  @ApiProperty({ description: 'phone of user', example: '+923128243980' })
  phone: string;
  // @ApiProperty({ description: 'password of user', example: 'password' })
  @ApiHideProperty()
  @IsOptional()
  password?: string;
  @ApiHideProperty()
  @IsOptional()
  userType?: string;
  // @ApiProperty({ description: 'gender', example: 'male' })
  // gender: string;
  @ApiProperty({ description: 'linkedin profile link', example: 'toor' })
  linkedIn: string;
  @ApiProperty({
    description: 'previous job title',
    example: 'Mern stack developer',
  })
  // @IsOptional()
  previousJobTitle: string;
  @ApiProperty({
    example: 'Hey i want to share with you some points...',
    description: 'additional information to send to company',
  })
  // @IsOptional()
  addInfo: string;
  @ApiProperty({
    description: 'portfolio site',
    example: 'https://ehtashamtoor.vercel.app',
  })
  portfolioSite: string;
  @ApiProperty({ description: 'The CV URL of the user' })
  @IsOptional()
  cvUrl: Picture;
  @ApiHideProperty()
  @IsOptional()
  isSocialLogin: boolean;
  @ApiHideProperty()
  @IsOptional()
  candidate: string;
}

export class JobAnalyticsResponse {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  open?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  closed?: number;

  // @ApiPropertyOptional({ type: Number })
  // @IsOptional()
  // onsite?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  remote?: number;

  // @ApiPropertyOptional({ type: Number })
  // @IsOptional()
  // hybrid?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  fullTime?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  partTime?: number;

  // @ApiPropertyOptional({ type: Number })
  // @IsOptional()
  // selfEmployed?: number;

  // @ApiPropertyOptional({ type: Number })
  // @IsOptional()
  // freelance?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  contract?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  internship?: number;

  // @ApiPropertyOptional({ type: Number })
  // @IsOptional()
  // apprenticeship?: number;

  // @ApiPropertyOptional({ type: Number })
  // @IsOptional()
  // seasonal?: number;
}

export class adminAnalyticsResponse {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  'Active Companies': number;
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  'Blocked Companies': number;
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  'Paid Companies': number;
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  'UnPaid Companies': number;
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  'Total Companies': number;
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  'Active Candidates': number;
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  'Blocked Candidates': number;
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  'Total Candidates': number;
}

export class PaymentDto {
  @ApiProperty({ description: 'ref id of Subscription plan' })
  SubscriptionPlan: string;
  @ApiProperty({ description: 'monthly, quaterly, biannual, annual' })
  planCycle: string;
  @ApiPropertyOptional({ description: 'Coupon Code if any' })
  @IsOptional()
  couponCode?: string;
  @ApiPropertyOptional({ description: 'currency', example: 'usd' })
  @IsOptional()
  currency?: string;

  @ApiHideProperty()
  company: string;
  @ApiHideProperty()
  @IsOptional()
  featuresUsed?: {
    testsUsed?: string;
    jobsUsed?: string;
    assessmentsUsed?: string;
    invitesUsed?: string;
  };
  @ApiHideProperty()
  subscriptionStartDate: Date;
  @ApiHideProperty()
  subscriptionEndDate?: Date;
  @ApiHideProperty()
  paymentIntentIds?: string[];
  // @ApiHideProperty()
  // @IsOptional()
  // billingInformation?: billingInformation;
  @ApiHideProperty()
  @IsOptional()
  @IsEnum(['active', 'expired'])
  subscriptionStatus?: string;
}

export class IntentDto {
  @ApiProperty({ description: 'Payment intent ID' })
  intentId: string;
  @ApiProperty({ description: 'client_secret for payment' })
  client_secret: string;
}

export class jobResponse {
  @ApiProperty({ type: [CreateJobDto] })
  jobs: CreateJobDto[];
  @ApiProperty({ type: Number })
  total: number;
}

export class singleJobResponse extends CreateJobDto {
  @ApiProperty({ type: CreatedBY })
  createdBy: CreatedBY;
}

export class TeamPermRes {
  @ApiProperty()
  roleTitle: string;

  @ApiProperty()
  permissionsAllowed: NewTemplatePerObj;

  @ApiProperty()
  _id: string;
}

export class rolesResponse {
  @ApiProperty({ type: [TeamPermRes] })
  roles: TeamPermRes[];
  @ApiProperty({ type: Number })
  total: number;
}
export class rolesMinifiedResponse {
  @ApiProperty({ type: String })
  roleTitle: string;
  @ApiProperty({ type: String })
  _id: string;
}
export class rolesResponseToCompany {
  @ApiProperty({ type: [rolesMinifiedResponse] })
  roles: rolesMinifiedResponse[];
}

export class benefitResponse {
  @ApiProperty({ type: [CreateBenefitDto] })
  roles: CreateBenefitDto[];
  @ApiProperty({ type: Number })
  total: number;
}

export class BenefitPaginationDto extends paginationDto {
  @ApiProperty({
    example: 'javascript',
    description: 'skill Title',
  })
  @IsOptional()
  @ApiPropertyOptional()
  title?: string;
  @ApiProperty({
    example: 'description',
    description: 'category description',
  })
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;
}

export class SingleExamRes extends IDClass {
  @ApiProperty()
  name: string;
}

export class categoryResponse {
  @ApiProperty({ type: [CreateCategoryDto] })
  categories: CreateCategoryDto[];
  @ApiProperty({ type: Number })
  total: number;
}
export class SinglecategoryRes extends IDClass {
  @ApiProperty({ type: String })
  categoryName: string;

  @ApiProperty({ type: Picture })
  icon: Picture;
}
export class SingleSkillRes extends IDClass {
  @ApiProperty({ type: String })
  title: string;
}
export class SingleBenefitRes extends IDClass {
  @ApiProperty({ type: String })
  title: string;
  @ApiProperty({ type: String })
  description: string;
  @ApiProperty({ type: CreateUserDto })
  createdBy: CreateUserDto;
}

export class requestResponse {
  dynamic: {
    // @ApiHideProperty()
    title: string;
    description: string;
    name: string;
    icon: string;
    skillTitle: string;
    requestStatus: string;
    requestedBy: string;
  };
}

export class statusByCandidate {
  @ApiProperty()
  _id: string;
  @ApiProperty()
  status: string;
  @ApiProperty()
  message: string;
}

export class statusByCompany {
  @ApiProperty()
  _id: string;
  @ApiProperty()
  status: string;
  @ApiProperty()
  message: string;
}

export class RandomUserApplyJob {
  @ApiProperty()
  _id: string;
  @ApiProperty()
  statusByCandidate: statusByCandidate;
  @ApiProperty()
  statusByCompany: statusByCompany;
  @ApiProperty()
  candidate: string;
  @ApiProperty()
  job: string;
}

export class RandomUserApplyJobDto {
  @ApiProperty()
  message: string;
  @ApiProperty()
  application: RandomUserApplyJob;
}

export class RequestData {
  @ApiPropertyOptional({
    example: 'title',
    description: 'title of benefit',
  })
  title?: string;
  @ApiPropertyOptional({
    example: 'title',
    description: 'title of benefit',
  })
  description?: string;
  @ApiPropertyOptional({
    example: 'title',
    description: 'title of benefit',
  })
  name?: string;
  @ApiPropertyOptional({
    type: Picture,
    description: 'title of benefit',
  })
  icon?: Picture;
  @ApiProperty({
    example: 'title',
    description: 'title of benefit',
  })
  skillTitle?: string;
}
