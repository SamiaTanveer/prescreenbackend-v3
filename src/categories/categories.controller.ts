import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthReq } from 'src/types';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { AuthGuard } from '@nestjs/passport';
import {
  SinglecategoryRes,
  categoryResponse,
  paginationDto,
} from 'src/utils/classes';
import { Category } from './entities/category.entity';

@ApiTags('Categories')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('api')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('categories/create-category')
  @UseGuards(AuthGuard(), AdminGuard)
  async create(@Req() req: AuthReq, @Body() dto: CreateCategoryDto) {
    // dto.createdBy = req.user.id;
    return this.categoriesService.create(dto);
  }

  @Get('categories/getAll')
  @ApiResponse({
    status: 200,
    type: categoryResponse,
  })
  findAll(@Query() query: paginationDto) {
    return this.categoriesService.findAll(query);
  }
  @Get('categories/getAllForJobPost')
  @ApiResponse({
    status: 200,
    type: [SinglecategoryRes],
  })
  findAllForJobPost() {
    return this.categoriesService.findAllForJobPost();
  }

  @Get('categories/getOne/:id')
  @ApiResponse({
    status: 200,
    type: CreateCategoryDto,
  })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch('categories/updateOne/:id')
  @UseGuards(AuthGuard(), AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete('categories/removeOne/:id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
