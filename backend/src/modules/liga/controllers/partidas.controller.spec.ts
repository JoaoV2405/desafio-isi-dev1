import {
  BadRequestException,
  ConflictException,
  type INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import type { Response } from 'express';
import { createRecordedMatch } from '../../../../test/fixtures/partida.fixture.js';
import { createValidationPipe } from '../../../core/bootstrap/validation.config.js';
import { CriarPartidaDto } from '../dto/criar-partida.dto.js';
import { ListarPartidasDto } from '../dto/listar-partidas.dto.js';
import { PartidasService } from '../services/partidas.service.js';
import { PartidasController } from './partidas.controller.js';

describe('PartidasController e OpenAPI sem banco', () => {
  const service = {
    create: vi.fn<PartidasService['create']>(),
    findAll: vi.fn<PartidasService['findAll']>(),
    findById: vi.fn<PartidasService['findById']>(),
  } satisfies Pick<PartidasService, 'create' | 'findAll' | 'findById'>;
  const location = vi.fn<Response['location']>();
  let controller: PartidasController;
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [PartidasController],
      providers: [{ provide: PartidasService, useValue: service }],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    // Inicializa os metadados das rotas sem abrir porta HTTP nem conectar ao banco.
    await app.init();
    controller = app.get(PartidasController);
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    vi.resetAllMocks();
    const partida = Object.assign(createRecordedMatch(), {
      resultado: 'VISITANTE' as const,
    });
    service.create.mockResolvedValue(partida);
    service.findAll.mockResolvedValue([partida]);
    service.findById.mockResolvedValue(partida);
  });

  it('delega a criação com nomes internos e define 201 e Location depois do sucesso', async () => {
    const pipe = createValidationPipe();
    const body: CriarPartidaDto = await pipe.transform(
      { home_club_id: 1, away_club_id: 2, goals: 99, duels: [] },
      { type: 'body', metatype: CriarPartidaDto },
    );
    const result = await controller.create(body, { location });

    expect(service.create).toHaveBeenCalledExactlyOnceWith({
      mandanteId: 1,
      visitanteId: 2,
    });
    expect(location).toHaveBeenCalledExactlyOnceWith('/api/v1/matches/9');
    expect(
      Reflect.getMetadata(
        HTTP_CODE_METADATA,
        Reflect.get(PartidasController.prototype, 'create'),
      ),
    ).toBe(201);
    expect(result).toMatchObject({
      id: 9,
      played_at: '2026-10-20T16:00:49-03:00',
      home: { goals: 1, formation: '2-1-1' },
      away: { goals: 2 },
      result: 'VISITANTE',
    });
    expect(result.duels.map(({ order }) => order)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('converte o filtro depois da validação e devolve array sem duelos', async () => {
    const pipe = createValidationPipe();
    const query: ListarPartidasDto = await pipe.transform(
      { club_id: '2', other: true },
      { type: 'query', metatype: ListarPartidasDto },
    );
    const result = await controller.findAll(query);

    expect(service.findAll).toHaveBeenCalledExactlyOnceWith(2);
    expect(result).toHaveLength(1);
    expect(result[0]).not.toHaveProperty('duels');
    expect(result[0]).not.toHaveProperty('mandanteId');
  });

  it('mantém histórico vazio como array e não inventa filtro', async () => {
    service.findAll.mockResolvedValue([]);
    await expect(controller.findAll({})).resolves.toEqual([]);
    expect(service.findAll).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  it('preserva a ordem dos resumos recebidos do caso de uso', async () => {
    const primeiro = Object.assign(createRecordedMatch(), {
      id: 11,
      resultado: 'VISITANTE' as const,
    });
    const segundo = Object.assign(createRecordedMatch(), {
      id: 9,
      resultado: 'VISITANTE' as const,
    });
    service.findAll.mockResolvedValue([primeiro, segundo]);
    expect((await controller.findAll({})).map(({ id }) => id)).toEqual([11, 9]);
  });

  it('delega o detalhe e devolve os snapshots no contrato externo', async () => {
    const result = await controller.findById(9);
    expect(service.findById).toHaveBeenCalledExactlyOnceWith(9);
    expect(result.duels).toHaveLength(6);
    expect(result.duels[2].attacker).toEqual({
      player_id: 31,
      player_name: 'Davi Lins',
      position: 'LAT',
      condition: 'MAL_CONDICIONADO',
      attribute: 'dribbling',
      value: 63,
    });
  });

  it.each([
    new BadRequestException('Clubes iguais'),
    new NotFoundException('Clube ausente'),
    new ConflictException('Escalação incompleta'),
    new Error('Falha inesperada'),
  ])(
    'preserva erros da criação e não define Location em recusa: %s',
    async (error) => {
      service.create.mockRejectedValue(error);
      await expect(
        controller.create({ home_club_id: 1, away_club_id: 2 }, { location }),
      ).rejects.toBe(error);
      expect(location).not.toHaveBeenCalled();
    },
  );

  it('preserva recusas da listagem e do detalhe para o tratamento central', async () => {
    const error = new NotFoundException('Recurso ausente');
    service.findAll.mockRejectedValue(error);
    service.findById.mockRejectedValue(error);
    await expect(controller.findAll({ club_id: '99' })).rejects.toBe(error);
    await expect(controller.findById(99)).rejects.toBe(error);
  });

  it('documenta métodos, entradas, erros, respostas e Location na tag matches', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().build(),
    );
    const collection = document.paths['/api/v1/matches'];
    const detail = document.paths['/api/v1/matches/{id}'];

    expect(Object.keys(collection?.post?.responses ?? {})).toEqual([
      '201',
      '400',
      '404',
      '409',
    ]);
    expect(Object.keys(collection?.get?.responses ?? {})).toEqual([
      '200',
      '400',
      '404',
    ]);
    expect(Object.keys(detail?.get?.responses ?? {})).toEqual(['200', '404']);
    expect(collection?.post).toMatchObject({
      tags: ['matches'],
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CriarPartidaDto' },
          },
        },
      },
      responses: {
        201: {
          headers: {
            Location: {
              schema: { type: 'string', example: '/api/v1/matches/1' },
            },
          },
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PartidaDetalheResponse' },
            },
          },
        },
      },
    });
    expect(collection?.get).toMatchObject({
      tags: ['matches'],
      parameters: expect.arrayContaining([
        expect.objectContaining({
          name: 'club_id',
          in: 'query',
          required: false,
        }),
      ]),
      responses: {
        200: {
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/PartidaResumoResponse' },
              },
            },
          },
        },
      },
    });
    expect(detail?.get).toMatchObject({
      tags: ['matches'],
      parameters: expect.arrayContaining([
        expect.objectContaining({ name: 'id', in: 'path', required: true }),
      ]),
    });

    const schemas = document.components?.schemas;
    expect(schemas?.CriarPartidaDto).toMatchObject({
      required: ['home_club_id', 'away_club_id'],
    });
    expect(schemas?.PartidaResumoResponse).not.toHaveProperty(
      'properties.duels',
    );
    expect(schemas?.PartidaResumoResponse).toMatchObject({
      properties: {
        played_at: {
          type: 'string',
          format: 'date-time',
          pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}-03:00$',
        },
        result: { enum: ['MANDANTE', 'VISITANTE', 'EMPATE'] },
      },
    });
    expect(schemas?.PartidaDetalheResponse).toMatchObject({
      properties: {
        duels: {
          type: 'array',
          minItems: 6,
          maxItems: 6,
          items: { $ref: '#/components/schemas/DueloPartidaResponse' },
        },
      },
    });
    expect(schemas?.ParticipanteDueloResponse).toMatchObject({
      required: expect.arrayContaining([
        'player_id',
        'player_name',
        'position',
        'condition',
        'attribute',
        'value',
      ]),
      properties: { condition: { enum: ['APTO', 'MAL_CONDICIONADO'] } },
    });
  });
});
