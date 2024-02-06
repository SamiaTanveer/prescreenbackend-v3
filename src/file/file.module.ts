import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './file.service';
import { UploadController } from './file.controller';
import { ISimpleUser } from 'src/utils/types';
import { checkDirAndCreate } from 'src/utils/file';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    CloudinaryModule,
    ConfigModule,
    AuthModule,
    MulterModule.register(
      process.env.SERVER_TYPE === 'multer'
        ? {
            storage: diskStorage({
              destination: (req, file, cb) => {
                const { id } = req.user as ISimpleUser;
                // console.log('id', id);
                const filePath = `uploads/${id}`;
                checkDirAndCreate(filePath);
                return cb(null, filePath);
              },
              filename: (_, file, cb) => {
                const randomName = Array(32)
                  .fill(null)
                  .map(() => Math.round(Math.random() * 16).toString(16))
                  .join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
              },
            }),
            fileFilter: (req, file, cb) => {
              const allowedFileTypes = [
                '.jpg',
                '.jpeg',
                '.png',
                '.gif',
                '.pdf',
              ];
              const fileExt = extname(file.originalname).toLowerCase();
              if (allowedFileTypes.includes(fileExt)) {
                cb(null, true);
              } else {
                cb(new BadRequestException('Invalid file type'), false);
                // cb(new Error('Invalid file type'), false);
              }
            },
            limits: {
              fileSize: 5 * 1024 * 1024, // 5MB (in bytes)
            },
          }
        : {},
    ),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
