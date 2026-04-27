import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1777314282477 implements MigrationInterface {
  name = 'Migration1777314282477';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "FOLHA_PAGAMENTO" ADD "NUMERO_DEPENDENTES" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "FOLHA_PAGAMENTO" DROP COLUMN "NUMERO_DEPENDENTES"`,
    );
  }
}
