import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from 'src/permissions/permission.service';

@Injectable()
export class CompanyTeamGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const reqPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );
    const user = context.switchToHttp().getRequest().user;
    const reqRoute = context.switchToHttp().getRequest().route.path;
    // console.log(reqRoute, reqPermission);
    const { userType } = user;
    // console.log('inside compayteam');
    // Checks for mcqs and superadmin
    if (reqRoute.includes('ByApplication/:id') && userType === 'superAdmin') {
      return true;
    }
    if (
      reqRoute.includes('assessments/allResults') &&
      userType === 'superAdmin'
    ) {
      return true;
    }
    if (reqRoute.includes('assessments/:id') && userType === 'superAdmin') {
      return true;
    }
    if (reqRoute.includes('search-mcqs') && userType === 'superAdmin') {
      return true;
    }
    if (reqRoute.includes('create-mcqs') && userType === 'superAdmin') {
      return true;
    }
    if (reqRoute.includes('mcq-questions/:id') && userType === 'superAdmin') {
      return true;
    }
    if (reqRoute.includes('mcq-questions') && userType === 'superAdmin') {
      return true;
    }
    if (reqRoute.includes('all-questions') && userType === 'superAdmin') {
      return true;
    }
    if (
      reqRoute.includes('mcq-questionsByDifficulty') &&
      userType === 'superAdmin'
    ) {
      return true;
    }

    // Checks for codings and superadmin
    if (
      reqRoute.includes('search-codingQuestions') &&
      userType === 'superAdmin'
    ) {
      return true;
    }
    if (reqRoute.includes('coding-questions') && userType === 'superAdmin') {
      return true;
    }
    if (
      reqRoute.includes('coding-questions/generalQuest') &&
      userType === 'superAdmin'
    ) {
      return true;
    }
    if (
      reqRoute.includes('coding-questions/:id') &&
      userType === 'superAdmin'
    ) {
      return true;
    }
    if (
      reqRoute.includes('coding-questionsByDifficulty') &&
      userType === 'superAdmin'
    ) {
      return true;
    }
    if (
      reqRoute.includes('coding-questions/:id') &&
      userType === 'superAdmin'
    ) {
      return true;
    }
    // It allows both, to update and delete
    if (
      reqRoute.includes('coding-questions/:id') &&
      userType === 'superAdmin'
    ) {
      return true;
    }

    // Checks for Tests and superadmin
    if (reqRoute.includes('createTest') && userType === 'superAdmin') {
      return true;
    }
    if (reqRoute.includes('createManualTest') && userType === 'superAdmin') {
      return true;
    }

    // Checks for Tags and superadmin
    if (reqRoute.includes('create-tag') && userType === 'superAdmin') {
      return true;
    }
    if (reqRoute.includes('getTags') && userType === 'superAdmin') {
      return true;
    }
    if (reqRoute.includes('getTag/:id') && userType === 'superAdmin') {
      return true;
    }
    if (reqRoute.includes('updateTag/:id') && userType === 'superAdmin') {
      return true;
    }
    if (reqRoute.includes('deleteTag/:id') && userType === 'superAdmin') {
      return true;
    }
    if (reqRoute.includes('create-Test') && userType === 'superAdmin') {
      return true;
    }
    if (reqRoute.includes('createManualTest') && userType === 'superAdmin') {
      return true;
    }
    if (reqRoute.includes('tests/:testId') && userType === 'superAdmin') {
      return true;
    }
    if (reqRoute.includes('tests/remove/:id') && userType === 'superAdmin') {
      return true;
    }

    if (user && userType === 'company') {
      return true;
    }
    // console.log('Logged in user....', user);
    if (user && userType === 'candidate') {
      throw new UnauthorizedException(
        `You don't have enough permission to access thir route`,
      );
    }

    const permissionUserFound = await this.permissionService.findOneByUserId(
      user.id,
    );
    // console.log('peremisison user model found.....', permissionUserFound);
    // console.log('requred permisison for route');

    // Allow permissions for team members else than company and superAdmin
    const hasPermission = Object.entries(
      permissionUserFound.permission.permissionsAllowed,
    ).some(([key, value]) => key === reqPermission && value === true);
    // console.log('Permissions!', permissionUserFound);
    // console.log('hasPermission!', hasPermission);

    // now check for permissions
    if (hasPermission) {
      return true;
    } else {
      throw new UnauthorizedException('You donot have enough permission');
    }
  }
}
