import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  CreateCouponDto,
  CreateLimitedDiscountDto,
  CreateNormalDiscountDto,
} from './dto/create-discount.dto';
import { DiscountService } from './discounts.service';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { SubscriptionPlanService } from 'src/subscription-plan/subscription-plan.service';
// import { UserService } from 'src/user/user.service';
// import { SubscriptionPlan } from 'src/subscription-plan/entities/subscription-plan.entity';

@ApiTags('Discounts API')
@Controller('api/discounts')
export class DiscountController {
  constructor(
    private readonly discountService: DiscountService,
    // private readonly userService: UserService,
    private readonly planService: SubscriptionPlanService,
  ) {}

  @Post('create-limited-discount')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  // @UseGuards(AuthGuard(), AdminGuard)
  async createLimitedDiscount(@Body() dto: CreateLimitedDiscountDto) {
    return this.discountService.createLimitedDiscount(dto);
  }
  @Post('create-normal-discount')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  // @UseGuards(AuthGuard(), AdminGuard)
  async createNormalDiscount(@Body() dto: CreateNormalDiscountDto[]) {
    return this.discountService.createDiiscount(dto);
  }
  @Post('create-coupon-discount')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  // @UseGuards(AuthGuard(), AdminGuard)
  async createCoupon(@Body() dto: CreateCouponDto) {
    return this.discountService.createCoupon(dto);
  }
  @Post('create-coupon-discounts')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  // @UseGuards(AuthGuard(), AdminGuard)
  async createCoupons(@Body() dto: CreateCouponDto[]) {
    return this.discountService.createCoupons(dto);
  }

  @Get('getAll')
  findAll() {
    return this.discountService.findAll();
  }
  @Get('getAllCoupons')
  findAllCoupons() {
    return this.discountService.findAllCoupons();
  }
  @Get('getAllLimitedDiscounts')
  findAllLimDiscounts() {
    return this.discountService.findAllLimited();
  }
  @Get('getAllNormalDiscounts')
  findAllNormalDiscounts() {
    return this.discountService.findAllNormal();
  }

  @Get('getOne/:id')
  findOne(@Param('id') id: string) {
    return this.discountService.findOne(id);
  }

  @Patch('update-discount/:id')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  // @UseGuards(AuthGuard(), AdminGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateDiscountDto) {
    // console.log(dto);
    // first validate the plan by finding it
    if (dto.SubscriptionPlan) {
      const planFound = await this.planService.findById(dto.SubscriptionPlan);
      if (planFound.isActive == false) {
        throw new BadRequestException('The selected Plan is not Active');
      }
    }

    // find plan so that we can call update functions accordingly
    const discountFound = await this.discountService.findOne(id);
    if (discountFound.type === 'limited') {
      // console.log('inside limited update');
      return this.discountService.update(discountFound, {
        start_date: dto.start_date,
        end_date: dto.start_date,
        percentage: dto.percentage,
        max_users: dto.max_users,
      });
    } else if (discountFound.type === 'Coupon') {
      return this.discountService.update(discountFound, {
        start_date: dto.start_date,
        end_date: dto.start_date,
        percentage: dto.percentage,
        max_users: dto.max_users,
        couponCode: dto.couponCode,
        assignedCompanyUsers: dto.assignedCompanyUsers,
      });
    } else if (discountFound.type === 'Discount') {
      return this.discountService.update(discountFound, {
        percentage: dto.percentage,
        SubscriptionPlan: dto.SubscriptionPlan,
      });
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @UseGuards(AuthGuard(), AdminGuard)
  remove(@Param('id') id: string) {
    return this.discountService.remove(id);
  }
}
