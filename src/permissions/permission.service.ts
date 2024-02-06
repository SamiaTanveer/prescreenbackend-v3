import { Injectable, NotFoundException } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PermissionsUserModel } from './entities/permission.entity';
import { UpdatePermissionUserDto } from './dto/update-permission.dto';
import { TeamPermRes } from 'src/utils/classes';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(PermissionsUserModel.name)
    private tempPerModel: Model<PermissionsUserModel>,
  ) {}

  create(dto: { user: string; permission: string; userCompany: string }) {
    return this.tempPerModel.create(dto);
  }

  async findAll(userid: string) {
    const perms = await this.tempPerModel.aggregate([
      {
        $match: { userCompany: new mongoose.Types.ObjectId(userid) },
      },
      {
        $lookup: {
          from: 'teampermissions',
          localField: 'permission',
          foreignField: '_id',
          as: 'permission',
        },
      },
      {
        $unwind: '$permission',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: '$user._id',
            company: '$user.company',
          },
          permission: {
            _id: '$permission._id',
            roleTitle: '$permission.roleTitle',
            permissionsAllowed: {
              $objectToArray: '$permission.permissionsAllowed',
            },
          },
        },
      },
      {
        $addFields: {
          permission: {
            $arrayToObject: {
              $filter: {
                input: '$permission.permissionsAllowed',
                as: 'perm',
                cond: '$$perm.v',
              },
            },
          },
        },
      },
    ]);

    if (!perms || perms.length === 0) {
      throw new NotFoundException('No permissions were found');
    }

    return perms;
  }

  async findOne(id: string) {
    const permissionModelFound = await this.tempPerModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'teampermissions',
          localField: 'permission',
          foreignField: '_id',
          as: 'permission',
        },
      },
      {
        $unwind: '$permission',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: '$user._id',
            company: '$user.company',
          },
          permission: {
            _id: '$permission._id',
            roleTitle: '$permission.roleTitle',
            permissionsAllowed: {
              $objectToArray: '$permission.permissionsAllowed',
            },
          },
        },
      },
      {
        $addFields: {
          permission: {
            $arrayToObject: {
              $filter: {
                input: '$permission.permissionsAllowed',
                as: 'perm',
                cond: '$$perm.v',
              },
            },
          },
        },
      },
    ]);

    if (!permissionModelFound || permissionModelFound.length === 0) {
      throw new NotFoundException('No Permission user model found');
    }

    return permissionModelFound[0];
  }

  async findOneByUserId(userid: string) {
    // console.log(userid);
    const permissionModelFound = await this.tempPerModel
      .findOne({
        user: userid,
      })
      .populate({ path: 'permission' })
      .populate({
        path: 'user',
        select: 'password userType lastLogin',
        populate: {
          path: 'company',
          model: 'User',
          select: 'name email website industry',
        },
      });

    if (!permissionModelFound) {
      throw new NotFoundException('No Permission user model found');
    }
    return permissionModelFound;
  }

  async update(id: string, dto: UpdatePermissionUserDto) {
    // console.log(updateTagDto);
    const isUpdated = await this.tempPerModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!isUpdated) {
      throw new NotFoundException('No Team Member found');
    }

    return {
      message: 'Member Updated Successfully',
    };
  }

  async removeMember(id: string) {
    const memberRemoved = await this.tempPerModel.findByIdAndRemove(id).exec();

    if (!memberRemoved) {
      throw new NotFoundException('No Team Member Found');
    }

    return {
      message: `Deletion Successfull`,
    };
  }
}
