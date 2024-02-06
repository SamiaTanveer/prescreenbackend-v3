import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  browseCompanyPaginationDto,
  companyPaginationDto,
  companyResponseDto,
} from 'src/utils/classes';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { CandidateGuard } from 'src/auth/jwt.candidate.guard';

@ApiTags('Company')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('/api')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // TODO: Where is it being used?
  @Get('/companies')
  @ApiOperation({
    summary: 'Get all active companies or search by companyTitle',
    description:
      'Get all active companies or paginate them OR search a company by name',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the active Companies',
    type: companyResponseDto,
  })
  async getActiveCompanies(@Query() query: companyPaginationDto) {
    return await this.companyService.findActiveCompanies(query);
  }

  @Get('/browseCompanies')
  @ApiOperation({
    summary:
      'Browse companies(Home Screen): Get all active companies or search by companyTitle or location',
    description:
      'Get all active companies or paginate them OR search a company by name',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the active Companies',
    type: companyResponseDto,
  })
  async browseCompanies(@Query() query: browseCompanyPaginationDto) {
    return await this.companyService.browseCompanies(query);
  }

  @Get('/browseCompanies')
  @ApiOperation({
    summary:
      'Browse companies(Candidate Screens): Get all active companies or search by companyTitle or location',
    description:
      'Get all active companies or paginate them OR search a company by name',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the active Companies',
    type: companyResponseDto,
  })
  @UseGuards(AuthGuard(), CandidateGuard)
  async compForCandidate(@Query() query: browseCompanyPaginationDto) {
    return await this.companyService.browseCompanies(query);
  }

  @Get('/allCompanies')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({
    summary: 'Get all companies or search by companyTitle',
    description:
      'Get all companies or paginate them OR search a company by name',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the Companies',
    type: companyResponseDto,
  })
  async getAllCompanies(@Query() query: companyPaginationDto) {
    return await this.companyService.findAll(query);
  }

  // @Get('companyProfileForCandidate/:id')
  // @UseGuards(AuthGuard())
  // async companyProfile(@Param('id') id: string) {
  //   return await this.companyService.companyProfile(id);
  // }

  @Get('/companies/:companyId')
  @ApiOperation({ summary: 'Get the company by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the Company by id',
    type: UpdateCompanyDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  getCompanyById(@Param('companyId') companyId: string) {
    return this.companyService.findById(companyId);
  }

  @Get('/companies/profile/:companyId')
  @ApiOperation({ summary: 'Get the company profile by ID' })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  getCompanyProfileById(@Param('companyId') companyId: string) {
    return this.companyService.getCompanyProfileById(companyId);
  }

  // @Get('companyAnalytics')
  // @ApiOperation({
  //   summary:
  //     'Company Dashboard.....Get the company analytics for its dashboard',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Company not found',
  // })
  // @UseGuards(AuthGuard())
  // companyAnalytics(@Req() req: AuthReq) {
  //   // console.log(req.user.id);
  //   return this.companyService.companyAnalytics(req.user.id);
  // }

  @Put('/companies/:userId')
  async updateCompany(
    @Param('userId') userId: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companyService.update(userId, updateCompanyDto);
  }
}
