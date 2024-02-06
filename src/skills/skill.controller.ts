import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  Query,
  UseGuards,
  Post,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  SingleSkillRes,
  SkillPaginationDto,
  SkillResponseDto,
} from 'src/utils/classes';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { SkillService } from './skill.service';
import { UpdateSkillDto } from './dto/update-skil.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { Skill, SkillSchema } from './entities/skill.entity';

@ApiTags('Skills')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('/api/skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post('/create-skill')
  @UseGuards(AuthGuard(), AdminGuard)
  CreateSkill(@Body() dto: CreateSkillDto): Promise<Skill> {
    // dto.createdBy = req.user.id;
    return this.skillService.create(dto);
  }

  @Get('/all')
  // @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({
    summary: 'Get all Skills or search by skillsTitle',
    description: 'Get all skills or paginate them OR search a skill by title',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the SKills',
    type: SkillResponseDto,
  })
  async getAllSkills(@Query() query: SkillPaginationDto) {
    if (query.page !== undefined && query.limit !== undefined) {
      // for admin skill listing
      const { page, limit, title } = query;
      return await this.skillService.findAll(page, limit, title);
    } else {
      // for company job form listing
      return await this.skillService.findAll();
    }
  }
  @Get('/allForJobsPost')
  @ApiOperation({
    summary: 'Get all Skills for job post',
    description: 'Get all skills for job post',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the SKills',
    type: [SingleSkillRes],
  })
  async getAllSkillsForJobPost() {
    return await this.skillService.findSkillsForJobPost();
  }

  @Get('getSkill/:skillId')
  @ApiOperation({ summary: 'Get the Skill by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the Skill by id',
    type: UpdateSkillDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Skill not found',
  })
  getCompanyById(@Param('skillId') skillId: string) {
    return this.skillService.findById(skillId);
  }

  @Put('updateSkill/:skillId')
  @UseGuards(AuthGuard(), AdminGuard)
  async updateskill(
    @Body() dto: CreateSkillDto,
    @Param('skillId') skillId: string,
  ) {
    return this.skillService.update(skillId, dto);
  }
  @Delete('deleteSkill/:skillId')
  @UseGuards(AuthGuard(), AdminGuard)
  async removeSkill(@Param('skillId') skillId: string) {
    return this.skillService.remove(skillId);
  }
}
