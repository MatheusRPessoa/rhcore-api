import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1777376312339 implements MigrationInterface {
  name = 'Migration1777376312339';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "FOLHA_PAGAMENTO" ADD "DESCONTO_VT" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "FOLHA_PAGAMENTO" DROP COLUMN "DESCONTO_VT"`,
    );
  }
}
