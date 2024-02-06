import * as bcrypt from 'bcrypt';
import { companyTeamsEnums } from './classes';
import { BadRequestException } from '@nestjs/common';

export const findDomainFromWebsite = (websiteURL: string) => {
  // Use a regular expression to extract the domain
  const domainMatch = websiteURL.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  // console.log(domainMatch);

  if (
    domainMatch !== null &&
    domainMatch.length > 2 &&
    typeof domainMatch[2] === 'string'
  ) {
    const domain = domainMatch[2];
    // console.log(domain);

    const domainSplit = domain.split('.')[0];

    // console.log('Website Domain:', domainSplit);
    return domainSplit;
  } else {
    // console.log('website must be like https://company.xyz');
    return false;
  }
};

export const findDomainFromEmail = (email: string) => {
  // Use a regular expression to extract the domain
  const domainMatch = email.match(/@([^.]+)/);

  if (
    domainMatch !== null &&
    domainMatch.length > 1 &&
    typeof domainMatch[1] === 'string'
  ) {
    const domain = domainMatch[1];

    // console.log('Email Domain:', domain);
    return domain;
  } else {
    // console.log('Domain not found in the email address.');
    return 0;
  }
};

export const getNormalDate = (date: Date) => {
  const dateFormat = new Date(date);
  const month = dateFormat.getMonth();
  const day = dateFormat.getDate();
  const year = dateFormat.getFullYear();

  // console.log(month, day, year);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'June',
    'July',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const normalDate = `${months[month]} ${day}, ${year}`;
  return normalDate;
};

// FUNCTION to generate 6 digit random OTP
export const generateRandom5DigitOTP = async () => {
  const min = 100000;
  const max = 999999;
  const normalOtp = `${Math.floor(Math.random() * (max - min + 1)) + min}`;
  const saltRounds = 10;
  const hashedOTP = await bcrypt.hash(normalOtp, saltRounds);
  console.log(normalOtp);
  return { normalOtp, hashedOTP };
};

export const getQuestionCounts = (mcqs: any[]) => {
  let generalCount = 0;
  mcqs.map((question: any) => {
    if (question) {
      generalCount++;
    }
  });
  return generalCount;
};

export const getupdatedFeaturesAllowed = (
  featureToUpdate: string,
  feature: any,
) => {
  // export const getupdatedTestsAllowed = (feature: any) => {
  let generalCount = 0;
  if (featureToUpdate === 'tests') {
    generalCount = feature.featuresUsed.testsUsed;
  } else if (featureToUpdate === 'jobs') {
    generalCount = feature.featuresUsed.jobsUsed;
  } else if (featureToUpdate === 'assessments') {
    generalCount = feature.featuresUsed.assessmentsUsed;
  } else if (featureToUpdate === 'invites') {
    console.log(featureToUpdate);
    generalCount = feature.featuresUsed.invitesUsed;
  }
  // console.log('generalCount', generalCount);
  generalCount++;
  console.log('generalCount>>', generalCount.toString());
  return generalCount.toString();
};

export const calculateTotalQuestions = (obj1: any, obj2: any) => {
  let total = 0;

  for (const difficulty in obj1) {
    if (obj1.hasOwnProperty(difficulty)) {
      total += obj1[difficulty];
    }
  }

  for (const difficulty in obj2) {
    if (obj2.hasOwnProperty(difficulty)) {
      total += obj2[difficulty];
    }
  }

  return total;
};
// TODO: Tags, language sorting
export const setSortStageTags = (sortString: string) => {
  const arraySort = sortString?.split(':');
  // check for length of array it must be 2
  // console.log(arraySort.length);
  if (
    arraySort.length != 2 &&
    (arraySort[1] == 'asc' || arraySort[0] == 'desc')
  ) {
    throw new BadRequestException(
      'sort TagName is invalid...e.g. tag:asc or tag:desc',
    );
  }
  const orderBy = arraySort[0].trim();
  const orderType = arraySort[1].trim();
  // let orderNumber: number = 1;
  // console.log(orderBy, orderType);
  // tag
  if (orderBy === 'title') {
    return { tagName: orderType === 'asc' ? 1 : -1 };
  }
};
export const setSortStageCompanies = (sortString: string) => {
  const arraySort = sortString?.split(':');
  // check for length of array it must be 2
  // console.log(arraySort.length);
  if (
    arraySort.length != 2 &&
    (arraySort[1] == 'asc' || arraySort[0] == 'desc')
  ) {
    throw new BadRequestException(
      'sort TagName is invalid...e.g. name:asc or createdAt:desc or planCreatedAt: asc',
    );
  }
  const orderBy = arraySort[0].trim();
  const orderType = arraySort[1].trim();
  let orderNumber: number = 1;

  if (orderBy === 'name') {
    orderNumber = orderType === 'asc' ? 1 : -1;
  } else {
    orderNumber = orderType !== 'asc' ? -1 : 1;
  }

  // createdAt
  if (orderBy === 'createdAt') {
    orderNumber = orderType === 'asc' ? 1 : -1;
  }
  if (orderBy === 'planCreatedAt') {
    return { 'companySubscription.updatedAt': orderType === 'asc' ? 1 : -1 };
  }

  return { [orderBy]: orderNumber };
};
export const setSortStageComAssessment = (sortString: string) => {
  const arraySort = sortString?.split(':');
  // check for length of array it must be 2
  // console.log(arraySort.length);
  if (
    arraySort.length != 2 &&
    (arraySort[1].trim() == 'asc' || arraySort[1].trim() == 'desc')
  ) {
    throw new BadRequestException(
      'sort Title is invalid...e.g. name:asc or name:desc',
    );
  }
  const orderBy = arraySort[0].trim();
  const orderType = arraySort[1].trim();

  let orderNumber: number = 1;
  // tag for Tests
  // console.log(orderBy);
  if (orderBy === 'tag') {
    return { 'tag.tagName': orderType === 'asc' ? 1 : -1 };
  }
  // test for company assessments
  if (orderBy === 'test') {
    return { 'tests.testName': orderType === 'asc' ? 1 : -1 };
  }
  // name is string so it works opposite
  if (orderBy === 'name') {
    orderNumber = orderType === 'asc' ? 1 : -1;
  } else {
    orderNumber = orderType !== 'asc' ? -1 : 1;
  }
  // title
  if (orderBy === 'title') {
    orderNumber = orderType === 'asc' ? -1 : 1;
  } else {
    orderNumber = orderType === 'asc' ? 1 : -1;
  }
  // language
  if (orderBy === 'language') {
    orderNumber = orderType === 'asc' ? 1 : -1;
  }
  // jobRole
  if (orderBy === 'jobRole') {
    orderNumber = orderType === 'asc' ? 1 : -1;
  }
  if (orderBy === 'createdBy') {
    orderNumber = orderType === 'asc' ? 1 : -1;
  }
  if (orderBy === 'createdAt') {
    orderNumber = orderType === 'asc' ? 1 : -1;
  }

  return { [orderBy]: orderNumber };
};
export const setSortStageJobs = (sortString: string) => {
  const arraySort = sortString?.split(':');
  // check for length of array it must be 2
  // console.log(arraySort.length);
  if (
    arraySort.length != 2 &&
    (arraySort[1].trim() == 'asc' || arraySort[1].trim() == 'desc')
  ) {
    throw new BadRequestException(
      'sort Title is invalid...e.g. title:asc or datePosted:desc or jobType:asc',
    );
  }
  const orderBy = arraySort[0].trim();
  const orderType = arraySort[1].trim();
  let orderNumber: number = 1;
  // title is string so it works opposite
  if (orderBy === 'title') {
    orderNumber = orderType === 'asc' ? 1 : -1;
  } else {
    orderNumber = orderType === 'asc' ? 1 : -1;
  }
  // jobType
  if (orderBy === 'jobType') {
    orderNumber = orderType === 'asc' ? 1 : -1;
  }
  // datePosted means createdBy
  if (orderBy === 'datePosted') {
    return { createdAt: orderType === 'asc' ? 1 : -1 };
  }
  // application deadline
  if (orderBy === 'dueDate') {
    return { applicationDeadline: orderType === 'asc' ? 1 : -1 };
  }

  return { [orderBy]: orderNumber };
};
export const setSortStageApplicationsSingleJob = (sortString: string) => {
  const arraySort = sortString?.split(':');
  // check for length of array it must be 2
  // console.log(arraySort.length);
  if (
    arraySort.length != 2 &&
    (arraySort[1].trim() == 'asc' || arraySort[1].trim() == 'desc')
  ) {
    throw new BadRequestException(
      'sort Title is invalid...e.g. name:asc or score:desc or stage: desc or appliedDate: desc',
    );
  }
  const orderBy = arraySort[0].trim();
  const orderType = arraySort[1].trim();
  // let orderNumber: number = 1;
  // // name is string so it works opposite
  // if (orderBy === 'name') {
  //   orderNumber = orderType === 'asc' ? 1 : -1;
  // } else {
  //   orderNumber = orderType === 'asc' ? 1 : -1;
  // }
  // name
  if (orderBy === 'name') {
    return {
      'candidateInfo.name': orderType === 'asc' ? 1 : -1,
    };
  }

  // stage
  if (orderBy === 'stage') {
    return { 'statusByCompany.status': orderType === 'asc' ? 1 : -1 };
  }
  // applied Date means createdAt
  if (orderBy === 'appliedDate') {
    return { createdAt: orderType === 'asc' ? 1 : -1 };
  }

  // return { [orderBy]: orderNumber };
};
export const setSortStage = (sortString: string) => {
  const arraySort = sortString?.split(':');
  // check for length of array it must be 2
  // console.log(arraySort.length);
  if (
    arraySort.length != 2 &&
    (arraySort[1].trim() == 'asc' || arraySort[1].trim() == 'desc')
  ) {
    throw new BadRequestException(
      'sort Title is invalid...e.g. language:asc or title:desc or tag:asc',
    );
  }
  const orderBy = arraySort[0].trim();
  const orderType = arraySort[1].trim();
  // tag
  if (orderBy === 'tag') {
    return { 'tags.tagName': orderType === 'asc' ? 1 : -1 };
  }
  let orderNumber: number = 1;
  // title is string so it works opposite
  if (orderBy === 'title') {
    orderNumber = orderType === 'asc' ? -1 : 1;
  } else {
    orderNumber = orderType === 'asc' ? 1 : -1;
  }
  // language
  if (orderBy === 'language') {
    orderNumber = orderType === 'asc' ? 1 : -1;
  }

  return { [orderBy]: orderNumber };
};
export const setSortStageAssessments = (sortString: string) => {
  const arraySort = sortString?.split(':');
  // check for length of array it must be 2
  // console.log(arraySort.length);
  if (
    arraySort.length != 2 &&
    (arraySort[1].trim() == 'asc' || arraySort[1].trim() == 'desc')
  ) {
    throw new BadRequestException(
      'sort Title is invalid...e.g. language:asc or title:desc or tag:asc',
    );
  }
  const orderBy = arraySort[0].trim();
  const orderType = arraySort[1].trim();

  let orderNumber: number = 1;
  // title is string so it works opposite
  if (orderBy === 'title') {
    orderNumber = orderType === 'asc' ? -1 : 1;
  } else {
    orderNumber = orderType === 'asc' ? 1 : -1;
  }

  return { planTitle: orderNumber };
};
export const setSortStageFeedback = (sortString: string) => {
  const arraySort = sortString?.split(':');
  console.log(arraySort.length, arraySort);
  if (
    arraySort.length != 2 &&
    (arraySort[1].trim() == 'asc' || arraySort[1].trim() == 'desc')
  ) {
    throw new BadRequestException(
      'sort Title is invalid...e.g. rating:asc or rating:desc or comments:asc',
    );
  }
  const orderBy = arraySort[0].trim();
  const orderType = arraySort[1].trim();
  let orderNumber: number = 1;
  // rating
  if (orderBy === 'rating') {
    orderNumber = orderType === 'asc' ? 1 : -1;
  }
  // comments
  if (orderBy === 'comments') {
    orderNumber = orderType === 'asc' ? 1 : -1;
  }

  return { [orderBy]: orderNumber };
};

export const checkUser = (
  userType: string,
  companyId: string,
  userid: string,
) => {
  const validUserTypes = Object.values(companyTeamsEnums);
  if (validUserTypes.includes(userType)) {
    console.log('Setting company ID from team model');
    const userid = companyId;
    return userid;
  }
  return userid;
};

export const isValidObjectId = (id: string) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

export const checkDuplicates = (arrtoCheck: any[], propertyName: string) => {
  const uniquePropertyValues = new Set();
  const hasDuplicates = arrtoCheck.some((item) => {
    const propertyValue = item[propertyName];
    if (uniquePropertyValues.has(propertyValue)) {
      return true;
    }
    uniquePropertyValues.add(propertyValue);
    return false;
  });
  console.log(uniquePropertyValues);

  return hasDuplicates;
};

export const setSortStageBrowseCompanies = (sortString: string) => {
  const arraySort = sortString?.split(':');
  if (
    arraySort.length != 2 &&
    (arraySort[1] == 'asc' || arraySort[0] == 'desc')
  ) {
    throw new BadRequestException(
      'sort TagName is invalid...e.g. name:asc or createdAt:desc',
    );
  }
  const orderBy = arraySort[0].trim();
  const orderType = arraySort[1].trim();
  let orderNumber: number = 1;

  if (orderBy === 'name') {
    orderNumber = orderType === 'asc' ? 1 : -1;
  } else {
    orderNumber = orderType !== 'asc' ? -1 : 1;
  }

  // createdAt
  if (orderBy === 'createdAt') {
    orderNumber = orderType === 'asc' ? 1 : -1;
  }

  return { [orderBy]: orderNumber };
};

// export const getupdateExamQuestions = (exams: any, feature: any) => {
//   let generalCount = feature.featuresUsed.examsUsed.general;
//   let privateCount = feature.featuresUsed.examsUsed.private;
//   if (exams.examType === 'general') {
//     generalCount++;
//   } else if (exams.examType === 'private') {
//     privateCount++;
//   }
//   // console.log('generalCount>', generalCount, 'privateCount:', privateCount);
//   return { generalCount, privateCount };
// };
