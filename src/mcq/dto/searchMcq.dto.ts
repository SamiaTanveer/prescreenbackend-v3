import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class MCQSearchDto {
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
  @IsEnum(['easy', 'medium', 'hard'])
  difficultyLevel: string;

  @ApiPropertyOptional()
  @IsOptional()
  tags: string;

  @ApiPropertyOptional()
  @IsOptional()
  page: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit: number;
}
