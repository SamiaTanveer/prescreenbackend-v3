import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInviteDto } from './dto/create-invite.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { decryptData, encryptData } from 'src/utils/encryptDecrypt';
import { Job } from 'src/job/entities/job.entity';
import { User } from 'src/user/entities/user.entity';
import { Candidate } from 'src/candidate/entities/candidate.entity';
import { AssessmentInvite } from './entities/invite.entity';

@Injectable()
export class InviteService {
  constructor(
    @InjectModel(AssessmentInvite.name)
    private inviteModel: Model<AssessmentInvite>,
    @InjectModel(Job.name) private jobModel: Model<Job>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
  ) {}

  async create(dto: CreateInviteDto) {
    // get deadline time of job using dto.job
    const job = await this.jobModel.findById(dto.job);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    dto.expiryTime = job.applicationDeadline;
    // create a unique identifier for invite link
    const toencrypt = dto.email + '&' + dto.job;
    const identifier = await encryptData(toencrypt);
    dto.identifier = identifier;

    return (await this.inviteModel.create(dto)).populate({
      path: 'job',
      select: 'job',
      populate: { path: 'createdBy', select: 'name' },
    });
  }

  findAll(): Promise<AssessmentInvite[]> {
    return this.inviteModel.find();
  }

  async checkIdentifier(identifier: string) {
    // first deCode the identifier
    const identifierContents = (await decryptData(identifier)).split('&');
    // console.log('identifier contents', identifierContents);

    // get email and jobid
    const email = identifierContents[0];
    const jobid = identifierContents[1];

    // find exam from jobid
    const job = await this.jobModel.findById(jobid).populate({
      path: 'exam',
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // console.log('test to take exam id.....', job.exam.id);

    // check db for any user with above email
    const userFound = await this.userModel.findOne({ email });

    // user present in db
    if (userFound) {
      if (userFound.password) {
        return {
          email,
          isUserPresent: true,
          examid: job.companyAssessment.id,
          // examid: job.exam.id,
          job: jobid,
        };
      } else {
        // name
        // email
        // phone
        // geneder
        const candidateinfo = await this.candidateModel.findOne({
          email: userFound.email,
        });
        if (candidateinfo) {
          return {
            name: candidateinfo.name,
            email: candidateinfo.email,
            phone: candidateinfo.phone,
            gender: candidateinfo.gender,
            isUserPresent: true,
            examid: job.companyAssessment.id,
            // examid: job.exam.id,
            job: jobid,
            isNotRegisterd: true,
          };
        } else {
          return null;
        }
      }
    }

    // if user not present in db
    return {
      email,
      isUserPresent: false,
      examid: job.companyAssessment.id,
      // examid: job.exam.id,
      job: jobid,
    };
  }

  // async findOne(id: string): Promise<FeedbackForm | null> {
  //   const feebackFound = this.inviteModel.findById(id);

  //   if (!feebackFound) {
  //     throw new NotFoundException('No feedback found');
  //   }
  //   return feebackFound;
  // }

  async update(id: string, dto: CreateInviteDto) {
    const updatedFeeback = await this.inviteModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    // console.log(updatedFeeback);
    return updatedFeeback;
  }

  async findByjobEmail(jobid: string, email: string) {
    const inviteModel = await this.inviteModel.findOne({
      job: jobid,
      email,
    });
    // console.log(inviteModel);
    return inviteModel;
  }

  // remove(id: string) {
  //   return this.inviteModel.findByIdAndDelete(id);
  // }
}
