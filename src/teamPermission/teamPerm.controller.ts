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
  TeamPermRes,
  benefitResponse,
  paginationDto,
  rolesResponse,
} from 'src/utils/classes';
import { TeamPermissionService } from './teamPerm.service';
import { CreateTeamPermDto } from './dto/create-TeamPerm.dto';
import { UpdateTeamPermDto } from './dto/update-TeamPerm.dto';

@ApiTags('Team Permissions Module')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('api/teamPermissions')
export class TeamPermController {
  constructor(private readonly teamPerService: TeamPermissionService) {}

  @Post('create-RoleWithPermission')
  // @UseGuards(AuthGuard(), AdminGuard)
  @ApiResponse({
    status: 201,
    type: TeamPermRes,
  })
  create(@Body() dto: CreateTeamPermDto) {
    return this.teamPerService.create(dto);
  }

  @Get('allRoles')
  @ApiResponse({
    status: 200,
    type: rolesResponse,
  })
  // @UseGuards(AuthGuard(), AdminGuard)
  findAll(@Query() query: paginationDto) {
    return this.teamPerService.findAll(query);
  }

  @Get('allRolesToCompany')
  @ApiResponse({
    status: 200,
    type: rolesResponse,
  })
  findAllRolesForCompany() {
    return this.teamPerService.findAllForCompany();
  }

  @Get('singleRole/:id')
  @ApiResponse({
    status: 200,
    type: TeamPermRes,
  })
  findOne(@Param('id') id: string) {
    return this.teamPerService.findOne(id);
  }

  @Patch('editRole/:id')
  // @UseGuards(AuthGuard(), AdminGuard)
  update(@Param('id') id: string, @Body() dto: CreateTeamPermDto) {
    return this.teamPerService.update(id, dto);
  }

  @Delete('removeRole/:id')
  // @UseGuards(AuthGuard(), AdminGuard)
  remove(@Param('id') id: string) {
    return this.teamPerService.remove(id);
  }
}
