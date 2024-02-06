import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  // Delete,
  UseGuards,
  Req,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
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
  TagsAnalyticsDto,
  TagsResponseDto,
  paginationDto,
  tagsPaginationDto,
} from 'src/utils/classes';
import { CompanyTeamGuard } from 'src/auth/jwt.team.guard';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { AuthReq } from 'src/types';

@ApiTags('Tags')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('/api')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @ApiBearerAuth()
  @Post('/create-tag')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'tags_write')
  create(@Body() dto: CreateTagDto, @Req() req: AuthReq) {
    const { id } = req.user;

    // set Logged userId in user field
    dto.user = id;

    return this.tagService.create(dto);
  }

  @Get('/getTags')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'tags_read')
  @ApiOperation({
    description: 'Get all tags',
    summary: 'Get all tags or paginate them(page limit is must)',
  })
  @ApiOkResponse({
    type: TagsResponseDto,
  })
  findAll(@Query() query: paginationDto) {
    if (query.page && query.limit) {
      const { page, limit } = query;
      return this.tagService.findAll(page, limit);
    } else {
      return this.tagService.findAll();
    }
  }

  @Get('/getTagsAnalytics')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({
    description: 'Get all tags along tags analytics',
    summary: 'Get all tags or paginate them along analytics',
  })
  @ApiOkResponse({
    type: TagsAnalyticsDto,
  })
  getTagsAnalytics(@Query() query: tagsPaginationDto) {
    return this.tagService.getTagsAnalytics(query);
  }

  @Get('/getTag/:id')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'tags_read')
  @ApiSecurity('JWT-auth')
  @ApiResponse({
    status: 200,
    type: CreateTagDto,
  })
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }

  @Patch('/updateTag/:id')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'tags_update')
  @ApiResponse({
    status: 200,
    type: UpdateTagDto,
  })
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(id, updateTagDto);
  }

  // @Delete('/deleteTag/:id')
  // // @UseGuards(AuthGuard(), AdminGuard)
  // async remove(@Param('id') id: string) {
  //   return await this.tagService.remove(id);
  // }
}
