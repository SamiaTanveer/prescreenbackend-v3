import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/utils/classes';

/*
 LOGIC: Now super admin will assign permissions to the roles (interviewer, recruiter, admin)

 1. First make all permissions Object >>>>>>>>>>>>>>>

 2. Roles with permission MODEL.....CRUD >>>>>>>>>>>>>

 3. Now companies UI to add new users (role, email, password) >>>>>>>>>>>>>

 Company will add users (admin, recruiter, interviewer) and all will be assigned their respective permissions
*/
export class CreatePermissionUserDto {
  @ApiHideProperty()
  @IsOptional()
  user?: string;

  // below info is needed to create a user model

  @ApiProperty({
    description: 'The email of the user',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'ref id of the role',
    type: String,
    example: 'ref id',
  })
  permission: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  @IsString()
  role: string;
}
