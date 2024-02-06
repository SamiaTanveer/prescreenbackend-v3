import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { NewTemplatePerObj, UserRole } from 'src/utils/classes';

export class CreateTeamPermDto {
  @ApiProperty({
    example: 'recruiter',
    description: 'interviewer, recruiter or admin',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  roleTitle: string;

  @ApiProperty({
    example: NewTemplatePerObj,
    description: 'The permissions of the user',
    type: NewTemplatePerObj,
  })
  permissionsAllowed: NewTemplatePerObj;
}
