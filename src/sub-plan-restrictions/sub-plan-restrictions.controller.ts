// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
// } from '@nestjs/common';
// import { SubPlanRestrictionsService } from './sub-plan-restrictions.service';
// import { CreateSubPlanRestrictionDto } from './dto/create-sub-plan-restriction.dto';
// import { UpdateSubPlanRestrictionDto } from './dto/update-sub-plan-restriction.dto';

// @Controller('sub-plan-restrictions')
// export class SubPlanRestrictionsController {
//   constructor(
//     private readonly subPlanRestrictionsService: SubPlanRestrictionsService,
//   ) {}

//   @Post()
//   create(@Body() createSubPlanRestrictionDto: CreateSubPlanRestrictionDto) {
//     return this.subPlanRestrictionsService.create(createSubPlanRestrictionDto);
//   }

//   @Get()
//   findAll() {
//     return this.subPlanRestrictionsService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.subPlanRestrictionsService.findOne(+id);
//   }

//   @Patch(':id')
//   update(
//     @Param('id') id: string,
//     @Body() updateSubPlanRestrictionDto: UpdateSubPlanRestrictionDto,
//   ) {
//     return this.subPlanRestrictionsService.update(
//       +id,
//       updateSubPlanRestrictionDto,
//     );
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.subPlanRestrictionsService.remove(+id);
//   }
// }
