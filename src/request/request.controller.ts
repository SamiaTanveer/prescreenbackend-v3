import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  SetMetadata,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthReq } from 'src/types';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { paginationDto, requestResponse } from 'src/utils/classes';
import { CompanyTeamGuard } from 'src/auth/jwt.team.guard';
import { checkUser } from 'src/utils/funtions';

@ApiTags('Requests')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('api/request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post('/create-request')
  @UseGuards(AuthGuard(), CompanyTeamGuard)
  @SetMetadata('permission', 'tags_write')
  @ApiResponse({
    status: 201,
    type: requestResponse,
  })
  create(@Body() dto: CreateRequestDto, @Req() req: AuthReq) {
    const userid = checkUser(req.user.userType, req.user.company, req.user.id);
    dto.requestedBy = '65180a56c3f19457f7e49a09';
    dto.requestStatus = 'pending';
    return this.requestService.create(dto);
  }

  @Get('allRequests')
  @UseGuards(AuthGuard(), AdminGuard)
  findAll(@Query() query: paginationDto) {
    return this.requestService.findAll(query);
  }

  // @Get('allRequests')
  // @ApiOperation({
  //   summary: 'Show requests to companies along status',
  // })
  // @UseGuards(AuthGuard(), CompanyTeamGuard)
  // @SetMetadata('permission', 'tags_write')
  // findAllReq(@Query() query: paginationDto) {
  //   return this.requestService.compRequests(query);
  // }

  @Get('request/:id')
  findOne(@Param('id') id: string) {
    return this.requestService.findOne(id);
  }

  @Patch('acceptRequest/:id')
  @UseGuards(AuthGuard(), AdminGuard)
  updateStatus(@Param('id') id: string) {
    return this.requestService.acceptRequest(id);
  }

  @Patch('rejectRequest/:id')
  @UseGuards(AuthGuard(), AdminGuard)
  rejectRequest(@Param('id') id: string) {
    return this.requestService.rejectRequest(id);
  }

  @Patch('request/:id')
  @UseGuards(AuthGuard(), AdminGuard)
  update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto) {
    return this.requestService.update(id, updateRequestDto);
  }

  // @Delete('request/:id')
  // remove(@Param('id') id: string) {
  //   return this.requestService.remove(id);
  // }
}
