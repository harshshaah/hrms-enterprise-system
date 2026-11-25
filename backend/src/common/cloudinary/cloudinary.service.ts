import {
  Injectable,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  v2 as cloudinary,
} from 'cloudinary';

import {
  Readable,
} from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name:
        this.configService.get<string>(
          'CLOUDINARY_CLOUD_NAME',
        ),

      api_key:
        this.configService.get<string>(
          'CLOUDINARY_API_KEY',
        ),

      api_secret:
        this.configService.get<string>(
          'CLOUDINARY_API_SECRET',
        ),
    });
  }

  async uploadFile(
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
    folder: string,
  ) {
    return new Promise<any>(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: 'auto',
            },

            (
              error,
              result,
            ) => {
              if (error) {
                reject(error);
                return;
              }

              resolve(result);
            },
          );

        Readable.from(
          file.buffer,
        ).pipe(uploadStream);
      },
    );
  }

  async deleteFile(
    publicId: string,
    resourceType = 'image',
  ) {
    return cloudinary.uploader.destroy(
      publicId,
      {
        resource_type:
          resourceType,
      },
    );
  }
}