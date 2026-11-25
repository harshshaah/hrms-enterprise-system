import {
  Module,
} from '@nestjs/common';

import {
  MongooseModule,
} from '@nestjs/mongoose';

import {
  CloudinaryModule,
} from '../common/cloudinary/cloudinary.module';

import {
  Document,
  DocumentSchema,
} from './schemas/document.schema';

import {
  DocumentController,
} from './document.controller';

import {
  DocumentService,
} from './document.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Document.name,
        schema: DocumentSchema,
      },
    ]),

    CloudinaryModule,
  ],

  controllers: [
    DocumentController,
  ],

  providers: [
    DocumentService,
  ],

  exports: [
    DocumentService,
  ],
})
export class DocumentModule {}