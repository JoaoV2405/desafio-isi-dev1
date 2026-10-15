import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEscalacoes2026101500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "escalacoes" (
        "clube_id" INTEGER NOT NULL,
        "jogador_id" INTEGER NOT NULL,
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "pk_escalacoes" PRIMARY KEY ("clube_id", "jogador_id"),
        CONSTRAINT "uq_escalacoes_jogador_id" UNIQUE ("jogador_id"),
        CONSTRAINT "fk_escalacoes_clube"
          FOREIGN KEY ("clube_id") REFERENCES "clubes" ("id")
          ON UPDATE RESTRICT ON DELETE CASCADE,
        CONSTRAINT "fk_escalacoes_jogador"
          FOREIGN KEY ("jogador_id") REFERENCES "jogadores" ("id")
          ON UPDATE RESTRICT ON DELETE RESTRICT
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "escalacoes"');
  }
}
