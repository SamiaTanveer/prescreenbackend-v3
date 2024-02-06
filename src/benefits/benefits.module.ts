import { Module } from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import { BenefitsController } from './benefits.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Benefit, BenefitSchema } from './entities/benefit.entity';
import { Job, jobSchema } from 'src/job/entities/job.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Benefit.name,
        schema: BenefitSchema,
      },
      { name: Job.name, schema: jobSchema },
    ]),
  ],
  controllers: [BenefitsController],
  providers: [BenefitsService],
})
export class BenefitsModule {}
