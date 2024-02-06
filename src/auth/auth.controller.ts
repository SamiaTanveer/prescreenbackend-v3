import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Headers,
  Post,
  Body,
  Req,
  Res,
  Param,
  UseGuards,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
// import { WsJwtAuthGuard } from 'src/auth/ws-jwt/ws-jwt.guard';
import { AuthService } from './auth.service';
import { changePasswordDto } from './dto/changePass.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { loginDto } from './dto/login.dto';
import { CompanyService } from 'src/company/company.service';
import { CandidateDto } from 'src/candidate/dto/create-candidate.dto';
import { CandidateService } from 'src/candidate/candidate.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiSecurity,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { MailingService } from 'src/mailing/mailing.service';
import { CompanyDto } from 'src/company/dto/create-company.dto';
import { OtpDto } from './dto/otp.dto';
import { encryptData } from 'src/utils/encryptDecrypt';
import { EmailDto } from './dto/email.dto';
import { AuthUserDto } from 'src/user/dto/authUser.dto';
import {
  LoginResponse,
  OtpTime,
  OtpTimeMessage,
  companyTeamsEnums,
  message,
} from 'src/utils/classes';
import {
  checkUser,
  findDomainFromEmail,
  findDomainFromWebsite,
  generateRandom5DigitOTP,
} from 'src/utils/funtions';
import { CompanySubscriptionService } from 'src/company-subscription/company-subscription.service';
import { SubscriptionPlanService } from 'src/subscription-plan/subscription-plan.service';
import { AuthReq } from 'src/types';

@ApiTags('auth')
@Controller('/api')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private companyService: CompanyService,
    private candidateService: CandidateService,
    private mailingService: MailingService,
    private companySubscriptionService: CompanySubscriptionService,
    private subscriptionPlanService: SubscriptionPlanService,
  ) {}

  // Route to resend OTP
  @Post('/resend-otp')
  @ApiOperation({ summary: 'Resend OTP AGAIN' })
  @ApiResponse({
    status: 200,
    description: 'Please Check your email for OTP',
    type: OtpTimeMessage,
  })
  @ApiResponse({
    status: 400,
    description: 'Error sending OTP',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async resendOTP(@Body() dto: EmailDto) {
    const { email } = dto;
    const userFound = await this.authService.findByEmail(email);
    if (!userFound) {
      throw new NotFoundException('No user with this email');
    }

    // FIRST GENERATE OTP

    const { hashedOTP, normalOtp } = await generateRandom5DigitOTP();

    // make emailData to send
    const emailData = {
      email,
      Otp: normalOtp,
    };

    // Send OTP TO EMAIL

    await this.sendEmail(emailData);

    // save the otp in the specific user

    userFound.otp = hashedOTP;
    const timeForOtp = new Date().getTime() + 180000; // 2 minutes expiry
    const nowTime = new Date().getTime();
    const timeTosend = timeForOtp - nowTime;
    userFound.expiresAt = timeForOtp;
    await userFound.save();
    return { message: 'Please check your email for Otp', otpTime: timeTosend };
  }

  // Route to update password of a user
  @Post('/change-password')
  @ApiOperation({ summary: 'Change password of a user' })
  @ApiResponse({
    status: 201,
    description: 'Password changed successfully',
    type: message,
  })
  @ApiResponse({
    status: 400,
    description: 'Password change failed',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: NotFoundException,
  })
  async changePassword(@Body() changePassDto: changePasswordDto) {
    const { email, new_password } = changePassDto;
    const userFound = await this.authService.findByEmail(email);
    if (!userFound) {
      throw new NotFoundException('No user with this email');
    }
    // const saltRounds = 10;
    // const hashedPass = await bcrypt.hash(new_password, saltRounds);
    const hashedPass = await encryptData(new_password);
    // change password in userModel
    await this.userService.changePassword(userFound, hashedPass);
    // const { userType } = userFound;

    return { message: 'Password Changed Successfully' };
  }

  // Route to check token
  @Get('/checkToken')
  @ApiOperation({ summary: 'Check if the token is valid' })
  @ApiResponse({ status: 200, description: 'Token is valid', type: message })
  @ApiResponse({
    status: 401,
    description: 'Token not provided or invalid',
  })
  async checkToken(@Headers('authorization') authorization: string) {
    // console.log(authorization);
    if (!authorization) {
      throw new HttpException('Token not provided', HttpStatus.UNAUTHORIZED);
    }
    // console.log(authorization);
    const token = authorization.replace('bearer ', '');
    // console.log(token);
    // Call a method from authService to validate the token
    const isValid = await this.authService.validateToken(token);
    if (isValid) {
      return { message: 'Token is valid' };
    } else {
      throw new HttpException('Token is invalid', HttpStatus.UNAUTHORIZED);
    }
  }

  // Route to get authenticated user
  // ************************ in use ********************88
  @Get('/auth/me')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Get the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user details',
    type: AuthUserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'User not authenticated',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getAuthenticatedUser(@Req() req: AuthReq) {
    const { id, userType } = req.user;
    let userid = id;
    if (Object.values(companyTeamsEnums).includes(req.user.userType)) {
      userid = checkUser(userType, req.user.company, id);
    }
    // console.log(id);
    return this.authService.getAuthUser(userid);
  }

  // Router to register company
  // **************** in use *******************8
  @Post('/auth/register-company')
  @ApiOperation({ summary: 'Register the COMPANY and creates its Document' })
  @ApiResponse({
    status: 201,
    description: 'Company registered successfully',
    type: CompanyDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Company already registered and verified',
    type: BadRequestException,
  })
  @ApiResponse({
    status: 409,
    description: 'Company registration not completed.',
    type: ConflictException,
  })
  async registerCompany(
    @Body() dto: CompanyDto,
    // @Param('isSocialLogin') isSocialLogin: string,
  ) {
    const { email, password, website } = dto;
    dto.name.trim();
    const existingUser = await this.authService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException(
        'User with this Email already Registered. Please Login!',
      );
    }
    // check for company email(email must be equal to domain in website)
    if (website.includes('://')) {
      const EmailDomain = findDomainFromEmail(email);
      const WebsiteDomain = findDomainFromWebsite(website);
      console.log(EmailDomain, WebsiteDomain);
      if (!(EmailDomain === WebsiteDomain)) {
        throw new BadRequestException('Email must be equal to company Domain');
      }
    } else {
      throw new BadRequestException('Website should start with http Protocol');
    }
    // FIRST send email to the user with otp
    const { hashedOTP, normalOtp } = await generateRandom5DigitOTP();
    const emailData = {
      email,
      Otp: normalOtp,
    };

    // SEND EMAIL USING SENDEMAIL FUNCTIOn
    await this.sendEmail(emailData);
    // const hashedPass = await bcrypt.hash(password, 10);
    const hashedPass = await encryptData(password);
    // NOW creating Company Document
    const { company } = await this.companyService.create(dto);
    const { _id } = company;
    // NOW Creating User Doc with OTP
    const { user, otpTime } = await this.authService.registerCompany(
      dto,
      _id,
      hashedOTP,
      hashedPass,
      // isSocialLogin,
    );

    const userId = user.id;

    company.createdBy = userId;
    await company.save();

    return {
      user,
      message: 'Company Account Created! Check your email',
      otpTime,
    };
  }
  // FUNCTION TO SEND EMAIL
  public async sendEmail(emailData: { email: string; Otp: string }) {
    try {
      // below was from webmail
      // const isEmailSent = await this.mailingService.sendMail(emailData);
      // below is from google
      const isEmailSent =
        await this.mailingService.sendOtpFromGoogle(emailData);
      // console.log('signup.....', isEmailSent);
      if (!isEmailSent) {
        console.log('Signup', isEmailSent);
      }
      console.log('Email Sent');
    } catch (error) {
      // console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // Route to register candidate
  // ******************* in use **********************
  @Post('/auth/register-candidate')
  @ApiOperation({ summary: 'Register the CANDIDATE and creates its Document' })
  @ApiResponse({
    status: 201,
    description: 'Candidate registered successfully',
    type: CandidateDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Candidate already registered and verified',
    type: BadRequestException,
  })
  @ApiResponse({
    status: 409,
    description: 'Candidate registration not completed.',
    type: ConflictException,
  })
  async registerCandidate(@Body() dto: CandidateDto) {
    const { email, password, isSocialLogin } = dto;
    console.log(dto);
    const existingUser = await this.authService.findByEmail(email);
    console.log('old password', existingUser?.password);
    if (existingUser && existingUser.password !== '') {
      // if (!existingUser.password && password) {
      //   return { user: 'user is here' };
      // }
      throw new BadRequestException(
        'User with this Email already registered. Please Login!',
      );
    }
    // hashing password
    const hashedPass = await encryptData(password);
    // now we have both signups like we will have a password and socialLogin also
    // if normal login then create normal models
    if (isSocialLogin == false) {
      // FIRST send email to the user with otp
      // if user has no password then update the old user
      console.log(existingUser?.password);
      if (existingUser && !existingUser.password) {
        // update the user
        const updatedUser = await this.userService.updateUser(existingUser.id, {
          password: hashedPass,
        });
        return {
          updatedUser,
          message: 'Candidate Account Updated!',
        };
      }
      const { hashedOTP, normalOtp } = await generateRandom5DigitOTP();
      const emailData = {
        email,
        Otp: normalOtp,
      };
      // SEND EMAIL USING SENDEMAIL FUNCTION
      await this.sendEmail(emailData);
      // NOW  creating candidate Document
      const { candidate } = await this.candidateService.create(dto);
      const { _id } = candidate;
      // NOW Creating User Doc with OTP
      const { user, otpTime } = await this.authService.registerCandidate(
        dto,
        _id,
        hashedPass,
        hashedOTP,
      );
      if (user) {
        const userId = user.id;
        candidate.createdBy = userId;
        await candidate.save();
        return {
          user,
          message: 'Candidate Account Created! Check your email',
          otpTime,
        };
      }
    } else if (isSocialLogin == true) {
      // console.log(isSocialLogin);
      // IF SOCIAL LOGIN ha, then create models without password
      // NOW  creating candidate Document
      const { candidate } = await this.candidateService.create(dto);
      const { _id } = candidate;
      // console.log('created candidate model');
      const { user } = await this.authService.registerCandidate(
        dto,
        _id,
        hashedPass,
      );
      if (user) {
        // console.log('created user model', user);
        const userId = user.id;
        candidate.createdBy = userId;
        await candidate.save();
        return {
          user,
          message: 'Candidate Account Created!',
        };
      }
    }
  }

  // Route  to register inviteCandidate
  @Post('/auth/register-inviteCandidate')
  @ApiOperation({ summary: 'Register the CANDIDATE and creates its Document' })
  @ApiResponse({
    status: 201,
    description: 'Candidate registered successfully',
    type: CandidateDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Candidate already registered and verified',
    type: BadRequestException,
  })
  @ApiResponse({
    status: 409,
    description: 'Candidate registration not completed.',
    type: ConflictException,
  })
  async registerInviteCandidate(@Body() dto: CandidateDto) {
    const { password } = dto;
    // hashing password
    const hashedPass = await encryptData(password);

    // NOW  creating candidate Document
    const { candidate } = await this.candidateService.create(dto);
    const { _id } = candidate;
    const { user } = await this.authService.registerInviteCandidate(
      dto,
      _id,
      hashedPass,
    );

    if (user) {
      const userId = user.id;
      candidate.createdBy = userId;
      await candidate.save();
      return {
        user,
        message: 'Candidate Account Created!',
      };
    }
  }

  @Post('/auth/forgetPassword')
  @ApiOperation({ summary: 'Sends the email otp for password reset procedure' })
  @ApiResponse({
    status: 404,
    description: 'Email doesnot exists',
    type: NotFoundException,
  })
  @ApiResponse({
    status: 200,
    description: 'Please check your email for otp',
    type: OtpTimeMessage,
  })
  async forgetPassword(@Body() dto: EmailDto) {
    const { email } = dto;
    // Find User by email
    const user = await this.authService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Email doesnot Exists');
    }
    // FIRST send email to the user with otp
    const { hashedOTP, normalOtp } = await generateRandom5DigitOTP();
    const emailData = {
      email,
      Otp: normalOtp,
    };
    // SEND EMAIL USING SENDEMAIL FUNCTION
    await this.sendEmail(emailData);
    user.otp = hashedOTP;
    const timeForOtp = new Date().getTime() + 180000;
    const nowTime = new Date().getTime();
    user.expiresAt = timeForOtp;
    const timeTosend = timeForOtp - nowTime;
    await user.save();
    return { message: 'Please check your email for Otp', otpTime: timeTosend };
  }

  // ******************************** in use **********************
  @Post('/auth/login')
  @ApiOperation({ summary: 'Logins the user' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: LoginResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or email not verified',
    type: UnauthorizedException,
  })
  async login(@Body() dto: loginDto, @Param('rememberMe') rememberMe: string) {
    const user = await this.authService.login(dto, rememberMe);

    if (
      user.user.type === 'superAdmin' ||
      user.user.type == 'candidate' ||
      user.user.type === companyTeamsEnums.member1 ||
      user.user.type === companyTeamsEnums.member2 ||
      user.user.type === companyTeamsEnums.member3
    ) {
      return user;
    }

    // find old plan of a company
    const planFound = await this.companySubscriptionService.findSingleSubPlan(
      user.user.userId,
    );

    // console.log(
    //   'usertype is....',
    //   user.user.type,
    //   'sub plan not found so setting default free plan....',
    // );

    if (!planFound) {
      // first find the free plan
      const freeplan = await this.subscriptionPlanService.findFreePlan();
      console.log('this is free plan....', freeplan);
      // now create a subscription for free plan
      const subscriptionObject = {
        company: user.user.userId,
        SubscriptionPlan: freeplan.id,
        featuresAllowed: {
          mcqsBank: freeplan.featuresAllowed.mcqsBank,
          codingBank: freeplan.featuresAllowed.codingBank,
          testBank: freeplan.featuresAllowed.testBank,
          testsAllowed: freeplan.featuresAllowed.testsAllowed,
          assessmentsAllowed: freeplan.featuresAllowed.assessmentsAllowed,
          jobsAllowed: freeplan.featuresAllowed.jobsAllowed,
          invitesAllowed: freeplan.featuresAllowed.invitesAllowed,
        },
        featuresUsed: {
          testsUsed: '0',
          assessmentsUsed: '0',
          jobsUsed: '0',
          invitesUsed: '0',
        },
        subscriptionStartDate: new Date(),
        subscriptionStatus: 'active',
      };
      // ithe

      const isCreated =
        await this.companySubscriptionService.create(subscriptionObject);

      if (!isCreated) {
        throw new BadRequestException('unable to create subscription');
      }

      await this.userService.updateUser(user.user.userId, {
        subscriptionPlan: freeplan.id,
      });
    }

    return user;
  }

  @Post('/auth/verifyOtp')
  @ApiOperation({ summary: 'Verfies the OTP sent to email address' })
  @ApiResponse({
    status: 200,
    description: 'Account Verfication Complete',
    type: message,
  })
  @ApiResponse({
    status: 400,
    description: 'Email not found, OTP expired, or wrong OTP',
  })
  async verifyOtp(@Body() dto: OtpDto) {
    // console.log(dto);
    return await this.authService.verifyOTP(dto);
  }

  @Post('/auth/verifyOtpTime/:email')
  @ApiOperation({ summary: 'Returns the time of otp' })
  @ApiResponse({
    status: 200,
    description: 'Returns remaining Otp time',
    type: OtpTime,
  })
  @ApiResponse({
    status: 400,
    description: 'OTP expired',
  })
  async verifyOtpTime(@Param('email') email: string) {
    return await this.authService.checkOtpTime(email);
  }

  @Get('/auth/github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {}

  @Get('/auth/github/redirect')
  @UseGuards(AuthGuard('github'))
  async githubLoginCallback(@Req() req: any, @Res() res: any) {
    const data: any = this.authService.googleLogin(req);
    console.log('gitdata', data.user);
    const foundUser = await this.authService.findByEmail(
      data.user.emails[0].value,
    );
    if (!foundUser) {
      const queryParams = new URLSearchParams();
      queryParams.append('email', data.user.emails[0].value);
      if (data.user.displayName)
        queryParams.append('fullName', data.user.displayName);
      console.log('Git-foundUser', foundUser);
      const redirectUrl = `${process.env.FRONTEND_URL}/candidate-signup?${queryParams}`;
      return res.redirect(redirectUrl);
    }
    return await this.authService.socialLogin(foundUser, res);
  }

  @Get('/auth/google')
  @UseGuards(AuthGuard('google'))
  @ApiCreatedResponse({
    description: 'Login through google.',
  })
  async googleAuth() {}

  @Get('/auth/google/redirect')
  @UseGuards(AuthGuard('google'))
  @ApiCreatedResponse({
    description: 'redirect google authorization.',
  })
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    // console.log('testing...');
    const data: any = this.authService.googleLogin(req);
    const foundUser = await this.authService.findByEmail(data.user.email);
    if (!foundUser) {
      const fullName = `${data.user.firstName} ${data.user.lastName}`;
      const queryParams = new URLSearchParams();
      queryParams.append('email', data.user.email);
      // console.log('email', data.user.email);
      queryParams.append('fullName', fullName);
      console.log('foundUser', foundUser);
      const redirectUrl = `${process.env.FRONTEND_URL}/candidate-signup?${queryParams}`;
      return res.redirect(redirectUrl);
    }
    return await this.authService.socialLogin(foundUser, res);
  }

  @Get('/auth/facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(@Req() req: any) {
    console.log('req,,,', req.user);
    // return HttpStatus.OK;
  }

  @Get('/auth/facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(@Req() req: any, @Res() res: any) {
    const data: any = this.authService.googleLogin(req);
    const foundUser = await this.authService.findByEmail(
      data.user.user.email[0].value,
    );
    if (!foundUser) {
      const fullName = `${data.user.user.firstName.givenName} ${data.user.user.firstName.familyName}`;
      const queryParams = new URLSearchParams();
      queryParams.append('email', data.user.user.email[0].value);
      queryParams.append('fullName', fullName);
      console.log('FB-foundUser', foundUser);
      const redirectUrl = `${process.env.FRONTEND_URL}/candidate-signup?${queryParams}`;
      return res.redirect(redirectUrl);
    }
    return await this.authService.socialLogin(foundUser, res);
  }
}
