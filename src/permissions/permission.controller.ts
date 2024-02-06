import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  Req,
  Put,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionUserDto } from './dto/create-permission.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CompanyGuard } from 'src/auth/jwt.company.guard';
import { UserService } from 'src/user/user.service';
import { AuthReq } from 'src/types';
import { encryptData } from 'src/utils/encryptDecrypt';
import { PermissionsUserModel } from './entities/permission.entity';
import { UpdatePermissionUserDto } from './dto/update-permission.dto';

@ApiTags('PermissionTemplate')
@Controller('/api')
export class PermissionController {
  constructor(
    private readonly templateService: PermissionService,
    private readonly userService: UserService,
  ) {}

  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @Post('/create-permissionUserModel')
  @UseGuards(AuthGuard(), CompanyGuard)
  async create(@Body() dto: CreatePermissionUserDto, @Req() req: AuthReq) {
    // first create a user model
    const { email, password, role } = dto;
    // find already present user in db with this email
    const existingUser = await this.userService.findOneUserByemail(email);
    if (existingUser) {
      throw new BadRequestException('Email exists, Kindly use another email');
    }

    try {
      // make the user model first
      const hashedPass = await encryptData(password);
      const isCreated = await this.userService.create({
        email,
        password: hashedPass,
        userType: role,
        company: req.user.id,
        isEmailVerified: true,
      });
      // console.log('user created...', isCreated);

      // then create a permission user model
      const { permission } = dto;

      const created = await this.templateService.create({
        user: isCreated.id,
        permission,
        userCompany: req.user.id,
      });

      return created;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('/getAllMembersOfaCompany/:userid')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiOperation({
    description: 'Get team members',
  })
  // @ApiOkResponse({
  //   type: ,
  // })
  findAll(@Param('userid') userid: string): Promise<PermissionsUserModel[]> {
    return this.templateService.findAll(userid);
  }

  @Get('/getsingleTeamMember/:id')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiSecurity('JWT-auth')
  // @ApiResponse({
  //   status: 200,
  //   type: CreatePermissionUserDto,
  // })
  findOne(@Param('id') id: string): Promise<PermissionsUserModel> {
    return this.templateService.findOne(id);
  }

  @Put('/updateTeamMemberInfo/:id')
  @ApiResponse({
    status: 200,
    type: UpdatePermissionUserDto,
  })
  update(@Param('id') id: string, @Body() dto: UpdatePermissionUserDto) {
    return this.templateService.update(id, dto);
  }

  @Delete('/removeTeamMember/:id')
  // @UseGuards(AuthGuard(), CompanyGuard)
  async remove(@Param('id') id: string) {
    // find the user model from the Team member model
    const teamMember = await this.templateService.findOne(id);
    // first remove its user model
    await this.userService.remove(teamMember.user._id);
    // now remove the permisson user model
    return await this.templateService.removeMember(id);
  }
}
