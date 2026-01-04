import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UPLOAD_FILE_PATH } from './upload';
import { Express } from 'express';

@Controller('uploads')
export class UploadsController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_FILE_PATH,
        filename: (_req, file, callback) => {
          const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileName = `${file.fieldname}-${suffix}.json`;
          callback(null, fileName);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (file.mimetype !== 'application/json') {
          return callback(
            new BadRequestException('Only JSON files accepted'),
            false
          );
        }
        callback(null, true);
      },
    })
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'File Uploaded Successfully!',
      filename: file.filename,
    };
  }
}
