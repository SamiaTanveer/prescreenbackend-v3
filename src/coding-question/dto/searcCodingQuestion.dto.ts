import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class CodingSearchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  functionName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficultyLevel: string;

  @ApiPropertyOptional()
  @IsOptional()
  // @IsArray()
  tag: string;
}
