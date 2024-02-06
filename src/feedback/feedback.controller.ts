import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  // Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
// import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateFeedbackFormDto } from './dto/create-feedback.dto';
import { FeedbackForm } from './entities/feedback.entity';
import { paginationDto } from 'src/utils/classes';

@ApiTags('Feedback')
@Controller('api/feedbacks')
export class FeedbackController {
  constructor(private readonly feedbackFormService: FeedbackService) {}

  @Post('create-feedbackForm')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @UseGuards(AuthGuard()) // TODO adminguard
  async create(@Body() dto: CreateFeedbackFormDto) {
    return await this.feedbackFormService.create(dto);
  }

  @Get('getAll')
  @ApiOperation({
    summary: 'Get all feedbacks of all candidates or paginate them',
  })
  findAll(@Query() query: paginationDto): Promise<FeedbackForm[]> {
    if (query.page && query.limit) {
      const { page, limit } = query;
      return this.feedbackFormService.findAll(page, limit);
    } else {
      return this.feedbackFormService.findAll();
    }
  }

  // @Get('feedbacks/:id')
  // findOne(@Param('id') id: string): Promise<FeedbackForm | null> {
  //   return this.feedbackFormService.findOne(id);
  // }

  @Patch('feedbacks/:id')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @UseGuards(AuthGuard()) // TODO adminguard
  update(@Param('id') id: string, @Body() dto: CreateFeedbackFormDto) {
    return this.feedbackFormService.update(id, dto);
  }

  // @Delete('feedbacks/:id')
  // @ApiBearerAuth()
  // @ApiSecurity('JWT-auth')
  // @UseGuards(AuthGuard(), CandidateGuard)
  // remove(@Param('id') id: string) {
  //   return this.feedbackFormService.remove(id);
  // }
}
