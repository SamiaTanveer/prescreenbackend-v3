import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Picture } from 'src/utils/classes';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Chat GPT Clone',
    description: 'The project title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'project description',
    description: 'The project description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'project live url',
    description: 'The project live url here',
  })
  @IsString()
  @IsNotEmpty()
  liveUrl: string;

  @ApiProperty({ type: () => Picture, description: 'the image of the project' })
  @IsOptional()
  projectPic: Picture;

  @ApiProperty({ description: 'the skills used in project' })
  @IsOptional()
  skillsUsed: string[];

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  user: string;
}
