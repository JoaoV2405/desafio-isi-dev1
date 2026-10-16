import { INestApplication } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const ALLOWED_ORIGINS = [process.env.SERVER_URL || 'http://localhost:3003', process.env.FRONTEND_DOMAIN || 'http://localhost:5173'];

export function getCorsConfig(): CorsOptions {
  return {
    // Restringe às origens conhecidas — evita que qualquer domínio faça requests
    // autenticadas com cookies sameSite:none em nome do usuário (CSRF)
    origin: (origin, callback) => {
      // Permite requests sem origin (ex: curl, Postman, server-to-server)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    // Expõe o Content-Disposition ao JS (cross-origin) para o front ler o nome do arquivo nos downloads
    // autenticados (fetch + blob). Sem isso, `response.headers.get('content-disposition')` é null no browser.
    exposedHeaders: ['Content-Disposition'],
  };
}

export function configureCors(app: INestApplication): void {
  app.enableCors(getCorsConfig());
}
