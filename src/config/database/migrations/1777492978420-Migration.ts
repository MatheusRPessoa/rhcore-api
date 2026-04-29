import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1777492978420 implements MigrationInterface {
  name = 'Migration1777492978420';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "BENEFICIOS" ("ID" uuid NOT NULL DEFAULT uuid_generate_v4(), "CRIADO_POR" character varying(20) NOT NULL, "CRIADO_EM" TIMESTAMP NOT NULL DEFAULT now(), "STATUS" character varying NOT NULL DEFAULT 'ATIVO', "ATUALIZADO_POR" character varying(20), "EXCLUIDO_POR" character varying(20), "TIPO" character varying NOT NULL, "DESCRICAO" character varying(255), "VALOR" numeric(10,2) NOT NULL, "DATA_INICIO" date NOT NULL, "DATA_FIM" date, "STATUS_BENEFICIO" character varying NOT NULL DEFAULT 'ATIVO', "OBSERVACAO" character varying(500), "FUNCIONARIO_ID" uuid, CONSTRAINT "PK_3105d02c231b9b36c7bf301518f" PRIMARY KEY ("ID"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "BENEFICIOS" ADD CONSTRAINT "FK_81328b081dd9f34e9deb24117c2" FOREIGN KEY ("FUNCIONARIO_ID") REFERENCES "FUNCIONARIOS"("ID") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "BENEFICIOS" DROP CONSTRAINT "FK_81328b081dd9f34e9deb24117c2"`,
    );
    await queryRunner.query(`DROP TABLE "BENEFICIOS"`);
  }
}
