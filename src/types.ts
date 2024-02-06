export interface LoggedUser {
  name: string;
  email: string;
  userId: string;
}

export interface EmailData {
  email: string;
  Otp: string;
}

export interface InviteEmailData {
  companyName: string;
  job: string;
  inviteLink: string;
  expiryTime: string;
  email: string;
}

export interface ReminderData {
  subscriptionPlan: string;
  expiryDate: string;
  email: string;
}

export interface jobReminderData {
  jobTitle: string;
  companyName: string;
  expiryDate: string;
  email: string;
}

export interface ContactFormData {
  email: string;
  name: string;
  companyname: string;
  phone: string;
  message: string;
}

export interface InvitedData {
  inviteLink: string;
  expiryTime: string;
  email: string;
}

export interface AuthReq extends Request {
  user: {
    id: string;
    name: string;
    userType: string;
    company: string;
    candidate: string;
    email: string;
  };
}
