import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { Options } from 'nodemailer/lib/smtp-transport';
import { google } from 'googleapis';
import {
  ContactFormData,
  EmailData,
  InviteEmailData,
  ReminderData,
  jobReminderData,
} from 'src/types';
@Injectable()
export class MailingService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  private async setTransport() {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      this.configService.get('MAIL_CLIENTID'),
      this.configService.get('MAIL_SECRET'),
      'https://developers.google.com/oauthplayground',
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    const accessToken: string = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err: any, token: string) => {
        if (err) {
          console.log(err);
          reject('Failed to create access token');
        }
        resolve(token);
      });
    });

    // console.log(accessToken, '....access token');

    const config: Options = {
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.get('EMAIL'),
        clientId: this.configService.get('MAIL_CLIENTID'),
        clientSecret: this.configService.get('MAIL_SECRET'),
        accessToken,
      },
    };
    this.mailerService.addTransporter('gmail', config);
  }
  public async sendOtpFromGoogle({ email, Otp }: EmailData) {
    await this.setTransport();
    return await this.mailerService.sendMail({
      transporterName: 'gmail',
      to: email,
      from: this.configService.get('EMAIL'),
      subject: 'Verification Code',
      template: './otpemail',
      context: {
        code: Otp,
      },
    });
  }
  public async sendInviteFromGoogle(data: InviteEmailData) {
    console.log('data.job', data.job);
    console.log('data', data);
    await this.setTransport();
    return await this.mailerService.sendMail({
      transporterName: 'gmail',
      to: data.email,
      from: this.configService.get('EMAIL'),
      subject: 'Exam Invite Link',
      template: './invitedLink',
      context: {
        code: {
          companyName: data.companyName,
          job: data.job,
          inviteLink: data.inviteLink,
          expiryTime: data.expiryTime,
        },
      },
    });
  }
  public async sendJobReminder(data: jobReminderData) {
    await this.setTransport();
    return await this.mailerService.sendMail({
      transporterName: 'gmail',
      to: data.email,
      from: this.configService.get('EMAIL'),
      subject: 'Job closing Reminder',
      template: './jobReminder',
      context: {
        code: {
          jobTitle: data.jobTitle,
          companyName: data.companyName,
          expiryDate: data.expiryDate,
        },
      },
    });
  }
  public async sendPlanRenewReminder(data: ReminderData) {
    await this.setTransport();
    return await this.mailerService.sendMail({
      transporterName: 'gmail',
      to: data.email,
      from: this.configService.get('EMAIL'),
      subject: 'Renew your SubscriptionPlan',
      template: './renewReminder',
      context: {
        code: {
          subscriptionPlan: data.subscriptionPlan,
          expiryDate: data.expiryDate,
        },
      },
    });
  }
  public async sendPlanExpiration(data: ReminderData) {
    await this.setTransport();
    console.log('subscriptionExpiration', data);
    return await this.mailerService.sendMail({
      transporterName: 'gmail',
      to: data.email,
      from: this.configService.get('EMAIL'),
      subject: 'SubscriptionPlan Expired',
      template: './subscriptionExpiration',
      context: {
        code: {
          subscriptionPlan: data.subscriptionPlan,
          expiryDate: data.expiryDate,
        },
      },
    });
  }
  public async sendMailtoOwnerGoogle(ContactFormData: ContactFormData) {
    await this.setTransport();
    // console.log(ContactFormData);
    return await this.mailerService.sendMail({
      transporterName: 'gmail',
      to: this.configService.get('EMAIL'),
      from: this.configService.get('EMAIL'),
      subject: 'Contact Form Submission',
      template: './contactEmail',
      context: {
        code: {
          name: ContactFormData.name,
          email: ContactFormData.email,
          phone: ContactFormData.phone,
          companyname: ContactFormData.companyname,
          message: ContactFormData.message,
        },
      },
    });
  }

  // below are functions which send email from webmail
  public async sendMail({ email, Otp }: EmailData) {
    console.log('inside');
    const send = await this.mailerService.sendMail({
      to: email,
      from: this.configService.get('EMAIL_USER'),
      subject: 'OTP VERIFICATION',
      template: './otpemail',
      context: {
        code: Otp,
      },
    });
    console.log('send', send);
    return send;
  }

  public async sendInviteMail(data: InviteEmailData) {
    return await this.mailerService.sendMail({
      to: data.email,
      from: this.configService.get('EMAIL_USER'),
      subject: 'Exam invite link',
      template: './invitedLink',
      context: data,
    });
  }

  public async sendReminderMail(data: ReminderData) {
    return await this.mailerService.sendMail({
      to: data.email,
      from: this.configService.get('EMAIL_USER'),
      subject: 'Renew your SubscriptionPlan',
      template: './reminderLink',
      context: data,
    });
  }

  public async sendMailToOwner(ContactFormData: ContactFormData) {
    return await this.mailerService.sendMail({
      to: this.configService.get('EMAIL_USER'),
      from: this.configService.get('EMAIL_USER'),
      subject: 'Contact Form Submission',
      template: './contactEmail',
      context: ContactFormData,
    });
  }
}
