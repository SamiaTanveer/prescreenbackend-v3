import { IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  user: string;
  @IsNotEmpty()
  connection: string;
  job: string;
  candidateApplication: string;
  examInvite: string;
  candidateAssessement: string;
  companySubscription: string;
}
