import { PartialType } from '@nestjs/mapped-types';
import { CreatePositionDto } from './create-position.dto';
import { BaseEntityStatusEnum } from 'src/common/enums/base-entity-status.enum';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePositionDto extends PartialType(CreatePositionDto) {
  @ApiPropertyOptional({ example: BaseEntityStatusEnum.ATIVO })
  @IsEnum(BaseEntityStatusEnum, {
    message: 'O valor informado para o campo STATUS é inválido',
  })
  @IsOptional()
  STATUS?: BaseEntityStatusEnum;
}
