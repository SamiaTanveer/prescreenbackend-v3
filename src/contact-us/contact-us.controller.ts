import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { MailingService } from 'src/mailing/mailing.service';
import { ContactFormData } from 'src/types';

import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Contact Us Form')
@Controller('contact-us')
export class ContactUsController {
  constructor(
    private readonly contactUsService: ContactUsService,
    private mailingService: MailingService,
  ) {}

    @Post('contact-us-form')
    @ApiOkResponse({
      schema: {
        type: 'Object',
        properties: {
          message: {
            type: 'string',
            example: 'Response Submitted Successfully',
          },
        },
      },
    })
    async create(@Body() dto: CreateContactUsDto) {
      await this.sendEmail(dto);
      await this.contactUsService.create(dto);
      return { message: 'Response Submitted Successfully' };
    }

  @Get()
  findAll() {
    return this.contactUsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactUsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContactUsDto) {
    return this.contactUsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactUsService.remove(+id);
  }

  // FUNCTION TO SEND EMAIL
  public async sendEmail(data: ContactFormData) {
    try {
      // below is to send email from webmail
      // const isEmailSent = await this.mailingService.sendMailToOwner(data);
      // below is to send email from google
      const isEmailSent = await this.mailingService.sendMailtoOwnerGoogle(data);
      // console.log('signup.....', isEmailSent);
      if (!isEmailSent) {
        console.log('not sent ...', isEmailSent);
      }
      console.log('Email Sent');
    } catch (error) {
      // console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
