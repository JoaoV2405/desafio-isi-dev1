import { BadRequestException, type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import type { Response } from 'express';
import { createValidationPipe } from '../../core/bootstrap/validation.config.js';
import { ClubesController } from './clubes.controller.js';
import { CriarClubeDto } from './dto/criar-clube.dto.js';
import { ListarClubesDto, OrdenacaoClubes } from './dto/listar-clubes.dto.js';
import { ClubesService } from './services/clubes.service.js';

describe('ClubesController, validação e OpenAPI', () => {
  const service = {
    create: vi.fn<ClubesService['create']>(),
    findAll: vi.fn<ClubesService['findAll']>(),
    findById: vi.fn<ClubesService['findById']>(),
  } satisfies Pick<ClubesService, 'create' | 'findAll' | 'findById'>;
  let app: INestApplication;
  let controller: ClubesController;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ClubesController],
      providers: [{ provide: ClubesService, useValue: service }],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    controller = app.get(ClubesController);
  });
  afterAll(async () => app?.close());
  beforeEach(() => vi.resetAllMocks());

  it.each(Object.values(OrdenacaoClubes))(
    'aceita e encaminha a ordenação %s',
    async (sort) => {
      const query: ListarClubesDto = await createValidationPipe().transform(
        { sort, other: 'ignorado' },
        { type: 'query', metatype: ListarClubesDto },
      );
      service.findAll.mockResolvedValue([]);
      expect(await controller.findAll(query)).toEqual([]);
      expect(service.findAll).toHaveBeenCalledExactlyOnceWith({ sort });
    },
  );

  it.each(['', 'NAME', 'unknown', ['name', 'net_worth_desc']])(
    'recusa sort inválido %j',
    async (sort) => {
      await expect(
        createValidationPipe().transform(
          { sort },
          { type: 'query', metatype: ListarClubesDto },
        ),
      ).rejects.toThrow(BadRequestException);
    },
  );

  it('preserva o Location da criação e devolve os campos mínimos completos', async () => {
    const clube = {
      id: 1,
      name: 'Clube Azul',
      acronym: 'CAZ',
      cash: 300,
      squad_value: 0,
      net_worth: 300,
    };
    service.create.mockResolvedValue(clube);
    const location = vi.fn<Response['location']>();
    expect(
      await controller.create(new CriarClubeDto('Clube Azul', 'CAZ'), {
        location,
      }),
    ).toEqual(clube);
    expect(location).toHaveBeenCalledExactlyOnceWith('/api/v1/clubs/1');
  });

  it('documenta totais, contrato do jogador e sort nos schemas executados', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().build(),
    );
    expect(document.components?.schemas?.ClubeResponse).toMatchObject({
      required: expect.arrayContaining(['cash', 'squad_value', 'net_worth']),
    });
    expect(document.components?.schemas?.ClubeDetailResponse).toMatchObject({
      properties: {
        players: {
          type: 'array',
          items: { $ref: '#/components/schemas/JogadorDoClubeResponse' },
        },
      },
    });
    expect(document.components?.schemas?.JogadorDoClubeResponse).toMatchObject({
      required: expect.arrayContaining(['contract']),
      properties: { contract: expect.objectContaining({}) },
    });
    expect(document.components?.schemas?.ContratoElencoResponse).toMatchObject({
      required: expect.arrayContaining([
        'purchase_value',
        'loyalty_until',
        'remaining_days',
        'penalty_rate',
      ]),
    });
    expect(document.paths['/api/v1/clubs']?.get?.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'sort',
          in: 'query',
          schema: expect.objectContaining({
            enum: Object.values(OrdenacaoClubes),
          }),
        }),
      ]),
    );
    expect(
      document.paths['/api/v1/clubs/{id}']?.get?.responses['200'],
    ).toMatchObject({
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ClubeDetailResponse' },
        },
      },
    });
  });
});
