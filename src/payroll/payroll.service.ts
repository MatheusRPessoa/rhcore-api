import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payroll } from './entities/payroll.entity';
import { Repository } from 'typeorm';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { Employee } from 'src/employees/entities/employee.entity';
import { PayrollStatusEnum } from './enums/payroll-status.enum';
import { UpdatePayrollDto } from './dto/update-payroll.dto';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(
    @InjectRepository(Payroll)
    private readonly payrollRepository: Repository<Payroll>,
  ) {}

  private calcLiquido(
    base: number,
    bonus: number,
    inss: number,
    irrf: number,
    outros: number,
  ): number {
    return (
      Number(base) +
      Number(bonus) -
      Number(inss) -
      Number(irrf) -
      Number(outros)
    );
  }

  async create(dto: CreatePayrollDto, createBy: string): Promise<Payroll> {
    const existing = await this.payrollRepository.findOne({
      where: {
        FUNCIONARIO: { ID: dto.FUNCIONARIO_ID },
        MES_REFERENCIA: dto.MES_REFERENCIA,
        ANO_REFERENCIA: dto.ANO_REFERENCIA,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Já existe folha de pagamento para este funcionário em ${dto.MES_REFERENCIA}/${dto.ANO_REFERENCIA}`,
      );
    }

    const bonus = dto.BONUS ?? 0;
    const inss = dto.DESCONTO_INSS ?? 0;
    const irrf = dto.DESCONTO_IRRF ?? 0;
    const outros = dto.OUTROS_DESCONTOS ?? 0;

    const payroll = this.payrollRepository.create({
      FUNCIONARIO: { ID: dto.FUNCIONARIO_ID } as Employee,
      MES_REFERENCIA: dto.MES_REFERENCIA,
      ANO_REFERENCIA: dto.ANO_REFERENCIA,
      SALARIO_BASE: dto.SALARIO_BASE,
      BONUS: dto.BONUS,
      DESCONTO_INSS: inss,
      DESCONTO_IRRF: irrf,
      OUTROS_DESCONTOS: outros,
      SALARIO_LIQUIDO: this.calcLiquido(
        dto.SALARIO_BASE,
        bonus,
        inss,
        irrf,
        outros,
      ),
      STATUS_FOLHA: PayrollStatusEnum.PENDENTE,
      OBSERVACAO: dto.OBSERVACAO ?? null,
      CRIADO_POR: createBy,
    });

    const saved = await this.payrollRepository.save(payroll);
    this.logger.log(`Folha de pagamento ${saved.ID} criada por ${createBy}`);
    return saved;
  }

  async findAll(): Promise<Payroll[]> {
    return this.payrollRepository.find({
      relations: ['FUNCIONARIO'],
      order: { ANO_REFERENCIA: 'DESC', MES_REFERENCIA: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payroll> {
    const payroll = await this.payrollRepository.findOne({
      where: { ID: id },
      relations: ['FUNCIONARIO'],
    });

    if (!payroll) {
      this.logger.warn(`Folha de pagamento ${id} não encontrada`);
      throw new NotFoundException(
        `Folha de pagamento com ID ${id} não encontrado`,
      );
    }

    return payroll;
  }

  async update(
    id: string,
    dto: UpdatePayrollDto,
    updatedBy: string,
  ): Promise<Payroll> {
    const payroll = await this.findOne(id);

    const funcionarioId = dto.FUNCIONARIO_ID ?? payroll.FUNCIONARIO.ID;
    const mes = dto.MES_REFERENCIA ?? payroll.MES_REFERENCIA;
    const ano = dto.ANO_REFERENCIA ?? payroll.ANO_REFERENCIA;

    if (
      dto.FUNCIONARIO_ID ||
      dto.MES_REFERENCIA !== undefined ||
      dto.ANO_REFERENCIA !== undefined
    ) {
      const conflict = await this.payrollRepository.findOne({
        where: {
          FUNCIONARIO: { ID: funcionarioId },
          MES_REFERENCIA: mes,
          ANO_REFERENCIA: ano,
        },
      });

      if (conflict && conflict.ID !== id) {
        throw new ConflictException(
          `Já existe uma folha de pagamento para este funcionário em ${mes}/${ano}`,
        );
      }
    }

    const base = dto.SALARIO_BASE ?? Number(payroll.SALARIO_BASE);
    const bonus = dto.BONUS ?? Number(payroll.BONUS);
    const inss = dto.DESCONTO_INSS ?? Number(payroll.DESCONTO_INSS);
    const irrf = dto.DESCONTO_IRRF ?? Number(payroll.DESCONTO_IRRF);
    const outros = dto.OUTROS_DESCONTOS ?? Number(payroll.OUTROS_DESCONTOS);

    Object.assign(payroll, {
      ...(dto.FUNCIONARIO_ID && {
        FUNCIONARIO: { ID: dto.FUNCIONARIO_ID } as Employee,
      }),
      ...(dto.MES_REFERENCIA !== undefined && {
        MES_REFERENCIA: dto.MES_REFERENCIA,
      }),
      ...(dto.ANO_REFERENCIA !== undefined && {
        ANO_REFERENCIA: dto.ANO_REFERENCIA,
      }),
      SALARIO_BASE: base,
      BONUS: bonus,
      DESCONTO_INSS: inss,
      DESCONTO_IRRF: irrf,
      OUTROS_DESCONTOS: outros,
      SALARIO_LIQUIDO: this.calcLiquido(base, bonus, inss, irrf, outros),
      ...(dto.STATUS_FOLHA !== undefined && { STATUS_FOLHA: dto.STATUS_FOLHA }),
      ...(dto.OBSERVACAO !== undefined && { OBSERVACAO: dto.OBSERVACAO }),
      ATUALIZADO_POR: updatedBy,
    });

    const saved = await this.payrollRepository.save(payroll);
    this.logger.log(`Folha de pagamento ${id} atualizada por ${updatedBy}`);
    return saved;
  }

  async pay(id: string, updatedBy: string): Promise<Payroll> {
    const payroll = await this.findOne(id);

    if (payroll.STATUS_FOLHA === PayrollStatusEnum.PAGO) {
      throw new BadRequestException('Esta folha de pagamento já foi paga.');
    }

    Object.assign(payroll, {
      STATUS_FOLHA: PayrollStatusEnum.PAGO,
      ATUALIZADO_POR: updatedBy,
    });

    const saved = await this.payrollRepository.save(payroll);
    this.logger.log(
      `Folha de pagamento ${id} marcada como PAGO por ${updatedBy}`,
    );
    return saved;
  }

  async remove(id: string, deletedBy: string): Promise<void> {
    const payroll = await this.findOne(id);
    await this.payrollRepository.remove(payroll);
    this.logger.log(`Folha de pagamento ${id} removida por ${deletedBy}`);
  }
}
