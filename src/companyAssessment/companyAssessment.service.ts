import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  CompanyAssessmentPaginationDto,
  ExamPaginationDto,
  stuAssessmentDto,
} from 'src/utils/classes';
import { setSortStage, setSortStageComAssessment } from 'src/utils/funtions';
import { CompanyAssessment } from './entities/companyAssessment.entity';
import { CreateCompanyAssessmentDto } from './dto/create-company-assessment.dto';
import { UpdateComAssessmentDto } from './dto/update-com-assessment.dto';

@Injectable()
export class CompanyAssessmentService {
  constructor(
    @InjectModel(CompanyAssessment.name)
    private companyAssessmentModel: Model<CompanyAssessment>,
  ) {}

  async create(userid: string, dto: CreateCompanyAssessmentDto) {
    const assessmentFound = await this.companyAssessmentModel.findOne({
      createdBy: userid,
      name: dto.name,
    });

    if (assessmentFound) {
      throw new BadRequestException(
        'This Assessment is already present. try another name',
      );
    }
    dto.createdBy = userid;
    dto.updatedBy = userid;
    const createdCompanyAssessment =
      await this.companyAssessmentModel.create(dto);
    return createdCompanyAssessment;
  }

  // async findAll(userid: string, query: CompanyAssessmentPaginationDto) {
  //   let result;

  //   const { page, limit, name, sort, test } = query;
  //   const sortStage: any = {};
  //   const matchStage: any = {
  //     createdBy: new mongoose.Types.ObjectId(userid),
  //   };
  //   if (page !== undefined && limit !== undefined) {
  //     let skip = (page - 1) * limit;
  //     if (skip < 0) {
  //       skip = 0;
  //     }
  //     // console.log(arraySort);

  //     if (sort) {
  //       sortStage['$sort'] = setSortStageComAssessment(sort);
  //     }
  //     // console.log(sortStage);

  //     result = await this.companyAssessmentModel.aggregate([
  //       {
  //         $lookup: {
  //           from: 'tests',
  //           let: {
  //             testIds: '$tests',
  //           },
  //           pipeline: [
  //             {
  //               $match: {
  //                 $expr: {
  //                   $in: ['$_id', '$$testIds'],
  //                 },
  //               },
  //             },
  //           ],
  //           as: 'tests',
  //         },
  //       },
  //       { $match: matchStage },
  //       ...(name
  //         ? [
  //             {
  //               $match: { name: { $regex: name, $options: 'i' } },
  //             },
  //           ]
  //         : []),
  //       ...(test
  //         ? [
  //             {
  //               $addFields: {
  //                 tests: {
  //                   $filter: {
  //                     input: '$tests',
  //                     as: 'test',
  //                     cond: {
  //                       $regexMatch: {
  //                         input: '$$test.testName',
  //                         regex: test,
  //                         options: 'i',
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           ]
  //         : []),
  //       ...(test
  //         ? [
  //             {
  //               $match: {
  //                 tests: {
  //                   $ne: [],
  //                 },
  //               },
  //             },
  //           ]
  //         : []),
  //       {
  //         $facet: {
  //           companyAssessments: [
  //             { $match: matchStage },
  //             { $skip: skip },
  //             { $limit: +limit },
  //             ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
  //             {
  //               $lookup: {
  //                 from: 'users',
  //                 localField: 'createdBy',
  //                 foreignField: '_id',
  //                 as: 'createdByUser',
  //               },
  //             },
  //             {
  //               $addFields: {
  //                 createdBy: {
  //                   $arrayElemAt: ['$createdByUser', 0],
  //                 },
  //               },
  //             },
  //             {
  //               $unset: 'createdByUser',
  //             },
  //             {
  //               $addFields: {
  //                 totalcandidates: 0,
  //                 notstarted: 0,
  //                 completed: 0,
  //                 inprogress: 0,
  //               },
  //             },
  //           ],
  //           totalDocs: [
  //             { $match: matchStage },
  //             { $skip: skip },
  //             { $limit: +limit },
  //             { $count: 'count' },
  //           ],
  //         },
  //       },
  //     ]);

  //     const companyAssessments = result[0].companyAssessments;
  //     const totalDocs =
  //       result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

  //     return {
  //       companyAssessments: companyAssessments,
  //       total: totalDocs,
  //     };
  //   }
  // }

  async findAll(userid: string, query: CompanyAssessmentPaginationDto) {
    let result;

    const { page, limit, name, sort, test } = query;
    const sortStage: any = {};
    const matchStage: any = {
      createdBy: new mongoose.Types.ObjectId(userid),
    };

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      if (sort) {
        sortStage['$sort'] = setSortStageComAssessment(sort);
      }

      result = await this.companyAssessmentModel.aggregate([
        {
          $lookup: {
            from: 'tests',
            let: {
              testIds: '$tests',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$_id', '$$testIds'],
                  },
                },
              },
            ],
            as: 'tests',
          },
        },
        { $match: matchStage },
        ...(name
          ? [
              {
                $match: { name: { $regex: name, $options: 'i' } },
              },
            ]
          : []),
        ...(test
          ? [
              {
                $addFields: {
                  tests: {
                    $filter: {
                      input: '$tests',
                      as: 'test',
                      cond: {
                        $regexMatch: {
                          input: '$$test.testName',
                          regex: test,
                          options: 'i',
                        },
                      },
                    },
                  },
                },
              },
            ]
          : []),
        ...(test
          ? [
              {
                $match: {
                  tests: {
                    $ne: [],
                  },
                },
              },
            ]
          : []),
        {
          $facet: {
            companyAssessments: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
              {
                $lookup: {
                  from: 'users',
                  localField: 'createdBy',
                  foreignField: '_id',
                  as: 'createdByUser',
                },
              },
              {
                $addFields: {
                  createdBy: {
                    $arrayElemAt: ['$createdByUser.name', 0],
                  },
                },
              },
              {
                $unset: 'createdByUser',
              },
              {
                $addFields: {
                  totalcandidates: 0,
                  notstarted: 0,
                  completed: 0,
                  inprogress: 0,
                },
              },
            ],
            totalDocs: [
              { $match: matchStage },
              // { $skip: skip },
              // { $limit: +limit },
              { $count: 'count' },
            ],
          },
        },
      ]);

      const companyAssessments = result[0].companyAssessments;
      const totalDocs =
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

      return {
        companyAssessments: companyAssessments,
        total: totalDocs,
      };
    }
  }

  async findAllForJobPost(userid: string) {
    return this.companyAssessmentModel.find({ createdBy: userid });
  }

  async findCompanyGeneral(id: string, query: ExamPaginationDto) {
    let result;
    const matchStage: any = {
      $or: [
        { createdBy: new mongoose.Types.ObjectId(id) },
        { examType: 'general' },
      ],
    };
    const { page, limit, title, language, tag, sort } = query;
    const sortStage: any = {};
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }

      result = await this.companyAssessmentModel.aggregate([
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: 'tags',
            let: {
              tagIds: '$tags',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$_id', '$$tagIds'],
                  },
                },
              },
            ],
            as: 'tags',
          },
        },
        ...(title
          ? [
              {
                $match: { title: { $regex: title, $options: 'i' } },
              },
            ]
          : []),
        ...(language
          ? [
              {
                $match: { language: { $regex: language, $options: 'i' } },
              },
            ]
          : []),
        ...(tag
          ? [
              {
                $addFields: {
                  tags: {
                    $filter: {
                      input: '$tags',
                      as: 'tag',
                      cond: {
                        $regexMatch: {
                          input: '$$tag.tagName',
                          regex: tag,
                          options: 'i',
                        },
                      },
                    },
                  },
                },
              },
            ]
          : []),
        ...(tag
          ? [
              {
                $match: {
                  tags: {
                    $ne: [],
                  },
                },
              },
            ]
          : []),
        {
          $facet: {
            exams: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
              { $count: 'count' },
            ],
          },
        },
      ]);
    } else {
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }
      result = await this.companyAssessmentModel.aggregate([
        {
          $lookup: {
            from: 'tags',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags',
          },
        },
        ...(title
          ? [
              {
                $match: { title: { $regex: title, $options: 'i' } },
              },
            ]
          : []),
        {
          $facet: {
            exams: [
              { $match: matchStage },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
          },
        },
      ]);
    }

    const exams = result[0].exams;
    // console.log(exams);
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
    return {
      exams: exams.length == 0 ? [] : exams,
      total: totalDocs,
    };
  }

  async findByCompany(id: string, query: ExamPaginationDto) {
    let result;
    const matchStage: any = {
      createdBy: new mongoose.Types.ObjectId(id),
    };
    const { page, limit, title, language, tag, sort } = query;
    const sortStage: any = {};
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }
      result = await this.companyAssessmentModel.aggregate([
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: 'tags',
            let: {
              tagIds: '$tags',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$_id', '$$tagIds'],
                  },
                },
              },
            ],
            as: 'tags',
          },
        },
        ...(title
          ? [
              {
                $match: { title: { $regex: title, $options: 'i' } },
              },
            ]
          : []),
        ...(language
          ? [
              {
                $match: { language: { $regex: language, $options: 'i' } },
              },
            ]
          : []),
        ...(tag
          ? [
              {
                $addFields: {
                  tags: {
                    $filter: {
                      input: '$tags',
                      as: 'tag',
                      cond: {
                        $regexMatch: {
                          input: '$$tag.tagName',
                          regex: tag,
                          options: 'i',
                        },
                      },
                    },
                  },
                },
              },
            ]
          : []),
        ...(tag
          ? [
              {
                $match: {
                  tags: {
                    $ne: [],
                  },
                },
              },
            ]
          : []),
        {
          $facet: {
            exams: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
              { $count: 'count' },
            ],
          },
        },
      ]);
    } else {
      if (sort) {
        sortStage['$sort'] = setSortStage(sort);
      }
      result = await this.companyAssessmentModel.aggregate([
        {
          $lookup: {
            from: 'tags',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags',
          },
        },
        ...(title
          ? [
              {
                $match: { title: { $regex: title, $options: 'i' } },
              },
            ]
          : []),
        {
          $facet: {
            exams: [
              { $match: matchStage },
              ...(Object.keys(sortStage).length > 0 ? [sortStage] : []),
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    }
    const exams = result[0].exams;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    // if (exams.length == 0) {
    //   throw new NotFoundException('Company has no Exams');
    // }
    return {
      exams: exams.length == 0 ? [] : exams,
      total: totalDocs,
    };
  }

  async findStudentAssessmentByExam(
    assessmentId: string,
    query: stuAssessmentDto,
  ) {
    const pipeLine = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(assessmentId),
        },
      },
      {
        $lookup: {
          from: 'studentassessments',
          localField: '_id',
          foreignField: 'companyAssessment',
          as: 'matchedAssessments',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'matchedAssessments.userCandidate',
          foreignField: '_id',
          as: 'userCandidateDetails',
        },
      },
      {
        $unwind: '$userCandidateDetails',
      },
      {
        $addFields: {
          'matchedAssessments.status': {
            $cond: {
              if: {
                $eq: [
                  {
                    $size: {
                      $filter: {
                        input: '$matchedAssessments',
                        as: 'assessment',
                        cond: {
                          $eq: [
                            {
                              $size: {
                                $filter: {
                                  input: '$$assessment.testPointers',
                                  as: 'tp',
                                  cond: { $eq: ['$$tp.isFinished', true] },
                                },
                              },
                            },
                            { $size: '$$assessment.testPointers' },
                          ],
                        },
                      },
                    },
                  },
                  { $size: '$matchedAssessments' },
                ],
              },
              then: 'Completed',
              else: 'In Progress',
            },
          },
        },
      },
    ];

    const results = await this.companyAssessmentModel.aggregate(pipeLine);
  }

  async findOneWithTestsPopulate(id: string) {
    const CompanyAssessment = await this.companyAssessmentModel.findOne({
      _id: id,
    });
    // .populate({
    //   path: 'tests',
    //   select:
    //     'testName testBlock language description totalTime language tag',
    // });

    if (!CompanyAssessment) {
      throw new NotFoundException('Company assessment model not found');
    }

    return CompanyAssessment;
  }
  async findOne(id: string) {
    const CompanyAssessment = await this.companyAssessmentModel.findOne({
      _id: id,
    });
    // .populate({
    //   path: 'tests',
    //   select:
    //     'testName testBlock language description totalTime language tag',
    // });

    if (!CompanyAssessment) {
      throw new NotFoundException('Company assessment model not found');
    }

    return CompanyAssessment;
  }

  async update(id: string, userid: string, dto: UpdateComAssessmentDto) {
    // find old with name
    const AssessmentFound = await this.companyAssessmentModel.findOne({
      name: dto.name,
      createdBy: userid,
      _id: { $ne: id },
    });
    if (AssessmentFound) {
      throw new BadRequestException(
        'Assessment already exists. Try another name',
      );
    }
    dto.updatedBy = userid;
    const updatedQuestion = await this.companyAssessmentModel.findOneAndUpdate(
      { _id: id, createdBy: userid },
      dto,
      { new: true },
    );

    if (!updatedQuestion) {
      throw new ConflictException('Unauthorized editing or invalid id');
    }
    return updatedQuestion;
  }

  async remove(id: string, userid: string) {
    const isDeleted = await this.companyAssessmentModel.findOneAndDelete({
      _id: id,
      createdBy: userid,
    });

    if (!isDeleted) {
      throw new ConflictException('Unauthorized Deletion or invalid id');
    }

    return {
      message: 'Company assessment deleted Successfully',
    };
  }

  async findById(id: string) {
    return await this.companyAssessmentModel.findById(id);
  }
  async findByIdAndPopulate(id: string) {
    return await this.companyAssessmentModel
      .findById(id)
      .populate('tests')
      .exec();
  }
}
