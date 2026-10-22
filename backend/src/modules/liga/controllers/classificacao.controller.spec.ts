import { ClassificacaoController } from './classificacao.controller.js';
import { ClassificacaoQuery } from '../services/classificacao.query.js';
import { ClassificacaoService } from '../services/classificacao.service.js';

describe('Classificação RN21', () => {
  it('ordena por pontos e inclui posição, saldo e o contrato HTTP', async () => {
    const query = {
      getStandings: vi
        .fn<ClassificacaoQuery['getStandings']>()
        .mockResolvedValue([
          {
            clubeId: 1,
            nomeClube: 'Águias FC',
            jogos: 1,
            vitorias: 0,
            empates: 0,
            derrotas: 1,
            golsMarcados: 1,
            golsSofridos: 2,
          },
          {
            clubeId: 2,
            nomeClube: 'Delta FC',
            jogos: 1,
            vitorias: 1,
            empates: 0,
            derrotas: 0,
            golsMarcados: 2,
            golsSofridos: 1,
          },
        ]),
    };
    const controller = new ClassificacaoController(
      new ClassificacaoService(query),
    );
    expect(await controller.findAll()).toEqual([
      {
        position: 1,
        club_id: 2,
        club_name: 'Delta FC',
        played: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goals_for: 2,
        goals_against: 1,
        goal_difference: 1,
        points: 3,
      },
      {
        position: 2,
        club_id: 1,
        club_name: 'Águias FC',
        played: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goals_for: 1,
        goals_against: 2,
        goal_difference: -1,
        points: 0,
      },
    ]);
  });
});
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';

describe('Contrato e OpenAPI da classificação', () => {
  const query = { getStandings: vi.fn<ClassificacaoQuery['getStandings']>() };
  let app: INestApplication;
  let controller: ClassificacaoController;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ClassificacaoController],
      providers: [
        ClassificacaoService,
        { provide: ClassificacaoQuery, useValue: query },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    controller = app.get(ClassificacaoController);
  });

  afterAll(async () => {
    await app?.close();
  });
  beforeEach(() => {
    query.getStandings.mockReset();
  });

  it('devolve array vazio sem lançar 404', async () => {
    query.getStandings.mockResolvedValue([]);
    await expect(controller.findAll()).resolves.toEqual([]);
  });

  it('preserva falhas inesperadas para o tratamento global', async () => {
    const failure = new Error('Falha de persistência');
    query.getStandings.mockRejectedValue(failure);
    await expect(controller.findAll()).rejects.toBe(failure);
  });

  it('documenta array com os onze campos, sem body ou filtros, na tag standings', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().build(),
    );
    const operation = document.paths['/api/v1/standings']?.get;
    expect(operation?.tags).toEqual(['standings']);
    expect(operation?.parameters ?? []).toEqual([]);
    expect(operation?.requestBody).toBeUndefined();
    expect(Object.keys(operation?.responses ?? {})).toEqual(['200']);
    expect(operation?.responses['200']).toMatchObject({
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/ClassificacaoResponse' },
          },
        },
      },
    });
    expect(document.components?.schemas?.ClassificacaoResponse).toMatchObject({
      required: [
        'position',
        'club_id',
        'club_name',
        'played',
        'wins',
        'draws',
        'losses',
        'goals_for',
        'goals_against',
        'goal_difference',
        'points',
      ],
      properties: {
        position: { type: 'integer', minimum: 1 },
        club_name: { type: 'string' },
        points: { type: 'integer', minimum: 0 },
        goal_difference: { type: 'integer' },
      },
    });
    expect(
      document.components?.schemas?.ClassificacaoResponse,
    ).not.toMatchObject({
      properties: { goal_difference: { minimum: 0 } },
    });
  });
});
