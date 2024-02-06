import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt/dist';
import { User } from '../user/entities/user.entity';
import { loginDto } from './dto/login.dto';
import { CandidateDto } from 'src/candidate/dto/create-candidate.dto';
import { MailingService } from 'src/mailing/mailing.service';
import { CompanyDto } from 'src/company/dto/create-company.dto';
import { decryptData } from 'src/utils/encryptDecrypt';
import { OtpDto } from './dto/otp.dto';
import { generateRandom5DigitOTP } from 'src/utils/funtions';
import { Job } from 'src/job/entities/job.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(Job.name) private jobModel: Model<Job>,
    private jwtService: JwtService,
    private mailingService: MailingService,
    private readonly userService: UserService,
  ) {}

  async validateToken(token: string): Promise<boolean> {
    try {
      const decoded = this.jwtService.verify(token);
      if (!decoded) return false;
      // console.log(decoded);
      // Token is valid
      return true;
    } catch (error) {
      // Token is invalid or expired
      return false;
    }
  }

  async getAuthUser(userId: string) {
    const userFound = await this.UserModel.findById(userId).populate({
      path: 'subscriptionPlan',
      populate: { path: 'SubscriptionPlan' },
    });
    // console.log(typeof userFound);
    // console.log(userFound);
    if (!userFound) {
      throw new NotFoundException('No user found!');
    }
    let populatedField;
    let userToSend = {};
    if (
      userFound.userType === 'company' ||
      userFound.userType === 'superAdmin'
    ) {
      populatedField = await userFound.populate('company', 'email name phone');
      userToSend = {
        isEmailVerified: populatedField?.isEmailVerified,
        lastLogin: populatedField?.lastLogin,
        isSocialLogin: userFound.isSocialLogin,
        user: populatedField?.company,
        subscriptionPlan: userFound.subscriptionPlan,
        userType: userFound.userType,
        userId: userId,
      };
    } else if (userFound.userType === 'candidate') {
      populatedField = await userFound.populate(
        'candidate',
        'email name phone gender nationality linkedin portfolioSite cvUrl',
      );
      userToSend = {
        userId: userId,
        isEmailVerified: populatedField?.isEmailVerified,
        lastLogin: populatedField?.lastLogin,
        isSocialLogin: userFound.isSocialLogin,
        user: populatedField?.candidate,
        // userType: userFound.userType,
      };
    }
    // console.log(populatedField);
    return userToSend;
  }

  async registerCompany(
    dto: CompanyDto,
    companyId: string,
    hashedOTP: string,
    hashedPass: string,
    // isSocialLogin: string,
  ) {
    // companyid, usertype, lastlogin, otp, expiresAt
    const { name, email } = dto;
    // Make user(Company) Doc with otp

    // make time for otp
    const timeForOtp = new Date().getTime() + 180000; // 3 minutes expiryTime
    const nowTime = new Date().getTime();
    const timeTosend = timeForOtp - nowTime;

    // create company user model based on isSocialLogin
    // let user;
    // if (isSocialLogin == 'true') {
    //   user = await this.UserModel.create({
    //     name,
    //     email,
    //     isSocialLogin,
    //     company: companyId,
    //     userType: 'company',
    //     otp: hashedOTP,
    //     expiresAt: timeForOtp,
    //   });
    // } else {
    const user = await this.UserModel.create({
      name,
      email,
      password: hashedPass,
      company: companyId,
      userType: 'company',
      otp: hashedOTP,
      expiresAt: timeForOtp,
    });
    // }
    return {
      user,
      message: 'Company Account Created! Check your email',
      otpTime: timeTosend,
    };
  }

  async registerCandidate(
    dto: CandidateDto,
    candidateId: string,
    hashedPass: string,
    hashedOTP?: string,
  ): Promise<{ user: User | undefined; otpTime?: number | undefined }> {
    // candidateId, usertype, lastlogin, otp, expiresAt
    console.log(hashedOTP);
    const { name, email, isSocialLogin } = dto;
    let user;
    // console.log('service', isSocialLogin);
    if (isSocialLogin == false) {
      // make time for otp
      const timeForOtp = new Date().getTime() + 180000; // 3 minutes expiryTime
      const nowTime = new Date().getTime();
      const timeTosend = timeForOtp - nowTime;
      user = await this.UserModel.create({
        name,
        email,
        password: hashedPass,
        candidate: candidateId,
        userType: 'candidate',
        otp: hashedOTP,
        expiresAt: timeForOtp,
      });
      return { user, otpTime: timeTosend };
    } else if (isSocialLogin == true) {
      user = await this.UserModel.create({
        name,
        email,
        isSocialLogin,
        password: hashedPass,
        candidate: candidateId,
        isEmailVerified: true,
        userType: 'candidate',
      });
      return { user };
    } else {
      return { user: undefined, otpTime: undefined };
    }
  }

  async registerInviteCandidate(
    dto: CandidateDto,
    candidateId: string,
    hashedPass: string,
  ): Promise<{ user: User | undefined; otpTime?: number | undefined }> {
    const { name, email } = dto;
    const user = await this.UserModel.create({
      name,
      email,
      password: hashedPass,
      candidate: candidateId,
      isEmailVerified: true,
      userType: 'candidate',
    });
    return { user };
  }

  async checkOtpTime(email: string) {
    const user = await this.UserModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { expiresAt } = user;

    const currentTime = new Date().getTime();
    const timeTosend = expiresAt - currentTime;

    if (expiresAt > currentTime) {
      // OTP is still valid
      return {
        otpTime: timeTosend,
      };
    } else {
      // console.log('inside expired');
      await user.updateOne({ expiresAt: null, otp: null });
      throw new BadRequestException('OTP Expired');
    }
  }

  async login(dto: loginDto, rememberMe: string) {
    const { email, password } = dto;
    const user = await this.UserModel.findOne({ email });
    // console.log(user);

    if (!user) {
      throw new NotFoundException('No Account with this email! Signup first');
    }

    // check if this user is blocked or not
    if (user?.isBlocked === true) {
      throw new ForbiddenException('This user is Blocked by admin');
    }

    const EmailVerified = user.isEmailVerified;

    // update user status isActive: true
    // TODO: for websockets
    // await this.userService.updateUserStatus(email);
    // console.log(EmailVerified, user);
    if (!EmailVerified && user.password) {
      // FIRST send email to the user with otp
      const { normalOtp, hashedOTP } = await generateRandom5DigitOTP();
      const emailData = {
        email,
        Otp: normalOtp,
      };
      console.log('emailData', emailData);
      const isEmailSent = await this.mailingService.sendMail(emailData);
      // console.log('login.....', isEmailSent);
      if (!isEmailSent) {
        console.log('Error sending email');
        throw new InternalServerErrorException('Error sending email');
      }
      console.log('Email Sent');
      user.otp = hashedOTP;
      const timeForOtp = new Date().getTime() + 180000; // 2 minutes expiry
      user.expiresAt = timeForOtp;
      await user.save();
      throw new UnauthorizedException(
        'Email not verified! Kindly check your email for OTP!',
      );
    }
    if (user.email !== email) {
      throw new BadRequestException('Invalid Email or password');
    }
    // check for isSocialLogin
    // if (user.isSocialLogin == true) {
    //   throw new BadRequestException('This user has a social Login');
    // } else {
    // console.log(user.password);
    if (user.password == '') {
      throw new BadRequestException(
        'kindly create your account first as you donot have a password',
      );
    }
    const oldPassword = await decryptData(user.password);
    console.log('old pass...', oldPassword);
    const isPassOk = oldPassword == password;
    // console.log('pass ok or not...', isPassOk);
    if (!isPassOk) {
      throw new BadRequestException('Invalid Email or password');
    }
    // }
    // console.log(rememberMe);
    const expiresIn = rememberMe === 'true' ? '3d' : '1d';
    const token = this.jwtService.sign(
      {
        id: user._id,
        email: user.email,
        userType: user.userType,
      },
      { expiresIn },
    );
    user.lastLogin = new Date();
    await user.save();
    // console.log(user);
    const sendUser = {
      name: user.name,
      email: user.email,
      userId: user.id,
      type: user.userType,
    };
    return { token: token, user: sendUser };
  }

  async verifyOTP(dto: OtpDto) {
    const { email, OTP } = dto;
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new BadRequestException("Email doesn't exist");
    }
    const { expiresAt, otp } = user;
    // console.log(user);
    const currentTime = new Date().getTime();
    // const expirationTimestamp = new Date(expiresAt).getTime();
    // console.log('isExpired', expiresAt > currentTime);
    if (!(expiresAt > currentTime)) {
      // console.log('inside expired');
      await user.updateOne({ expiresAt: null, otp: null });
      throw new BadRequestException('OTP Expired');
    }
    // console.log(otp, OTP);
    const isValid = await bcrypt.compare(OTP, otp);
    console.log('otp valid or not.....', isValid);
    if (!isValid) {
      throw new BadRequestException('Wrong OTP');
    }
    user.isEmailVerified = true;
    await user.updateOne({ expiresAt: null, otp: null });
    await user.save();

    return {
      message: 'User verified successfully',
    };
  }
  // Find User by email
  async findByEmail(email: string) {
    return await this.UserModel.findOne({ email });
  }

  googleLogin(req: any) {
    if (!req.user) {
      return 'No user from google';
    }
    return {
      message: 'User information from google',
      user: req.user,
    };
  }

  githubLogin(req: any) {
    if (!req.user) {
      return 'No user from github';
    }
    return {
      message: 'User information from gitub',
      user: req.user,
    };
  }

  facebookLogin(req: any) {
    if (!req.user) {
      return 'No user from facebook';
    }
    return {
      message: 'User information from facebook',
      user: req.user,
    };
  }

  async socialLogin(user: any, res: any) {
    //checks if email already registered
    // return { message: 'This user has no social Login. Try with email and password', res.redirect(redirectUrl) };
    const queryParams = new URLSearchParams();
    if (user.isSocialLogin !== true) {
      // const errorMessage = encodeURIComponent(
      //   'This user has no social Login. Try with email and password',
      // );
      queryParams.append(
        'error',
        'This user has no social Login. Try with email and password',
      );
      return res.redirect(`${process.env.FRONTEND_URL}/signin?${queryParams}`);
    }

    const expiresIn = '1d';
    const token = this.jwtService.sign(
      {
        id: user._id,
        email: user.email,
        userType: user.userType,
      },
      { expiresIn },
    );
    user.lastLogin = new Date();
    await user.save();

    queryParams.append('token', token);
    queryParams.append('name', user.name);
    queryParams.append('email', user.email);
    queryParams.append('userId', user._id);
    queryParams.append('type', user.userType);

    // console.log('queryParams', queryParams);
    const redirectUrl = `${process.env.FRONTEND_URL}/signin?${queryParams}`;
    // const redirectUrl = `http://192.168.18.135:3000/signin?${queryParams}`;
    return res.redirect(redirectUrl);
  }
}
