import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { configureGlobalValidation } from './core/bootstrap/validation.config.js';
import { configureCors } from './core/bootstrap/cors.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  configureGlobalValidation(app);
  configureCors(app);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Passe API')
    .setDescription(
      'Documentação da API de mercado de jogadores de uma liga de futebol',
    )
    .setVersion('1.0')

    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, documentFactory, {
    customSiteTitle: 'Passe Docs',
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
