import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { FeedbackForm, FeedbackFormSchema } from './entities/feedback.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: FeedbackForm.name, schema: FeedbackFormSchema },
    ]),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
