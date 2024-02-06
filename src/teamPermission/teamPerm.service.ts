import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'node-schedule';
import { paginationDto } from 'src/utils/classes';
import { TeamPermission } from './entities/teamPermission.entity';
import { CreateTeamPermDto } from './dto/create-TeamPerm.dto';
import { UpdateTeamPermDto } from './dto/update-TeamPerm.dto';

@Injectable()
export class TeamPermissionService {
  constructor(
    @InjectModel(TeamPermission.name)
    private teamPermModel: Model<TeamPermission>,
    @InjectModel(Job.name) private jobModel: Model<Job>,
  ) {}

  async create(dto: CreateTeamPermDto) {
    const existingRole = await this.teamPermModel.findOne({
      roleTitle: { $regex: new RegExp(`^${dto.roleTitle}$`, 'i') },
    });

    if (existingRole) {
      throw new ConflictException(
        'Team Permission with similar role already exists',
      );
    }

    return this.teamPermModel.create(dto);
  }

  async findAll(query: paginationDto) {
    const { page, limit } = query;
    let result;
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.teamPermModel.aggregate([
        {
          $facet: {
            roles: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.teamPermModel.aggregate([
        {
          $facet: {
            roles: [],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const roles = result[0].roles;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      roles,
      total: totalDocs,
    };
  }

  async findAllForCompany() {
    const roles = await this.teamPermModel.find().select('-permissionsAllowed');

    if (!roles) {
      throw new NotFoundException('No team permissions found');
    }
    return roles;
  }

  async findOne(id: string) {
    const RoleFound = await this.teamPermModel.findById(id);

    if (!RoleFound) {
      throw new NotFoundException('Role not found');
    }
    return RoleFound;
  }

  async update(id: string, dto: UpdateTeamPermDto) {
    const isUpdated = await this.teamPermModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!isUpdated) {
      throw new NotFoundException('Role not found');
    }

    return {
      message: 'Role Updated Successfully',
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
      const isDeleted = await this.teamPermModel.findByIdAndDelete(id);

      if (!isDeleted) {
        throw new NotFoundException('Benefit not found');
      }

      return {
        message: 'Benefit deleted Successfully',
      };
    }
  }
}
