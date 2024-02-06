import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { paginationDto } from 'src/utils/classes';
import { Job } from 'node-schedule';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Job.name) private jobModel: Model<Job>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const existingCategory = await this.categoryModel.findOne({
      categoryName: { $regex: new RegExp(`^${dto.categoryName}$`, 'i') },
    });

    if (existingCategory) {
      throw new ConflictException('Category with similar name already exists');
    }
    const newcaat = new this.categoryModel(dto);
    await newcaat.save();
    return newcaat;
  }

  async findAll(query: paginationDto) {
    const { page, limit } = query;
    let result;
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.categoryModel.aggregate([
        {
          $facet: {
            tags: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.categoryModel.aggregate([
        {
          $facet: {
            tags: [],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const tags = result[0].tags;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      categories: tags,
      total: totalDocs,
    };
  }
  async findAllForJobPost() {
    return this.categoryModel.find();
  }

  async findOne(id: string) {
    const tagFound = await this.categoryModel.findOne({
      _id: id,
    });

    if (!tagFound) {
      throw new NotFoundException('Category not found');
    }
    return tagFound;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const isUpdated = await this.categoryModel.findByIdAndUpdate(
      id,
      updateCategoryDto,
      {
        new: true,
      },
    );

    if (!isUpdated) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'Category Updated Successfully',
    };
  }

  async remove(id: string) {
    // Check if the tag is used in any MCQ, CodingQuestion, or Exam
    const usedInJob = await this.jobModel.find({ tags: id });

    // Prepare a list of resources where the tag is used
    const usedInResources = [];
    if (usedInJob)
      usedInResources.push([
        ...usedInJob.map((item) => {
          return {
            id: item.id,
            // TODO:
            // title: item.title,
          };
        }),
      ]);

    const allArraysEmpty = usedInResources.every(
      (arr: any[]) => arr.length === 0,
    );
    if (!allArraysEmpty) {
      // The tag is used in some resources, return a response indicating where it's used
      throw new BadRequestException(
        'This Category cannot be deleted as it is being used',
      );
    } else {
      // The Category is not used in any resources, proceed with deletion
      const isDeleted = await this.categoryModel.findByIdAndDelete(id);

      if (!isDeleted) {
        throw new NotFoundException('Category not found');
      }

      return {
        message: 'Category deleted Successfully',
      };
    }
  }
}
