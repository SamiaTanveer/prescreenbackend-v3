import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BillingCycle } from './entities/billingCycle.entity';
import { CreateBillingCycleDto } from './dto/create_billing_cycle.dto';
import { UpdateBillingCycleDto } from './dto/update_billing_cycle.dto';
import { isValidObjectId } from 'src/utils/funtions';

@Injectable()
export class BillingCycleService {
  constructor(
    @InjectModel(BillingCycle.name) private cycleModel: Model<BillingCycle>,
  ) {}

  async create(ceateUserDto: UpdateBillingCycleDto): Promise<BillingCycle> {
    const createdCycle = await this.cycleModel.create(ceateUserDto);
    return createdCycle;
  }

  async GetOne(id: string): Promise<BillingCycle> {
    // checking if the id has correct length
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Provided id is not valid');
    }
    const cycleFound = await this.cycleModel.findById(id);
    // console.log(cycleFound);
    if (!cycleFound) {
      throw new NotFoundException('Cycle not found');
    }

    return cycleFound;
  }

  async findAll(): Promise<BillingCycle[]> {
    const billingcycles = await this.cycleModel.find().exec();

    if (!billingcycles) {
      throw new NotFoundException('Billing Cycles not found');
    }
    return billingcycles;
  }
  async findById(cycleid: string) {
    // console.log(cycleid);
    const cycleFound = await this.cycleModel.findById(cycleid);

    if (!cycleFound) {
      throw new NotFoundException('cycle not found');
    }
    return cycleFound;
  }

  async findOneUser(email: string) {
    const user = await this.cycleModel.findOne({ email });

    if (!user) {
      return false;
    }
    return true;
  }

  async findOneUserByemail(email: string) {
    const user = await this.cycleModel.findOne({ email });

    if (user) {
      return user;
    }
    return false;
  }

  // using in login
  async updateUserStatus(email: string): Promise<BillingCycle> {
    const updatedUser = await this.cycleModel.findOneAndUpdate(
      { email: email },
      { isActive: true },
      { new: true },
    );
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async updateUser(
    id: string,
    dto: UpdateBillingCycleDto,
  ): Promise<BillingCycle> {
    const updateCycle = await this.cycleModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updateCycle) {
      throw new NotFoundException('Cycle not found');
    }
    // console.log('updateCycle', updateCycle);
    return updateCycle;
  }

  remove(id: string) {
    const isDeleted = this.cycleModel.findByIdAndDelete(id);
    if (!isDeleted) {
      throw new NotFoundException('Could not delete the cycle');
    }

    return isDeleted;
  }
}
