import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from 'src/utils/classes';
export class UpdatePermissionUserDto {
  @ApiProperty({
    description: 'The email of the user',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

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
