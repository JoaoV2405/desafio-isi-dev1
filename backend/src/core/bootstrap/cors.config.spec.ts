import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppController } from '../../app.controller.js';
import { configureCors } from './cors.config.js';

describe('CORS da API', () => {
  let app: INestApplication<App> | undefined;

  beforeEach(() => {
    vi.stubEnv('FRONTEND_DOMAIN', undefined);
    vi.stubEnv('SERVER_URL', 'http://localhost:3003');
  });

  afterEach(async () => {
    await app?.close();
    app = undefined;
    vi.unstubAllEnvs();
  });

  async function initialize(): Promise<App> {
    const module = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();
    app = module.createNestApplication();
    app.useLogger(false);
    configureCors(app);
    await app.init();
    return app.getHttpServer();
  }

  it('permite a origem padrão do frontend', async () => {
    const server = await initialize();
    await request(server)
      .get('/')
      .set('Origin', 'http://localhost:5173')
      .expect(200)
      .expect('Access-Control-Allow-Origin', 'http://localhost:5173')
      .expect('Vary', 'Origin');
  });

  it('lê FRONTEND_DOMAIN ao configurar a aplicação e permite só essa origem', async () => {
    vi.stubEnv('FRONTEND_DOMAIN', 'https://frontend.example.test');
    const server = await initialize();
    await request(server)
      .get('/')
      .set('Origin', 'https://frontend.example.test')
      .expect(200)
      .expect('Access-Control-Allow-Origin', 'https://frontend.example.test');
    const response = await request(server)
      .get('/')
      .set('Origin', 'http://localhost:5173')
      .expect(200);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it.each([
    'http://localhost:3003',
    'https://outra-origem.example.test',
    'http://localhost:5173.example.test',
    'null',
  ])(
    'não autoriza %s nem transforma a recusa CORS em erro 500',
    async (origin) => {
      const server = await initialize();
      const response = await request(server)
        .get('/')
        .set('Origin', origin)
        .expect(200);
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    },
  );

  it('responde ao preflight da origem configurada com método e cabeçalhos permitidos', async () => {
    vi.stubEnv('FRONTEND_DOMAIN', 'http://localhost:4173');
    const server = await initialize();
    const response = await request(server)
      .options('/')
      .set('Origin', 'http://localhost:4173')
      .set('Access-Control-Request-Method', 'PATCH')
      .set('Access-Control-Request-Headers', 'content-type,accept')
      .expect(204)
      .expect('Access-Control-Allow-Origin', 'http://localhost:4173');
    expect(response.headers['access-control-allow-methods']).toContain('PATCH');
    expect(response.headers['access-control-allow-headers']).toContain(
      'Content-Type',
    );
  });

  it('não autoriza preflight de outra origem', async () => {
    const server = await initialize();
    const response = await request(server)
      .options('/')
      .set('Origin', 'https://outra-origem.example.test')
      .set('Access-Control-Request-Method', 'POST');
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('preserva chamadas sem Origin, como curl e comunicação entre servidores', async () => {
    const server = await initialize();
    await request(server).get('/').expect(200);
  });

  it('permite ao frontend ler erros da API e o cabeçalho de download CSV', async () => {
    const server = await initialize();
    await request(server)
      .get('/inexistente')
      .set('Origin', 'http://localhost:5173')
      .expect(404)
      .expect('Access-Control-Allow-Origin', 'http://localhost:5173')
      .expect('Access-Control-Expose-Headers', 'Content-Disposition');
  });
});
