import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentDto } from './create-department.dto';
import { BaseEntityStatusEnum } from 'src/common/enums/base-entity-status.enum';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @ApiPropertyOptional({ example: BaseEntityStatusEnum.ATIVO })
  @IsEnum(BaseEntityStatusEnum, {
    message: 'O status deve ser um valor válido',
  })
  @IsOptional()
  STATUS?: BaseEntityStatusEnum;
}
