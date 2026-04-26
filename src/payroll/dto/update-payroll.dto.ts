import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePayrollDto } from './create-payroll.dto';
import { PayrollStatusEnum } from '../enums/payroll-status.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdatePayrollDto extends PartialType(CreatePayrollDto) {
  @ApiPropertyOptional({ enum: PayrollStatusEnum })
  @IsEnum(PayrollStatusEnum, { message: 'Status inválido' })
  @IsOptional()
  STATUS_FOLHA?: PayrollStatusEnum;
}
