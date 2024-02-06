import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BenefitsService } from 'src/benefits/benefits.service';
import { CreateBenefitDto } from 'src/benefits/dto/create-benefit.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { Request } from './entities/request.entity';
import { CreateCategoryDto } from 'src/categories/dto/create-category.dto';
import { SkillService } from 'src/skills/skill.service';
import { CreateSkillDto } from 'src/skills/dto/create-skill.dto';
import { paginationDto } from 'src/utils/classes';
// import { Benefit } from 'src/benefits/entities/benefit.entity';
// import { Category } from 'src/categories/entities/category.entity';
// import { Skill } from 'src/skills/entities/skill.entity';

@Injectable()
export class RequestService {
  constructor(
    private readonly benefitsService: BenefitsService,
    private readonly categoriesService: CategoriesService,
    private readonly skillService: SkillService,
    @InjectModel(Request.name) private requestModel: Model<Request>,
    // @InjectModel(Benefit.name) private benefitModel: Model<Benefit>,
    // @InjectModel(Category.name) private categoryModel: Model<Category>,
    // @InjectModel(Skill.name) private skillModel: Model<Skill>,
  ) {}

  async create(dto: CreateRequestDto) {
    if (dto.type == 'benefit') {
      const existingPerk = await this.requestModel.findOne({
        title: { $regex: new RegExp(`^${dto.requestField.title}$`, 'i') },
      });

      if (existingPerk) {
        throw new ConflictException(
          'benefit with similar title already exists',
        );
      }
      return this.requestModel.create(dto);
    } else if (dto.type == 'category') {
      const existingCategory = await this.requestModel.findOne({
        name: { $regex: new RegExp(`^${dto.requestField.name}$`, 'i') },
      });

      if (existingCategory) {
        throw new ConflictException(
          'Category with similar name already exists',
        );
      }
      console.log(dto);
      return this.requestModel.create(dto);
    } else if (dto.type == 'skill') {
      const existingCategory = await this.requestModel.findOne({
        skillTitle: {
          $regex: new RegExp(`^${dto.requestField.skillTitle}$`, 'i'),
        },
      });

      if (existingCategory) {
        throw new ConflictException('Skill with similar name already exists');
      }
      return this.requestModel.create(dto);
    }
  }

  async findAll(query: paginationDto) {
    const { page, limit } = query;
    let result;
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.requestModel.aggregate([
        {
          $facet: {
            tags: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
      const tags = result[0].tags;
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

      return {
        requests: tags,
        total: totalDocs,
      };
    }
    // else {
    //   result = await this.requestModel.aggregate([
    //     {
    //       $facet: {
    //         tags: [],
    //         totalDocs: [{ $count: 'count' }],
    //       },
    //     },
    //   ]);
    // }
  }

  async compRequests() {}

  async findOne(id: string) {
    const foundRequest = await this.requestModel.findOne({
      _id: id,
    });

    if (!foundRequest) {
      throw new NotFoundException('Request not found');
    }
    return foundRequest;
  }

  async acceptRequest(id: string) {
    const findType = await this.requestModel.findOne({ _id: id });

    if (!findType) {
      throw new NotFoundException('not found');
    }

    if (findType.type === 'benefit') {
      const createBenefitDto: CreateBenefitDto = {
        title: findType.requestField.title,
        description: findType.requestField.description,
        // createdBy: userId,
      };
      await this.benefitsService.create(createBenefitDto);
    } else if (findType.type === 'category') {
      const createCategoryDto: CreateCategoryDto = {
        categoryName: findType.requestField.name,
        icon: findType.requestField.icon,
        // createdBy: userId,
      };

      await this.categoriesService.create(createCategoryDto);
    } else if (findType.type === 'skill') {
      const createSkillDto: CreateSkillDto = {
        title: findType.requestField.skillTitle,
        // createdBy: userId,
      };
      await this.skillService.create(createSkillDto);
    }

    const isUpdated = await this.requestModel.findByIdAndUpdate(
      id,
      { requestStatus: 'accepted' },
      {
        new: true,
      },
    );
    if (!isUpdated) {
      throw new NotFoundException('Request not found');
    }

    return {
      message: `${findType.type} created Successfully`,
    };
  }

  async rejectRequest(id: string) {
    const isUpdated = await this.requestModel.findByIdAndUpdate(
      id,
      { requestStatus: 'rejected' },
      {
        new: true,
      },
    );
    if (!isUpdated) {
      throw new NotFoundException('Request not found');
    }
    return {
      message: 'Request rejected.',
    };
  }

  async update(id: string, updateRequestDto: UpdateRequestDto) {
    const isUpdated = await this.requestModel.findByIdAndUpdate(
      id,
      updateRequestDto,
      {
        new: true,
      },
    );

    if (!isUpdated) {
      throw new NotFoundException('Request not found');
    }

    return {
      message: 'Request Updated Successfully',
    };
  }
}
