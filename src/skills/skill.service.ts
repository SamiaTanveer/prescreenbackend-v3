import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skil.dto';
import { Job } from 'node-schedule';

@Injectable()
export class SkillService {
  constructor(
    @InjectModel(Skill.name) private SkillModel: Model<Skill>,
    @InjectModel(Job.name) private jobModel: Model<Job>,
    // @InjectModel(User.name) private UserModel: Model<User>,
  ) {}

  async create(dto: CreateSkillDto): Promise<Skill> {
    dto.title = dto.title.toLowerCase();
    const existingSkill = await this.SkillModel.findOne({
      title: { $regex: new RegExp(`^${dto.title}$`, 'i') },
    });

    if (existingSkill) {
      throw new ConflictException('This skill is already present');
    }
    const createdSkill = await this.SkillModel.create(dto);
    return createdSkill;
  }

  async findAll(page?: number, limit?: number, skillTitle?: string) {
    let result;
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.SkillModel.aggregate([
        {
          $facet: {
            allSkills: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [
              { $skip: skip },
              { $limit: +limit },
              { $count: 'count' },
            ],
          },
        },
      ]);

      if (skillTitle) {
        // Make the name case-insensitive also match substrings
        const matchStage = { title: { $regex: new RegExp(skillTitle, 'i') } };

        result = await this.SkillModel.aggregate([
          {
            $facet: {
              allSkills: [
                { $match: matchStage },
                { $skip: skip },
                { $limit: +limit },
              ],
              totalDocs: [
                { $match: matchStage },
                { $skip: skip },
                { $limit: +limit },
                { $count: 'count' },
              ],
            },
          },
        ]);
      }
    } else {
      result = await this.SkillModel.aggregate([
        {
          $facet: {
            allSkills: [],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const allSkills = result[0].allSkills;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
    if (!allSkills) {
      throw new NotFoundException('Failed to fetch SKills');
    }
    return {
      skills: allSkills,
      total: totalDocs,
    };
  }

  async findSkillsForJobPost() {
    return this.SkillModel.find();
  }

  async findById(id: string): Promise<Skill | null> {
    const skill = await this.SkillModel.findById(id).exec();
    if (!skill) {
      throw new NotFoundException('SKill not found');
    }
    return skill;
  }

  async update(id: string, dto: UpdateSkillDto) {
    const existingSkill = await this.SkillModel.findOne({
      title: { $regex: new RegExp(`^${dto.title}$`, 'i') },
      _id: { $ne: id },
    }).exec();

    if (existingSkill) {
      throw new ConflictException('Skill is already Present');
    }
    dto.title?.trim().toLowerCase();
    // console.log(dto);

    const updateSKill = await this.SkillModel.findByIdAndUpdate(id, dto, {
      new: true,
    }).exec();

    if (!updateSKill) {
      throw new InternalServerErrorException('Failed to update Skill');
    }

    return { skill: updateSKill, message: 'Skill updated successfully' };
  }

  async remove(id: string) {
    const jobs = await this.jobModel.find({
      skills: { $in: [new mongoose.Types.ObjectId(id)] },
    });
    if (jobs.length > 0) {
      return {
        skillsInJobs: jobs,
      };
    }
    const deletedSKill = await this.SkillModel.findByIdAndDelete(id).exec();

    if (!deletedSKill) {
      throw new InternalServerErrorException('Failed to delete Skill');
    }

    return { message: 'Skill deleted successfully' };
  }
}
