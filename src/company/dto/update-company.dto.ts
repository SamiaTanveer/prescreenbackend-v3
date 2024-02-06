import { PartialType } from '@nestjs/swagger';
// import { IsEmail, IsOptional } from 'class-validator';
// import { UpdateCompanyyDto } from 'src/utils/types';
// import { CompanyDto } from './create-company.dto';
import { UpdateCompanyyDto } from 'src/company/dto/updatecompany.dto';

export class UpdateCompanyDto extends PartialType(UpdateCompanyyDto) {}
