import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import {
  RolesGuard,
} from '../auth/guards/roles.guard';

import {
  Roles,
} from '../auth/decorators/roles.decorator';

import {
  CloudinaryService,
} from '../common/cloudinary/cloudinary.service';

import {
  DocumentService,
} from './document.service';

import {
  CreateDocumentDto,
} from './dto/create-document.dto';

import {
  UpdateDocumentDto,
} from './dto/update-document.dto';

import {
  UploadDocumentDto,
} from './dto/upload-document.dto';

@Controller('documents')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class DocumentController {
  constructor(
    private readonly documentService:
      DocumentService,

    private readonly cloudinaryService:
      CloudinaryService,
  ) {}

  @Post('upload')
  @Roles('admin', 'hr')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize:
          5 * 1024 * 1024,
      },

      fileFilter: (
        req,
        file,
        callback,
      ) => {
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
        ];

        if (
          !allowedTypes.includes(
            file.mimetype,
          )
        ) {
          callback(
            new BadRequestException(
              'Only PDF, JPG and PNG files are allowed',
            ),
            false,
          );

          return;
        }

        callback(
          null,
          true,
        );
      },
    }),
  )
  async upload(
    @UploadedFile()
    file: any,

    @Body()
    uploadDocumentDto:
      UploadDocumentDto,

    @Req()
    request: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Document file is required',
      );
    }

    const uploadedFile =
      await this.cloudinaryService.uploadFile(
        file,
        'hrms/documents',
      );

    const document =
      await this.documentService.create({
        employeeId:
          uploadDocumentDto.employeeId,

        documentType:
          uploadDocumentDto.documentType,

        documentName:
          uploadDocumentDto.documentName,

        fileName:
          file.originalname,

        fileUrl:
          uploadedFile.secure_url,

        uploadedBy:
          request.user.email,

        publicId:
          uploadedFile.public_id,

        resourceType:
          uploadedFile.resource_type,
      } as any);

    return {
      success: true,
      message:
        'Document uploaded successfully',
      data: document,
    };
  }

  @Post()
  @Roles('admin', 'hr')
  async create(
    @Body()
    createDocumentDto: CreateDocumentDto,
  ) {
    const document =
      await this.documentService.create(
        createDocumentDto,
      );

    return {
      success: true,
      message:
        'Document created successfully',
      data: document,
    };
  }

  @Get()
  @Roles('admin', 'hr', 'employee')
  async findAll() {
    const documents =
      await this.documentService.findAll();

    return {
      success: true,
      message:
        'Documents fetched successfully',
      data: documents,
    };
  }

  @Get('employee/:employeeId')
  @Roles('admin', 'hr', 'employee')
  async findByEmployee(
    @Param('employeeId')
    employeeId: string,
  ) {
    const documents =
      await this.documentService.findByEmployee(
        employeeId,
      );

    return {
      success: true,
      message:
        'Employee documents fetched successfully',
      data: documents,
    };
  }

  @Get(':id')
  @Roles('admin', 'hr', 'employee')
  async findOne(
    @Param('id')
    id: string,
  ) {
    const document =
      await this.documentService.findOne(
        id,
      );

    return {
      success: true,
      message:
        'Document fetched successfully',
      data: document,
    };
  }

  @Patch(':id')
  @Roles('admin', 'hr')
  async update(
    @Param('id')
    id: string,

    @Body()
    updateDocumentDto: UpdateDocumentDto,
  ) {
    const document =
      await this.documentService.update(
        id,
        updateDocumentDto,
      );

    return {
      success: true,
      message:
        'Document updated successfully',
      data: document,
    };
  }

  @Patch(':id/activate')
  @Roles('admin', 'hr')
  async activate(
    @Param('id')
    id: string,
  ) {
    const result =
      await this.documentService.activate(
        id,
      );

    return {
      success: true,
      ...result,
    };
  }

  @Delete(':id')
  @Roles('admin')
  async deactivate(
    @Param('id')
    id: string,
  ) {
    const result =
      await this.documentService.deactivate(
        id,
      );

    return {
      success: true,
      ...result,
    };
  }
}