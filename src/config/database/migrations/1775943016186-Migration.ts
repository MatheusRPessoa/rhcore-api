import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1775943016186 implements MigrationInterface {
  name = 'Migration1775943016186';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."USUARIOS_role_enum" AS ENUM('ADMIN', 'MANAGER', 'EMPLOYEE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "USUARIOS" ADD "ROLE" "public"."USUARIOS_role_enum" NOT NULL DEFAULT 'EMPLOYEE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "USUARIOS" DROP COLUMN "ROLE"`);
    await queryRunner.query(`DROP TYPE "public"."USUARIOS_role_enum"`);
  }
}
