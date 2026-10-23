import type { INestApplication } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface.js';

export function getCorsConfig(): CorsOptions {
  const frontendOrigin = process.env.FRONTEND_DOMAIN || 'http://localhost:5173';

  return {
    origin: (origin, callback) => {
      callback(null, !origin || origin === frontendOrigin);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    // Permite ao frontend ler o nome do arquivo nas respostas de download CSV.
    exposedHeaders: ['Content-Disposition'],
  };
}

export function configureCors(app: INestApplication): void {
  app.enableCors(getCorsConfig());
}
