import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { CandidateFeedbackService } from './candidate-feedback.service';
import { CandidateFeedbackDto } from './dto/create-candidate-feedback.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateCandidateFeedbackDto } from './dto/update-candidate-feedback.dto';
import { paginationDto } from 'src/utils/classes';

@ApiTags('candidate-feedback')
@Controller('api/candidate-feedback')
export class CandidateFeedbackController {
  constructor(
    private readonly candidateFeedbackService: CandidateFeedbackService,
  ) {}

  @Post('candidate-feedback')
  async create(@Body() dto: CandidateFeedbackDto) {
    return await this.candidateFeedbackService.create(dto);
  }

  @Get('candidate-feedback')
  @ApiOperation({
    summary: 'Get all feedbacks of candidates or paginate them',
  })
  findAll(@Query() query: paginationDto) {
    if (query.page && query.limit) {
      const { page, limit } = query;
      return this.candidateFeedbackService.findAll(page, limit);
    } else {
      return this.candidateFeedbackService.findAll();
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.candidateFeedbackService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCandidateFeedbackDto) {
    return this.candidateFeedbackService.update(id, dto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.candidateFeedbackService.remove(id);
  // }
}
