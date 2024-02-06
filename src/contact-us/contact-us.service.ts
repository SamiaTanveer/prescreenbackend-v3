import { Injectable } from '@nestjs/common';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ContactUs } from './entities/contact-us.entity';
import { Model } from 'mongoose';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectModel(ContactUs.name) private ContactUsModel: Model<ContactUs>,
  ) {}

  async create(createContactUsDto: CreateContactUsDto) {
    // console.log("object",createContactUsDto)
    return await this.ContactUsModel.create(createContactUsDto);
  }

  findAll() {
    return `This action returns all contactUs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contactUs`;
  }

  update(id: number, updateContactUsDto: UpdateContactUsDto) {
    return `This action updates a #${id} contactUs`;
  }

  remove(id: number) {
    return `This action removes a #${id} contactUs`;
  }
}
