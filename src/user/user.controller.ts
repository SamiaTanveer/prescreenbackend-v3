import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  UseGuards,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update_user.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create_user.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  candidatePaginationDto,
  candidateResponseDto,
  companyPaginationDto,
  companyResponseDto,
  message,
} from 'src/utils/classes';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { AuthReq } from 'src/types';
import { UpdateLoginDetail } from 'src/candidate/dto/updatecandidate.dto';
import { CompanyTeamGuard } from 'src/auth/jwt.team.guard';
import { checkUser } from 'src/utils/funtions';

@ApiTags('user module')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async userLogin(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // ******************** in use  ***************
  @Post('blockuser/:userid')
  @UseGuards(AuthGuard(), AdminGuard)
  async blockUser(@Param('userid') userid: string) {
    return this.userService.blockUser(userid);
  }

  // ******************** in use  ***************
  @Post('unblockuser/:userid')
  @ApiOperation({
    summary: 'Student Profile Unblock....and for company also',
    description: 'Unblock candidate from superAdmin dashboard and company',
  })
  @UseGuards(AuthGuard(), AdminGuard)
  async unblockUser(@Param('userid') userid: string) {
    return this.userService.unBlockUser(userid);
  }

  // **************************** in use *********************
  @Get('/allCompanies')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({
    summary: 'Manage Company --- Get all companies or filteration',
    description: 'Get all companies or paginate them',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the Companies',
    type: companyResponseDto,
  })
  async getAllCompanies(@Query() query: companyPaginationDto) {
    return await this.userService.findAll(query);
  }

  // **************************** in use *********************
  @Get('/allCandidates')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiOperation({
    summary: 'Manage Candidate --- Get all candidates or filteration',
    description: 'Get all Candidates or paginate them',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the Candidates',
    type: candidateResponseDto,
  })
  async getAllCandidates(@Query() query: candidatePaginationDto) {
    return await this.userService.findAllCandidates(query);
  }

  // ******************** in use ****************************
  @Get('companyStatisticsss')
  @ApiOperation({
    summary: 'Super Dashboard: analytics for superAdmin dashboard',
  })
  @ApiOperation({ summary: 'super dashboard, analytics' })
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @UseGuards(AuthGuard())
  async companyAnlytics(@Req() req: AuthReq) {
    const userid = checkUser(req.user.userType, req.user.company, req.user.id);
    return await this.userService.companyStatistics(userid);
  }

  @Get('admin-details')
  @UseGuards(AuthGuard(), AdminGuard)
  AdminDetails(@Req() req: AuthReq) {
    return this.userService.getAdminDetails(req.user.id);
  }

  // @Get('findById/:id')
  // async findById(@Param('id') id: string) {
  //   return await this.userService.findById(id);
  // }

  // *********************** in use ********************8
  @Get('superDashboardAnalytics')
  @ApiOperation({
    summary: 'Super Dashboard: analytics for superAdmin dashboard',
  })
  @ApiOperation({ summary: 'super dashboard, analytics' })
  @UseGuards(AuthGuard(), AdminGuard)
  async getAnalytics() {
    return await this.userService.superDashboardAnalytics();
  }

  @Get('adminAnalytics/:statusField')
  @UseGuards(AuthGuard(), AdminGuard)
  async getAnalyticsDetail(@Param('statusField') statusField: string) {
    return await this.userService.getAnalyticsDetail(statusField);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await this.userService.GetUser(id);
  }

  @Get('individualCompany/:userId')
  @ApiOperation({
    summary:
      'Super Company (User Preview): showing individual company after Manage Company for superAdmin',
  })
  @UseGuards(AuthGuard(), AdminGuard)
  async findById(@Param('userId') userId: string) {
    return await this.userService.individualCompany(userId);
  }

  @Get('/email/:email')
  @ApiOperation({ summary: 'Get a user by email' })
  @ApiOkResponse({
    status: 200,
    type: message,
  })
  async GetUserByEmail(@Param('email') email: string) {
    const result = await this.userService.findByEmail(email);

    if (result.user?.password == '') {
      return {
        message: 'User not found',
      };
    } else {
      return result;
    }
  }

  //  FIXME: not working here...
  @Put('updateLogin')
  // @Put('updateLogin/:id')
  @ApiOperation({
    summary:
      'Setting---->Login Detail(Candidate Screen)......Update login detail email, password',
  })
  @UseGuards(AuthGuard())
  updateLoginDetail(
    @Req() req: AuthReq,
    @Body() updateLoginDetail: UpdateLoginDetail,
  ) {
    // console.log(req.user.id);
    return this.userService.updateLoginDetail(
      req.user.id,
      // '65baa30d8267e6c1c1919cf1',
      updateLoginDetail,
    );
  }

  // FIXME: update corresponding user also...confrim it
  @Put(':id')
  @UseGuards(AuthGuard())
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
