import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateInviteDto {
  @ApiProperty({
    description: 'email to send exam invite',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'ref id of job',
  })
  @IsNotEmpty()
  job: string;

  @ApiProperty({
    description: 'Expiry date',
  })
  @IsNotEmpty()
  expiryTime: Date;

  @ApiHideProperty()
  identifier: string;
}
