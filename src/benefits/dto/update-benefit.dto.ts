import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { BeneficioTipoEnum } from '../enums/beneficio-tipo.enum';
import { BeneficioStatusEnum } from '../enums/beneficio-status.enum';

export class UpdateBenefitDto {
  @ApiPropertyOptional({ example: 'a3bb189e-8bf9-3888-9912-ace4e6543002' })
  @IsUUID('4', { message: 'O ID do funcionário deve ser um UUID válido' })
  @IsOptional()
  FUNCIONARIO_ID?: string;

  @ApiPropertyOptional({
    enum: BeneficioTipoEnum,
    example: BeneficioTipoEnum.PLANO_SAUDE,
  })
  @IsEnum(BeneficioTipoEnum, { message: 'Tipo de benefício inválido' })
  @IsOptional()
  TIPO?: BeneficioTipoEnum;

  @ApiPropertyOptional({ example: 600.0 })
  @IsNumber({}, { message: 'O valor deve ser um número' })
  @IsPositive({ message: 'O valor deve ser positivo' })
  @IsOptional()
  VALOR?: number;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsDateString({}, { message: 'A data de início deve ser uma data válida' })
  @IsOptional()
  DATA_INICIO?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsDateString({}, { message: 'A data de fim deve ser uma data válida' })
  @IsOptional()
  DATA_FIM?: string;

  @ApiPropertyOptional({
    enum: BeneficioStatusEnum,
    example: BeneficioStatusEnum.ATIVO,
  })
  @IsEnum(BeneficioStatusEnum, { message: 'Status de benefício inválido' })
  @IsOptional()
  STATUS_BENEFICIO?: BeneficioStatusEnum;

  @ApiPropertyOptional({ example: 'Benefício atualizado por política interna' })
  @IsString({ message: 'A descrição deve ser do tipo texto' })
  @IsOptional()
  @MaxLength(255, { message: 'A descrição deve ter no máximo 255 caracteres' })
  DESCRICAO?: string;

  @ApiPropertyOptional({ example: 'Observação atualizada' })
  @IsString({ message: 'A observação deve ser do tipo texto' })
  @IsOptional()
  @MaxLength(500, { message: 'A observação deve ter no máximo 500 caracteres' })
  OBSERVACAO?: string;
}
