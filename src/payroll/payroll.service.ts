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
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import PdfPrinter from 'pdfmake/js/Printer';
import pdfVirtualfs from 'pdfmake/js/virtual-fs';
import PdfURLResolver from 'pdfmake/js/URLResolver';
import pdfVfsFonts from 'pdfmake/build/vfs_fonts';

pdfVirtualfs.writeFileSync(
  'Roboto-Regular.ttf',
  Buffer.from(pdfVfsFonts['Roboto-Regular.ttf'], 'base64'),
);
pdfVirtualfs.writeFileSync(
  'Roboto-Medium.ttf',
  Buffer.from(pdfVfsFonts['Roboto-Medium.ttf'], 'base64'),
);
pdfVirtualfs.writeFileSync(
  'Roboto-Italic.ttf',
  Buffer.from(pdfVfsFonts['Roboto-Italic.ttf'], 'base64'),
);
pdfVirtualfs.writeFileSync(
  'Roboto-MediumItalic.ttf',
  Buffer.from(pdfVfsFonts['Roboto-MediumItalic.ttf'], 'base64'),
);

const pdfUrlResolver = new PdfURLResolver(pdfVirtualfs);

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(
    @InjectRepository(Payroll)
    private readonly payrollRepository: Repository<Payroll>,
  ) {}

  private calcINSS(base: number): number {
    const faixas = [
      { ate: 1518.0, aliquota: 0.075 },
      { ate: 2793.88, aliquota: 0.09 },
      { ate: 4190.83, aliquota: 0.12 },
      { ate: 8157.41, aliquota: 0.14 },
    ];

    let inss = 0;
    let anterior = 0;

    for (const faixa of faixas) {
      if (base > faixa.ate) {
        inss += (faixa.ate - anterior) * faixa.aliquota;
        anterior = faixa.ate;
      } else {
        inss += (base - anterior) * faixa.aliquota;
        break;
      }
    }

    return Math.round(inss * 100) / 100;
  }

  private calcIRRF(base: number, inss: number, dependentes: number): number {
    const deducaoDependente = 189.59 * dependentes;
    const baseCalculo = base - inss - deducaoDependente;

    if (baseCalculo <= 2259.2) return 0;
    if (baseCalculo <= 2826.65)
      return Math.round((baseCalculo * 0.075 - 169.44) * 100) / 100;
    if (baseCalculo <= 3751.05)
      return Math.round((baseCalculo * 0.15 - 381.44) * 100) / 100;
    if (baseCalculo <= 4664.68)
      return Math.round((baseCalculo * 0.225 - 662.77) * 100) / 100;
    return Math.round((baseCalculo * 0.275 - 896.0) * 100) / 100;
  }

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

    const dependentes = dto.NUMERO_DEPENDENTES ?? 0;
    const bonus = dto.BONUS ?? 0;
    const inss = dto.DESCONTO_INSS ?? this.calcINSS(dto.SALARIO_BASE);
    const irrf =
      dto.DESCONTO_IRRF ?? this.calcIRRF(dto.SALARIO_BASE, inss, dependentes);
    const outros = dto.OUTROS_DESCONTOS ?? 0;

    const payroll = this.payrollRepository.create({
      FUNCIONARIO: { ID: dto.FUNCIONARIO_ID } as Employee,
      MES_REFERENCIA: dto.MES_REFERENCIA,
      ANO_REFERENCIA: dto.ANO_REFERENCIA,
      NUMERO_DEPENDENTES: dependentes,
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
    const dependentes =
      dto.NUMERO_DEPENDENTES ?? Number(payroll.NUMERO_DEPENDENTES);
    const inss = dto.DESCONTO_INSS ?? this.calcINSS(base);
    const irrf = dto.DESCONTO_IRRF ?? this.calcIRRF(base, inss, dependentes);
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
      NUMERO_DEPENDENTES: dependentes,
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

  async generateSlip(id: string): Promise<Buffer> {
    const payroll = await this.findOne(id);

    const printer = new PdfPrinter(
      {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf',
        },
      },
      pdfVirtualfs,
      pdfUrlResolver,
    );

    const mes = String(payroll.MES_REFERENCIA).padStart(2, '0');
    const ano = payroll.ANO_REFERENCIA;

    const fmt = (val: number | string) =>
      Number(val).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const totalVencimentos =
      Number(payroll.SALARIO_BASE) + Number(payroll.BONUS);
    const totalDescontos =
      Number(payroll.DESCONTO_INSS) +
      Number(payroll.DESCONTO_IRRF) +
      Number(payroll.OUTROS_DESCONTOS);

    const buildVia = (label: string) => [
      {
        columns: [
          { text: label, style: 'viaLabel', width: '*' },
          {
            text: `Holerite  ${mes}/${ano}`,
            style: 'header',
            alignment: 'right',
            width: 'auto',
          },
        ],
        margin: [0, 0, 0, 6],
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: 'Funcionário', style: 'label' },
              { text: 'Matrícula', style: 'label' },
            ],
            [
              { text: payroll.FUNCIONARIO.NOME, style: 'value' },
              { text: payroll.FUNCIONARIO.MATRICULA, style: 'value' },
            ],
            [
              { text: 'Nº de Dependentes', style: 'label' },
              { text: 'Status', style: 'label' },
            ],
            [
              { text: String(payroll.NUMERO_DEPENDENTES), style: 'value' },
              { text: payroll.STATUS_FOLHA, style: 'value' },
            ],
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 8],
      },
      {
        table: {
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Descrição', style: 'tableHeader' },
              { text: 'Vencimentos', style: 'tableHeader', alignment: 'right' },
              { text: 'Descontos', style: 'tableHeader', alignment: 'right' },
            ],
            [
              { text: 'Salário Base', style: 'tableRow' },
              {
                text: fmt(payroll.SALARIO_BASE),
                style: 'tableRow',
                alignment: 'right',
              },
              { text: '-', style: 'tableRow', alignment: 'right' },
            ],
            [
              { text: 'Bônus', style: 'tableRow' },
              {
                text: fmt(payroll.BONUS),
                style: 'tableRow',
                alignment: 'right',
              },
              { text: '-', style: 'tableRow', alignment: 'right' },
            ],
            [
              { text: 'Desconto INSS', style: 'tableRow' },
              { text: '-', style: 'tableRow', alignment: 'right' },
              {
                text: fmt(payroll.DESCONTO_INSS),
                style: 'tableRow',
                alignment: 'right',
              },
            ],
            [
              { text: 'Desconto IRRF', style: 'tableRow' },
              { text: '-', style: 'tableRow', alignment: 'right' },
              {
                text: fmt(payroll.DESCONTO_IRRF),
                style: 'tableRow',
                alignment: 'right',
              },
            ],
            [
              { text: 'Outros Descontos', style: 'tableRow' },
              { text: '-', style: 'tableRow', alignment: 'right' },
              {
                text: fmt(payroll.OUTROS_DESCONTOS),
                style: 'tableRow',
                alignment: 'right',
              },
            ],
            [
              { text: 'Total', bold: true },
              { text: fmt(totalVencimentos), bold: true, alignment: 'right' },
              { text: fmt(totalDescontos), bold: true, alignment: 'right' },
            ],
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 6],
      },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'SALÁRIO LÍQUIDO', bold: true, fontSize: 11 },
              {
                text: `R$ ${fmt(payroll.SALARIO_LIQUIDO)}`,
                bold: true,
                fontSize: 11,
                alignment: 'right',
              },
            ],
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 6],
      },
      ...(payroll.OBSERVACAO
        ? [
            {
              text: `Observação: ${payroll.OBSERVACAO}`,
              style: 'obs',
              margin: [0, 0, 0, 6] as [number, number, number, number],
            },
          ]
        : []),
      {
        columns: [
          {
            stack: [
              { text: '', margin: [0, 20, 0, 0] },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 0,
                    x2: 190,
                    y2: 0,
                    lineWidth: 0.5,
                  },
                ],
              },
              { text: 'Assinatura do Funcionário', style: 'signLabel' },
            ],
            width: '*',
          },
          {
            stack: [
              { text: '', margin: [0, 20, 0, 0] },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 0,
                    x2: 190,
                    y2: 0,
                    lineWidth: 0.5,
                  },
                ],
              },
              { text: 'Assinatura RH / Empresa', style: 'signLabel' },
            ],
            width: '*',
          },
        ],
        margin: [0, 0, 0, 0],
      },
    ];

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [36, 36, 36, 36],
      defaultStyle: { font: 'Roboto', fontSize: 9 },
      content: [
        ...buildVia('1ª VIA — EMPRESA'),
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 523,
              y2: 0,
              lineWidth: 0.5,
              dash: { length: 4, space: 4 },
            },
          ],
          margin: [0, 14, 0, 14],
        },
        ...buildVia('2ª VIA — FUNCIONÁRIO'),
      ] as TDocumentDefinitions['content'],
      styles: {
        header: { fontSize: 13, bold: true },
        viaLabel: { fontSize: 8, bold: true, color: '#555555' },
        label: { fontSize: 8, color: '#888888' },
        value: { fontSize: 10, bold: true },
        tableHeader: {
          bold: true,
          fillColor: '#f0f0f0',
          margin: [4, 3, 4, 3],
          fontSize: 8,
        },
        tableRow: { margin: [4, 2, 4, 2], fontSize: 9 },
        signLabel: {
          fontSize: 8,
          color: '#888888',
          alignment: 'center',
          margin: [0, 3, 0, 0],
        },
        obs: { fontSize: 8, italics: true, color: '#555555' },
      },
    };

    const doc = await printer.createPdfKitDocument(docDefinition);

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });
  }
}
