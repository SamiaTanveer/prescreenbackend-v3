import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { Readable } from 'stream';
// import streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    preset?: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    // console.log('cloudinaryPreset..', preset);
    return new Promise((resolve, reject) => {
      // Convert the buffer to a readable stream using streamifier
      // const stream = streamifier.createReadStream(file.buffer);
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);
      const upload = v2.uploader.upload_stream(
        {
          folder,
          upload_preset: preset,
        },
        (error, result) => {
          if (error) return reject(new BadRequestException(error));
          // Check if result is defined before accessing properties
          if (result?.public_id) {
            resolve(result);
          } else {
            reject(new BadRequestException('Failed to upload file.'));
            // reject(new Error('Failed to upload file.'));
          }
        },
      );

      stream.pipe(upload);
    });
  }

  async deleteFile(publicId: string): Promise<boolean> {
    return new Promise((resolve) => {
      v2.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error('Error deleting image:', error);
          resolve(false);
        } else {
          console.log('Image deletion', result);
          resolve(true);
        }
      });
    });
  }
}
