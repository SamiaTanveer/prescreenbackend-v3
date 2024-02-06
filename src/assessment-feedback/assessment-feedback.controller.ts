import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { feedbackPaginationDto, paginationDto } from 'src/utils/classes';
import { AssessmentFeedbackService } from './assessment-feedback.service';
import { AssessmentFeedbackDto } from './dto/create-assessment-feedback.dto';
import { UpdateAssessmentFeedbackDto } from './dto/update-assessment-feedback.dto';
import { AuthReq } from 'src/types';
import { AuthGuard } from '@nestjs/passport';
import { CandidateGuard } from 'src/auth/jwt.candidate.guard';
import { AssessmentFeedback } from './entities/assessment-feedback.entity';

@ApiTags('assessment-feedback')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('api/assessment-feedback')
export class AssessmentFeedbackController {
  constructor(
    private readonly assessmentFeedbackService: AssessmentFeedbackService,
  ) {}

  @Post('create-feedback')
  @UseGuards(AuthGuard(), CandidateGuard)
  async create(
    @Body() dto: AssessmentFeedbackDto,
    @Req() req: AuthReq,
  ): Promise<AssessmentFeedback> {
    dto.user = req.user.id;
    return await this.assessmentFeedbackService.create(dto);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all feedbacks of candidates or paginate them',
  })
  findAll(@Query() query: feedbackPaginationDto) {
    return this.assessmentFeedbackService.findAll(query);
    // else {
    //   return this.AssessmentFeedbackService.findAll();
    // }
  }

  @Get('getOne/:id')
  findOne(@Param('id') id: string) {
    return this.assessmentFeedbackService.findOne(id);
  }

  @Patch('updateOne/:id')
  update(@Param('id') id: string, @Body() dto: UpdateAssessmentFeedbackDto) {
    return this.assessmentFeedbackService.update(id, dto);
  }

  // @Delete('removeOne/:id')
  // remove(@Param('id') id: string) {
  //   return this.assessmentFeedbackService.remove(id);
  // }
}
