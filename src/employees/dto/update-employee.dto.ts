import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';
import { BaseEntityStatusEnum } from 'src/common/enums/base-entity-status.enum';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiPropertyOptional({ enum: BaseEntityStatusEnum })
  @IsEnum(BaseEntityStatusEnum, { message: 'Status inválido' })
  @IsOptional()
  STATUS?: BaseEntityStatusEnum;
}
