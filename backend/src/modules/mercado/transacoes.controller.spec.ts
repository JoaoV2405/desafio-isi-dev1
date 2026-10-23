import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { MercadoService } from './services/mercado.service.js';
import { TransacoesController } from './transacoes.controller.js';

describe('OpenAPI da exportação de transações', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [TransacoesController],
      providers: [{ provide: MercadoService, useValue: {} }],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('documenta download CSV, filtros e erros JSON na tag transactions', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().build(),
    );
    const operation =
      document.paths['/api/v1/clubs/{id}/transactions/export']?.get;

    expect(operation).toMatchObject({
      tags: ['transactions'],
      parameters: expect.arrayContaining([
        expect.objectContaining({ name: 'id', in: 'path', required: true }),
        expect.objectContaining({ name: 'type', in: 'query', required: false }),
        expect.objectContaining({
          name: 'player_id',
          in: 'query',
          required: false,
        }),
      ]),
      responses: {
        200: {
          content: { 'text/csv': { schema: { type: 'string' } } },
          headers: {
            'Content-Disposition': {
              schema: {
                example: 'attachment; filename="historico-clube-1.csv"',
              },
            },
          },
        },
        400: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErroResponse' },
            },
          },
        },
        404: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErroResponse' },
            },
          },
        },
      },
    });
    expect(Object.keys(operation?.responses ?? {})).toEqual([
      '200',
      '400',
      '404',
    ]);
    expect(operation?.responses['200']).not.toHaveProperty(
      'content.application/json',
    );
    expect(operation?.responses['400']).not.toHaveProperty('content.text/csv');
    expect(operation?.responses['404']).not.toHaveProperty('content.text/csv');
  });
});
