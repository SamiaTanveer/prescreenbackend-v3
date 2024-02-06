import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Candidate } from 'src/candidate/entities/candidate.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private ProjectModel: Model<Project>,
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
  ) {}

  async create(dto: CreateProjectDto, candidateId: string) {
    // if a Project with similar name already exists
    const existingProject = await this.ProjectModel.findOne({
      title: { $regex: new RegExp(`^${dto.title}$`, 'i') },
    });

    if (existingProject) {
      throw new BadRequestException('Project with similar name already exists');
    }

    // find the candidate model to update after
    const candidateFound = await this.candidateModel.findById(candidateId);
    if (!candidateFound) {
      throw new BadRequestException('No candidate found');
    }

    const createdProject = await this.ProjectModel.create(dto);

    if (!createdProject) {
      throw new BadRequestException('Unable to create project');
    }

    // now update the projects field in candidate model
    const newProjects = [...candidateFound.projects, createdProject._id];
    candidateFound.projects = newProjects;
    await candidateFound.save();

    return createdProject;
  }
  async findAll(userid: string, page?: number, limit?: number) {
    let result;
    const lookup1 = {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
            },
          },
        ],
      },
    };
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.ProjectModel.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userid),
          },
        },
        {
          $facet: {
            Projects: [lookup1, { $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.ProjectModel.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userid),
          },
        },
        {
          $facet: {
            Projects: [lookup1],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const Projects = result[0].Projects;
    // console.log('result', Projects);
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      projects: Projects,
      total: totalDocs,
    };
  }
  async findOne(id: string) {
    // console.log(userId);
    const ProjectFound = await this.ProjectModel.findOne({
      _id: id,
    }).populate({
      path: 'user',
      select: 'candidate name email',
      populate: {
        path: 'candidate',
      },
    });

    if (!ProjectFound) {
      throw new NotFoundException('No Project found');
    }
    return ProjectFound;
  }

  async update(id: string, dto: UpdateProjectDto) {
    // console.log(dto);
    const isUpdated = await this.ProjectModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!isUpdated) {
      throw new NotFoundException('No Project found');
    }

    return {
      message: 'Project Updated Successfully',
    };
  }

  async remove(id: string, candidateId: string) {
    const isDeleted = await this.ProjectModel.findByIdAndDelete(id);

    if (!isDeleted) {
      throw new NotFoundException('No Project found');
    }
    // now update the projects array from candidate model by removing this project

    const candidateFound = await this.candidateModel.findById(candidateId);
    if (!candidateFound) {
      throw new NotFoundException('No Candidate found');
    }

    const updateProjects = candidateFound.projects.filter(
      (projectId) => projectId.toString() != id,
    );
    // console.log(updateProjects);
    candidateFound.projects = updateProjects;
    await candidateFound.save();
    return {
      message: 'Project deleted Successfully',
    };
  }
}
