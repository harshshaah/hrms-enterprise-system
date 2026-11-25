import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/mongoose';

import {
  Model,
} from 'mongoose';

import {
  Document,
  DocumentDocument,
} from './schemas/document.schema';

import {
  CreateDocumentDto,
} from './dto/create-document.dto';

import {
  UpdateDocumentDto,
} from './dto/update-document.dto';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(Document.name)
    private readonly documentModel:
      Model<DocumentDocument>,
  ) {}

  async create(
    createDocumentDto: CreateDocumentDto,
  ) {
    const document =
      new this.documentModel(
        createDocumentDto,
      );

    const savedDocument =
      await document.save();

    return savedDocument;
  }

  async findAll() {
    return this.documentModel
      .find()
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  async findByEmployee(
    employeeId: string,
  ) {
    return this.documentModel
      .find({
        employeeId,
      })
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  async findOne(id: string) {
    const document =
      await this.documentModel
        .findById(id)
        .exec();

    if (!document) {
      throw new NotFoundException(
        'Document not found',
      );
    }

    return document;
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
  ) {
    const document =
      await this.documentModel
        .findByIdAndUpdate(
          id,
          updateDocumentDto,
          {
            new: true,
            runValidators: true,
          },
        )
        .exec();

    if (!document) {
      throw new NotFoundException(
        'Document not found',
      );
    }

    return document;
  }

  async deactivate(id: string) {
    const document =
      await this.documentModel
        .findByIdAndUpdate(
          id,
          {
            status: 'inactive',
          },
          {
            new: true,
          },
        )
        .exec();

    if (!document) {
      throw new NotFoundException(
        'Document not found',
      );
    }

    return {
      message:
        'Document deleted successfully',
      data: document,
    };
  }

  async activate(id: string) {
    const document =
      await this.documentModel
        .findByIdAndUpdate(
          id,
          {
            status: 'active',
          },
          {
            new: true,
          },
        )
        .exec();

    if (!document) {
      throw new NotFoundException(
        'Document not found',
      );
    }

    return {
      message:
        'Document activated successfully',
      data: document,
    };
  }
}