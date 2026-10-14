import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJogadoresBusinessConstraints2026101400010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "jogadores"
      ADD CONSTRAINT "ck_jogadores_soma_atributos"
      CHECK (
        "velocidade" + "finalizacao" + "passe" + "drible" +
        "defesa" + "fisico" <= 480
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "jogadores"
      ADD CONSTRAINT "ck_jogadores_potencial_atributos"
      CHECK (
        "potencial" >= GREATEST(
          "velocidade",
          "finalizacao",
          "passe",
          "drible",
          "defesa",
          "fisico"
        )
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "jogadores"
      ADD CONSTRAINT "ck_jogadores_agilidade_idade"
      CHECK ("idade" < 35 OR "agilidade" <= 85)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "jogadores"
      DROP CONSTRAINT "ck_jogadores_agilidade_idade"
    `);

    await queryRunner.query(`
      ALTER TABLE "jogadores"
      DROP CONSTRAINT "ck_jogadores_potencial_atributos"
    `);

    await queryRunner.query(`
      ALTER TABLE "jogadores"
      DROP CONSTRAINT "ck_jogadores_soma_atributos"
    `);
  }
}
