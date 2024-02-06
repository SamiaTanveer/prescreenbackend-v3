import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { AuthGuard } from '@nestjs/passport';
import {
  SingleBenefitRes,
  benefitResponse,
  paginationDto,
} from 'src/utils/classes';
import { Benefit } from './entities/benefit.entity';

@ApiTags('Benefits')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('api/benefits')
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  @Post('create-benefit')
  @UseGuards(AuthGuard(), AdminGuard)
  create(@Body() dto: CreateBenefitDto) {
    // dto.createdBy = req.user.id;
    return this.benefitsService.create(dto);
  }

  @Get('allBenefits')
  @ApiResponse({
    status: 200,
    type: benefitResponse,
  })
  @UseGuards(AuthGuard(), AdminGuard)
  findAll(@Query() query: paginationDto) {
    return this.benefitsService.findAll(query);
  }
  @Get('allBenefitsForJobPost')
  @ApiResponse({
    status: 200,
    type: [SingleBenefitRes],
  })
  findAllBenefits() {
    return this.benefitsService.findAllForJobPost();
  }

  @Get('benefit/:id')
  @ApiResponse({
    status: 200,
    type: CreateBenefitDto,
  })
  findOne(@Param('id') id: string) {
    return this.benefitsService.findOne(id);
  }

  @Patch('benefit/:id')
  update(@Param('id') id: string, @Body() updateBenefitDto: UpdateBenefitDto) {
    return this.benefitsService.update(id, updateBenefitDto);
  }

  @Delete('benefit/:id')
  remove(@Param('id') id: string) {
    return this.benefitsService.remove(id);
  }
}
