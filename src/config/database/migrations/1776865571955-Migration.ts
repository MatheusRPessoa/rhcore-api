import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1776865571955 implements MigrationInterface {
  name = 'Migration1776865571955';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "USUARIOS" ADD "PERMISSIONS" json NOT NULL DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "USUARIOS" DROP COLUMN "PERMISSIONS"`);
  }
}
