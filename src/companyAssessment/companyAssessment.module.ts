import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionService } from 'src/permissions/permission.service';
import { CompanyAssessmentController } from './companyAssessment.controller';
import { CompanyAssessmentService } from './companyAssessment.service';
import {
  CompanyAssessment,
  CompanyAssessmentSchema,
} from './entities/companyAssessment.entity';
import {
  PermissionUserSchema,
  PermissionsUserModel,
} from 'src/permissions/entities/permission.entity';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import {
  companySubscription,
  companySubscriptionSchema,
} from 'src/company-subscription/entities/company-subscription.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: CompanyAssessment.name, schema: CompanyAssessmentSchema },
      { name: PermissionsUserModel.name, schema: PermissionUserSchema },
      { name: companySubscription.name, schema: companySubscriptionSchema },
    ]),
  ],
  controllers: [CompanyAssessmentController],
  providers: [
    CompanyAssessmentService,
    SubPlanRestrictionsService,
    PermissionService,
  ],
})
export class CompanyAssessmentModule {}
