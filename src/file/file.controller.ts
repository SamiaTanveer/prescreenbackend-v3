import {
  Controller,
  Post,
  Param,
  Req,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { UploadService } from './file.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthReq } from 'src/types';

@ApiTags('upload files')
@Controller('/api/file')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
        },
        originalname: {
          type: 'string',
        },
        path: {
          type: 'string',
        },
      },
    },
  })
  async upload(@Req() req: AuthReq, @UploadedFile() file: Express.Multer.File) {
    console.log('cont::', req.user.id);
    // console.log('file', file);
    const res = await this.uploadService.upload(file);
    console.log('res', res);
    return res;
  }

  @Post('uploads')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @ApiOperation({
    summary: 'Upload multiple pairs of images (screen and user)',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files')) // 👈  using FilesInterceptor here
  // @UseInterceptors(
  //   FilesInterceptor('files', 20), // Adjust the maxCount based on your needs
  // )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array', // 👈  array of files
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          screen: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              originalname: { type: 'string' },
              path: { type: 'string' },
            },
          },
          user: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              originalname: { type: 'string' },
              path: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async uploads(
    @Req() req: AuthReq,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    console.log('req.user>', req.user.id);
    const result = await this.uploadService.uploads(files);
    console.log('result', result);
    return result;
  }

  @Delete(':path')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  remove(@Param('path') path: string, @Req() req: any) {
    const { id } = req.user;
    return this.uploadService.remove(path, id);
  }
}
