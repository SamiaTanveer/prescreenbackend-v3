import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { BillingCycleController } from './billingCycle.controller';
import { BillingCycleService } from './billingCycle.service';
import {
  BillingCycle,
  BillingCycleSchema,
} from './entities/billingCycle.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: BillingCycle.name,
        schema: BillingCycleSchema,
      },
    ]),
  ],
  controllers: [BillingCycleController],
  providers: [BillingCycleService],
})
export class BillingCycleModule {}
