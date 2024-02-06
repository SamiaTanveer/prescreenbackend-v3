import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
@Injectable()
export class UploadService {
  readonly isMulter = this.configService.get('SERVER_TYPE') === 'multer';
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private configService: ConfigService,
  ) {}
  async upload(file: Express.Multer.File) {
    const { originalname, path } = file;
    // console.log(file);
    if (this.isMulter) {
      // console.log(this.configService.get('DOMAIN'));
      return {
        url: join(this.configService.get('DOMAIN')!, path),
        path,
        originalname,
      };
    } else {
      // const result = ({ secure_url, public_id } =
      const result = await this.cloudinaryService.uploadFile(file, 'uploads');
      // console.log('result', result);
      const lastSlashIndex = result.secure_url.lastIndexOf('/');
      const desiredPath = result.secure_url.substring(lastSlashIndex + 1);
      // console.log('desiredPath', desiredPath);
      return {
        url: result.secure_url,
        path: desiredPath,
        originalname,
      };
    }
  }

  // async uploads(files: Express.Multer.File[]) {
  //   const uploadedFiles = [];

  //   for (const file of files) {
  //     const { originalname, path } = file;
  //     let uploadResult;

  //     if (this.isMulter) {
  //       uploadResult = {
  //         url: join(this.configService.get('DOMAIN')!, path),
  //         path,
  //         originalname,
  //       };
  //     } else {
  //       const result = await this.cloudinaryService.uploadFile(file, 'uploads');
  //       console.log('result', result);
  //       const lastSlashIndex = result.secure_url.lastIndexOf('/');
  //       const desiredPath = result.secure_url.substring(lastSlashIndex + 1);

  //       uploadResult = {
  //         url: result.secure_url,
  //         path: desiredPath,
  //         originalname,
  //       };
  //     }

  //     console.log('uploadResult', uploadResult);

  //     uploadedFiles.push(uploadResult);
  //   }

  //   return uploadedFiles;
  // }

  // download(path: string, res: Response) {
  //   const url = join(__dirname, '../', path);
  //   res.download(url);
  // }
  // async update(file: Express.Multer.File, oldFilePath: string, userId: string) {
  //   const oldPath = join('./uploads', userId, oldFilePath);
  //   await this.remove(oldPath, userId);
  //   await this.upload(file);
  // }

  async remove(filePath: string, userId: string) {
    console.log('filepath', filePath);
    if (this.isMulter) {
      const path = join('./uploads', userId, filePath);
      console.log('path', path);
      await fs.unlink(path);
    } else {
      console.log('cloud...');
      const path = 'uploads/' + filePath.split('.')[0];
      const isDeleted = await this.cloudinaryService.deleteFile(path);
      if (isDeleted) {
        return { message: 'Image deleted' };
      }
    }
  }

  async uploads(files: Express.Multer.File[]) {
    const pairedImages = [];

    // if (pairedImages.length == 0) {
    //   throw new BadRequestException('Files object is incomplete');
    // }

    // Process files in pairs
    for (let i = 0; i < files.length; i += 2) {
      const screenImage = files[i];
      const userImage = files[i + 1];

      if (!screenImage || !userImage) {
        // Handle the case where there's an incomplete pair
        continue;
      }

      const screenResult = await this.uploadFile(screenImage, 'screens');
      const userResult = await this.uploadFile(userImage, 'users');

      const pair = {
        screen: {
          url: screenResult.secure_url,
          path: screenResult.secure_url.substring(
            screenResult.secure_url.lastIndexOf('/') + 1,
          ),
          originalname: screenImage.originalname,
        },
        user: {
          url: userResult.secure_url,
          path: userResult.secure_url.substring(
            userResult.secure_url.lastIndexOf('/') + 1,
          ),
          originalname: userImage.originalname,
        },
      };

      // pairedImages.push({ camObject: pair });
      // console.log('pair', pair);
      pairedImages.push(pair);
    }

    // console.log('pairedImages', pairedImages);
    return pairedImages;
  }

  async uploadFile(file: Express.Multer.File, folder: string) {
    if (!file) {
      throw new Error('File not provided');
    }

    if (this.isMulter) {
      // file upload logic for non-Cloudinary services
      const result = {
        secure_url: `YOUR_BASE_URL/${folder}/${file.filename}`,
      };

      return result;
    } else {
      return await this.cloudinaryService.uploadFile(file, folder);
    }
  }
}
