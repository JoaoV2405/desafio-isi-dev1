import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClubesNormalizedNameConstraint2026101500020
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_clubes_nome_normalizado"
      ON "clubes" (
        LOWER(regexp_replace(BTRIM("nome"), ' +', ' ', 'g'))
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "uq_clubes_nome_normalizado"',
    );
  }
}
