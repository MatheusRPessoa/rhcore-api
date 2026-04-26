import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1777214560288 implements MigrationInterface {
  name = 'Migration1777214560288';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "FOLHA_PAGAMENTO" ("ID" uuid NOT NULL DEFAULT uuid_generate_v4(), "CRIADO_POR" character varying(20) NOT NULL, "CRIADO_EM" TIMESTAMP NOT NULL DEFAULT now(), "STATUS" character varying NOT NULL DEFAULT 'ATIVO', "ATUALIZADO_POR" character varying(20), "EXCLUIDO_POR" character varying(20), "MES_REFERENCIA" integer NOT NULL, "ANO_REFERENCIA" integer NOT NULL, "SALARIO_BASE" numeric(10,2) NOT NULL, "BONUS" numeric(10,2) NOT NULL DEFAULT '0', "DESCONTO_INSS" numeric(10,2) NOT NULL DEFAULT '0', "DESCONTO_IRRF" numeric(10,2) NOT NULL DEFAULT '0', "OUTROS_DESCONTOS" numeric(10,2) NOT NULL DEFAULT '0', "SALARIO_LIQUIDO" numeric(10,2) NOT NULL, "STATUS_FOLHA" character varying NOT NULL DEFAULT 'PENDENTE', "OBSERVACAO" text, "FUNCIONARIO_ID" uuid, CONSTRAINT "PK_71c84852c9e45719dc05f2362e4" PRIMARY KEY ("ID"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "FOLHA_PAGAMENTO" ADD CONSTRAINT "FK_95a421c3bee78da1c5fc3552371" FOREIGN KEY ("FUNCIONARIO_ID") REFERENCES "FUNCIONARIOS"("ID") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "FOLHA_PAGAMENTO" DROP CONSTRAINT "FK_95a421c3bee78da1c5fc3552371"`,
    );
    await queryRunner.query(`DROP TABLE "FOLHA_PAGAMENTO"`);
  }
}
