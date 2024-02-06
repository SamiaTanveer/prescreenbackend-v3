import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { BillingCycleService } from './billingCycle.service';
import { UpdateBillingCycleDto } from './dto/update_billing_cycle.dto';
import { BillingCycle } from './entities/billingCycle.entity';

@ApiTags('Billing Cycle Module')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('/api')
export class BillingCycleController {
  constructor(private readonly billingcycleService: BillingCycleService) {}

  @Post('cycles/create-billingcycle')
  @UseGuards(AuthGuard(), AdminGuard)
  async createBillingCycle(@Body() dto: UpdateBillingCycleDto) {
    return this.billingcycleService.create(dto);
  }

  @Get('cycles/getAllForAdmin')
  @UseGuards(AuthGuard(), AdminGuard)
  findAllforAdmin(): Promise<BillingCycle[]> {
    return this.billingcycleService.findAll();
  }
  @Get('cycles/getAll')
  findAll(): Promise<BillingCycle[]> {
    return this.billingcycleService.findAll();
  }

  @Get('cycles/getOne/:id')
  async getCycleById(@Param('id') id: string): Promise<BillingCycle> {
    return await this.billingcycleService.GetOne(id);
  }

  @Put('cycles/updateOne/:id')
  @UseGuards(AuthGuard(), AdminGuard)
  async updateCycle(
    @Param('id') id: string,
    @Body() dto: UpdateBillingCycleDto,
  ): Promise<BillingCycle> {
    return await this.billingcycleService.updateUser(id, dto);
  }

  @Delete('cycles/removeOne/:id')
  @UseGuards(AuthGuard(), AdminGuard)
  remove(@Param('id') id: string) {
    return this.billingcycleService.remove(id);
  }
}
