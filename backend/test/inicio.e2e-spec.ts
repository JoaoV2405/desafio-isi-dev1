import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { CreateClubesAndJogadores2026101400000 } from '../src/infrastructure/db/migrations/2026101400000-create-clubes-and-jogadores.js';
import { AddJogadoresBusinessConstraints2026101400010 } from '../src/infrastructure/db/migrations/2026101400010-add-jogadores-business-constraints.js';
import { CreateEscalacoes2026101500000 } from '../src/infrastructure/db/migrations/2026101500000-create-escalacoes.js';
import { CreateContratos2026101500005 } from '../src/infrastructure/db/migrations/2026101500005-create-contratos.js';
import { CreateTransacoes2026101500010 } from '../src/infrastructure/db/migrations/2026101500010-create-transacoes.js';
import { AddClubesNormalizedNameConstraint2026101500020 } from '../src/infrastructure/db/migrations/2026101500020-add-clubes-normalized-name-constraint.js';
import { CreatePartidasTable2026101900000 } from '../src/infrastructure/db/migrations/2026101900000-create-partidas-table.js';
import { CreateDueloPartidasTable2026101900010 } from '../src/infrastructure/db/migrations/2026101900010-create-duelo-partidas-table.js';
import {
  Clube,
  FormacaoClube,
} from '../src/modules/clubes/entities/clube.entity.js';
import { InicioModule } from '../src/modules/inicio/inicio.module.js';
import { Jogador } from '../src/modules/jogadores/entities/jogador.entity.js';
import { DueloPartida } from '../src/modules/liga/entities/duelo-partida.entity.js';
import { Escalacao } from '../src/modules/liga/entities/escalacao.entity.js';
import { Partida } from '../src/modules/liga/entities/partida.entity.js';
import { Contrato } from '../src/modules/mercado/entities/contrato.entity.js';
import { Transacao } from '../src/modules/mercado/entities/transacao.entity.js';
import { createPlayer } from './fixtures/partida.fixture.js';

describe.runIf(process.env.RUN_DATABASE_TESTS === 'true')(
  'Resumo da tela inicial HTTP/PostgreSQL',
  () => {
    const schema = `test_inicio_${randomUUID().replaceAll('-', '')}`;
    const route = '/api/v1/dashboard';
    let admin: DataSource;
    let database: DataSource;
    let app: INestApplication<App>;

    beforeAll(async () => {
      if (existsSync('.env')) process.loadEnvFile('.env');
      const options = {
        type: 'postgres' as const,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      };
      admin = await new DataSource(options).initialize();
      await admin.query(`CREATE SCHEMA "${schema}"`);
      database = await new DataSource({
        ...options,
        schema,
        extra: { options: `-c search_path=${schema}` },
        entities: [
          Clube,
          Jogador,
          Escalacao,
          Partida,
          DueloPartida,
          Contrato,
          Transacao,
        ],
        migrations: [
          CreateClubesAndJogadores2026101400000,
          AddJogadoresBusinessConstraints2026101400010,
          CreateEscalacoes2026101500000,
          CreateContratos2026101500005,
          CreateTransacoes2026101500010,
          AddClubesNormalizedNameConstraint2026101500020,
          CreatePartidasTable2026101900000,
          CreateDueloPartidasTable2026101900010,
        ],
      }).initialize();
      await database.runMigrations();
      const module = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRootAsync({
            useFactory: () => database.options,
            dataSourceFactory: async () => database,
          }),
          InicioModule,
        ],
      }).compile();
      app = module.createNestApplication();
      app.setGlobalPrefix('api/v1');
      await app.init();
    });

    afterAll(async () => {
      if (app) await app.close();
      if (database?.isInitialized) await database.destroy();
      if (admin?.isInitialized) {
        await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
        await admin.destroy();
      }
    });

    beforeEach(async () => {
      await database.query(
        `TRUNCATE TABLE "${schema}"."clubes" RESTART IDENTITY CASCADE`,
      );
    });

    it('retorna contagens zeradas e líder null com banco vazio', async () => {
      const response = await request(app.getHttpServer())
        .get(route)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      expect(response.body).toEqual({
        total_players: 0,
        total_free_players: 0,
        total_clubs: 0,
        total_matches: 0,
        leader: null,
      });
    });

    it('exclui jogadores removidos e retorna o líder da classificação e os totais atualizados', async () => {
      await database.getRepository(Clube).save([
        { nome: 'Águias FC', sigla: 'AGF' },
        { nome: 'Delta FC', sigla: 'DEF' },
      ]);
      const players = database.getRepository(Jogador);
      await players.save([
        createPlayer({ id: 1, clubeId: null }),
        createPlayer({ id: 2, clubeId: 1 }),
        createPlayer({ id: 3, clubeId: null }),
        createPlayer({ id: 4, clubeId: 2 }),
      ]);
      await players.softDelete([3, 4]);
      const partida = {
        mandanteId: 1,
        visitanteId: 2,
        golsMandante: 1,
        golsVisitante: 2,
        formacaoMandante: FormacaoClube.DoisDois,
        formacaoVisitante: FormacaoClube.DoisDois,
      };
      await database
        .getRepository(Partida)
        .save([{ ...partida }, { ...partida }]);
      const response = await request(app.getHttpServer())
        .get(route)
        .expect(200);
      expect(response.body).toEqual({
        total_players: 2,
        total_free_players: 1,
        total_clubs: 2,
        total_matches: 2,
        leader: 'Delta FC',
      });
      await players.update(2, { clubeId: null });
      const updated = await request(app.getHttpServer()).get(route).expect(200);
      expect(updated.body).toMatchObject({
        total_players: 2,
        total_free_players: 2,
      });
    });

    it('usa o primeiro clube da classificação mesmo antes de haver partidas', async () => {
      await database.getRepository(Clube).save([
        { nome: 'Gama SC', sigla: 'GSC' },
        { nome: 'Águias FC', sigla: 'AGF' },
      ]);
      const response = await request(app.getHttpServer())
        .get(route)
        .expect(200);
      expect(response.body).toMatchObject({
        total_players: 0,
        total_free_players: 0,
        total_clubs: 2,
        total_matches: 0,
        leader: 'Águias FC',
      });
    });

    it('documenta resposta e líder nullable na tag dashboard sem parâmetros', () => {
      const document = SwaggerModule.createDocument(
        app,
        new DocumentBuilder().build(),
      );
      const operation = document.paths[route]?.get;
      expect(operation?.tags).toEqual(['dashboard']);
      expect(operation?.parameters ?? []).toEqual([]);
      expect(operation?.responses['200']).toMatchObject({
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ResumoInicioResponse' },
          },
        },
      });
      expect(document.components?.schemas?.ResumoInicioResponse).toMatchObject({
        required: [
          'total_players',
          'total_free_players',
          'total_clubs',
          'total_matches',
          'leader',
        ],
        properties: {
          total_players: { type: 'integer', minimum: 0 },
          leader: { type: 'string', nullable: true },
        },
      });
    });
  },
);
