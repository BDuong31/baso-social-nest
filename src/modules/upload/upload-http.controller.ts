import { BadRequestException, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import fs from 'fs';
import { diskStorage } from "multer";
import { config } from "src/share/config";

// Lớp UploadHttpController cung cấp phương thức upload file
@Controller('/v1/upload-file')
export class UploadHttpController {

  // Phương thức upload file
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', {
    
    // Kiểm tra file có phải là hình ảnh không
    fileFilter: (req, file, cb) => {
      const isImage = file.mimetype.startsWith('image');

      if (isImage) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Invalid file type'), false);
      }
    },

    // Giới hạn kích thước file
    limits: {
      fileSize: 512 * 1024 * 1024 // 512 MB
    },
    
    // Lưu file vào thư mục uploads
    storage: diskStorage({
      destination: (req, file, cb) => {
        ensureDirectoryExistence('./uploads');
        cb(null, './uploads');
      },
      filename: function (req, file, cb) {
        const hrtime = process.hrtime();
        const prefix = `${hrtime[0] * 1e6}`;
        cb(null, `${prefix}_${file.originalname}`);
      }
    }),
  }))

  // Phương thức upload file
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileUploaded = {
      filename: file.originalname,
      url: `${config.upload.cdn}/${file.filename}`,
      ext: file.originalname.split('.').pop() || '',
      contentType: file.mimetype,
      size: file.size,
      file: file.buffer
    };

    return { data: fileUploaded };
  }
}

// Hàm đảm bảo thư mục tồn tại
const ensureDirectoryExistence = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};
