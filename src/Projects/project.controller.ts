import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Query,
  Delete,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  ProjectRes,
  ProjectsResponseDto,
  paginationDto,
} from 'src/utils/classes';
import { AuthReq } from 'src/types';
import { CreateProjectDto } from './dto/create-project';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CandidateGuard } from 'src/auth/jwt.candidate.guard';
import { CandidateService } from 'src/candidate/candidate.service';

@ApiTags('Candidate Projects')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('/api')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    // private readonly candidateService: CandidateService,
  ) {}

  // ************************ in use *********************
  @Post('/create-Project')
  @UseGuards(AuthGuard(), CandidateGuard)
  create(@Body() dto: CreateProjectDto, @Req() req: AuthReq) {
    const { id, candidate } = req.user;

    // set Logged userId in user field
    dto.user = id;

    return this.projectService.create(dto, candidate);
  }

  // ************************* in use ************************
  @Get('/getProjects')
  @UseGuards(AuthGuard(), CandidateGuard)
  @ApiOperation({
    description: 'Get all Projects',
    summary:
      'Get all Projects of a candidate or paginate them(page limit is must)',
  })
  @ApiOkResponse({
    type: ProjectsResponseDto,
  })
  findAll(@Req() req: AuthReq, @Query() query: paginationDto) {
    if (query.page && query.limit) {
      const { page, limit } = query;
      return this.projectService.findAll(req.user.id, page, limit);
    } else {
      return this.projectService.findAll(req.user.id);
    }
  }

  @Get('/getProject/:id')
  @UseGuards(AuthGuard(), CandidateGuard)
  @ApiResponse({
    status: 200,
    type: ProjectRes,
  })
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  // ********************** in use ********************
  @Patch('/updateProject/:id')
  @UseGuards(AuthGuard(), CandidateGuard)
  @ApiResponse({
    status: 200,
    type: UpdateProjectDto,
  })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(id, dto);
  }

  // *********************** in use ********************
  @Delete('/deleteProject/:id')
  @UseGuards(AuthGuard(), CandidateGuard)
  async remove(@Req() req: AuthReq, @Param('id') id: string) {
    return await this.projectService.remove(id, req.user.candidate);
  }
}
