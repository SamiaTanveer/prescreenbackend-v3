import { Module } from "@nestjs/common";
import { CandidateFeedbackService } from "./candidate-feedback.service";
import { CandidateFeedbackController } from "./candidate-feedback.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import {
  CandidateFeedback,
  CandidateFeedbackSchema,
} from "./entities/candidate-feedback.entity";

@Module({
  imports: [
    // AuthModule,
    MongooseModule.forFeature([
      { name: CandidateFeedback.name, schema: CandidateFeedbackSchema },
    ]),
  ],
  controllers: [CandidateFeedbackController],
  providers: [CandidateFeedbackService],
})
export class CandidateFeedbackModule {}
