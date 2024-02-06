import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';
import { Benefit } from './entities/benefit.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'node-schedule';
import { paginationDto } from 'src/utils/classes';

@Injectable()
export class BenefitsService {
  constructor(
    @InjectModel(Benefit.name) private benefitModel: Model<Benefit>,
    @InjectModel(Job.name) private jobModel: Model<Job>,
  ) {}

  async create(dto: CreateBenefitDto) {
    const existingTag = await this.benefitModel.findOne({
      title: { $regex: new RegExp(`^${dto.title}$`, 'i') },
    });

    if (existingTag) {
      throw new ConflictException('Benefit with similar name already exists');
    }

    return this.benefitModel.create(dto);
  }

  async findAll(query: paginationDto) {
    const { page, limit } = query;
    let result;
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.benefitModel.aggregate([
        {
          $facet: {
            benefits: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
      const benefits = result[0].benefits;
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

      return {
        benefits: benefits,
        total: totalDocs,
      };
    }
    // else {
    //   result = await this.benefitModel.aggregate([
    //     {
    //       $facet: {
    //         tags: [],
    //         totalDocs: [{ $count: 'count' }],
    //       },
    //     },
    //   ]);
    // }
    // const tags = result[0].tags;
    // const totalDocs =
    //   result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    // return {
    //   benefits: tags,
    //   total: totalDocs,
    // };
  }
  async findAllForJobPost() {
    return this.benefitModel.find();
  }

  // async findAll(page?: number, limit?: number, skillTitle?: string) {
  //   let result;
  //   if (page !== undefined && limit !== undefined) {
  //     let skip = (page - 1) * limit;
  //     if (skip < 0) {
  //       skip = 0;
  //     }

  //     result = await this.benefitModel.aggregate([
  //       {
  //         $facet: {
  //           allSkills: [{ $skip: skip }, { $limit: +limit }],
  //           totalDocs: [
  //             { $skip: skip },
  //             { $limit: +limit },
  //             { $count: 'count' },
  //           ],
  //         },
  //       },
  //     ]);

  //     if (skillTitle) {
  //       // Make the name case-insensitive also match substrings
  //       const matchStage = { title: { $regex: new RegExp(skillTitle, 'i') } };

  //       result = await this.benefitModel.aggregate([
  //         {
  //           $facet: {
  //             allSkills: [
  //               { $match: matchStage },
  //               { $skip: skip },
  //               { $limit: +limit },
  //             ],
  //             totalDocs: [
  //               { $match: matchStage },
  //               { $skip: skip },
  //               { $limit: +limit },
  //               { $count: 'count' },
  //             ],
  //           },
  //         },
  //       ]);
  //     }
  //   } else {
  //     result = await this.benefitModel.aggregate([
  //       {
  //         $facet: {
  //           allBenefits: [],
  //           totalDocs: [{ $count: 'count' }],
  //         },
  //       },
  //     ]);
  //   }
  //   const allSkills = result[0].allSkills;
  //   const totalDocs =
  //     result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
  //   if (!allSkills) {
  //     throw new NotFoundException('Failed to fetch SKills');
  //   }
  //   return {
  //     skills: allSkills,
  //     total: totalDocs,
  //   };
  // }

  async findOne(id: string) {
    const benefitFound = await this.benefitModel.findOne({
      _id: id,
    });

    if (!benefitFound) {
      throw new NotFoundException('Benefit not found');
    }
    return benefitFound;
  }

  async update(id: string, updateBenefitDto: UpdateBenefitDto) {
    const isUpdated = await this.benefitModel.findByIdAndUpdate(
      id,
      updateBenefitDto,
      {
        new: true,
      },
    );

    if (!isUpdated) {
      throw new NotFoundException('Benefit not found');
    }

    return {
      message: 'Benefit Updated Successfully',
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
      const isDeleted = await this.benefitModel.findByIdAndDelete(id);

      if (!isDeleted) {
        throw new NotFoundException('Benefit not found');
      }

      return {
        message: 'Benefit deleted Successfully',
      };
    }
  }
}
