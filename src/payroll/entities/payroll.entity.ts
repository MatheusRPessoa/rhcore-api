import { Employee } from 'src/employees/entities/employee.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PayrollStatusEnum } from '../enums/payroll-status.enum';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('FOLHA_PAGAMENTO')
export class Payroll extends BaseEntity {
  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn({ name: 'FUNCIONARIO_ID' })
  FUNCIONARIO: Employee;

  @Column({ name: 'MES_REFERENCIA', type: 'int' })
  MES_REFERENCIA: number;

  @Column({ name: 'ANO_REFERENCIA', type: 'int' })
  ANO_REFERENCIA: number;

  @Column({ name: 'SALARIO_BASE', type: 'decimal', precision: 10, scale: 2 })
  SALARIO_BASE: number;

  @Column({
    name: 'BONUS',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  BONUS: number;

  @Column({
    name: 'DESCONTO_INSS',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  DESCONTO_INSS: number;

  @Column({
    name: 'DESCONTO_IRRF',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  DESCONTO_IRRF: number;

  @Column({
    name: 'OUTROS_DESCONTOS',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  OUTROS_DESCONTOS: number;

  @Column({
    name: 'SALARIO_LIQUIDO',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  SALARIO_LIQUIDO: number;

  @Column({
    name: 'STATUS_FOLHA',
    type: 'varchar',
    enum: PayrollStatusEnum,
    default: PayrollStatusEnum.PENDENTE,
  })
  STATUS_FOLHA: PayrollStatusEnum;

  @Column({ name: 'OBSERVACAO', type: 'text', nullable: true })
  OBSERVACAO: string | null;
}
