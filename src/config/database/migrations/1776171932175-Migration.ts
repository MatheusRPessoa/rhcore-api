import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1776171932175 implements MigrationInterface {
  name = 'Migration1776171932175';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "USUARIOS" ADD "RESET_PASSWORD" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "USUARIOS" ADD "RESET_PASSWORD_EXPIRES" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "USUARIOS" DROP COLUMN "RESET_PASSWORD_EXPIRES"`,
    );
    await queryRunner.query(
      `ALTER TABLE "USUARIOS" DROP COLUMN "RESET_PASSWORD"`,
    );
  }
}
