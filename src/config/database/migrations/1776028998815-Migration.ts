import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1776028998815 implements MigrationInterface {
  name = 'Migration1776028998815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "SOLICITACOES" DROP CONSTRAINT "FK_21eaf45d18e96654bc91c022337"`,
    );
    await queryRunner.query(
      `ALTER TABLE "SOLICITACOES" ADD CONSTRAINT "FK_21eaf45d18e96654bc91c022337" FOREIGN KEY ("APROVADO_POR_ID") REFERENCES "USUARIOS"("ID") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "SOLICITACOES" DROP CONSTRAINT "FK_21eaf45d18e96654bc91c022337"`,
    );
    await queryRunner.query(
      `ALTER TABLE "SOLICITACOES" ADD CONSTRAINT "FK_21eaf45d18e96654bc91c022337" FOREIGN KEY ("APROVADO_POR_ID") REFERENCES "FUNCIONARIOS"("ID") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
