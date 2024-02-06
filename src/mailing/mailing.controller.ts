import { Controller, Get } from '@nestjs/common';
import { MailingService } from './mailing.service';

@Controller('mailing')
export class MailingController {
  constructor(readonly mailingService: MailingService) {}
  @Get('send-mail')
  public sendMail() {
    // this.mailingService.sendMailGoogle({email: 'ehtashamtoor50@icloud.com', Otp: '111111'});
  }
}
