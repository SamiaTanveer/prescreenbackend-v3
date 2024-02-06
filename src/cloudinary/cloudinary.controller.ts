// import {
//   Controller,
//   Post,
//   UploadedFile,
//   UseInterceptors,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { CloudinaryService } from './cloudinary.service'; // Import your Cloudinary service

// @Controller('uploads')
// export class CloudinaryController {
//   constructor(private readonly cloudinaryService: CloudinaryService) {}

//   @Post('image')
//   @UseInterceptors(FileInterceptor('image')) // 'image' should match the field name in your form
//   async uploadImage(
//     @UploadedFile() file,
//     @Query('folder') folder: string,
//     @Query('preset') preset: string,
//   ) {
//     // Check if 'image' field is empty or file is not provided
//     if (!file) {
//       return { success: false, message: 'No image provided' };
//     }

//     try {
//       // Call your Cloudinary service to upload the image
//       const result = await this.cloudinaryService.uploadImage(
//         file,
//         folder,
//         preset,
//       );

//       // If the upload was successful, you can return the Cloudinary result
//       return { success: true, result };
//     } catch (error) {
//       // Handle errors, e.g., invalid file format, Cloudinary API errors, etc.
//       console.error('Error uploading image:', error);
//       return { success: false, message: 'Failed to upload image' };
//     }
//   }
// }
