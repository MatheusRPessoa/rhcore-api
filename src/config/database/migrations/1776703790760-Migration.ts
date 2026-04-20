import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1776703790760 implements MigrationInterface {
  name = 'Migration1776703790760';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "USUARIOS" ADD "FUNCIONARIO_ID" uuid`);
    await queryRunner.query(
      `ALTER TABLE "USUARIOS" ADD CONSTRAINT "UQ_41d13f8382fbdeaf9d1fb86fc74" UNIQUE ("FUNCIONARIO_ID")`,
    );
    await queryRunner.query(
      `ALTER TABLE "USUARIOS" ADD CONSTRAINT "FK_41d13f8382fbdeaf9d1fb86fc74" FOREIGN KEY ("FUNCIONARIO_ID") REFERENCES "FUNCIONARIOS"("ID") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "USUARIOS" DROP CONSTRAINT "FK_41d13f8382fbdeaf9d1fb86fc74"`,
    );
    await queryRunner.query(
      `ALTER TABLE "USUARIOS" DROP CONSTRAINT "UQ_41d13f8382fbdeaf9d1fb86fc74"`,
    );
    await queryRunner.query(
      `ALTER TABLE "USUARIOS" DROP COLUMN "FUNCIONARIO_ID"`,
    );
  }
}
