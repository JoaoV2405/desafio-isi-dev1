import { type INestApplication, ValidationPipe } from '@nestjs/common';

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    forbidNonWhitelisted: false,
    forbidUnknownValues: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: false,
    },
    validationError: {
      target: false,
      value: false,
    },
    whitelist: true,
  });
}

export function configureGlobalValidation(app: INestApplication): void {
  app.useGlobalPipes(createValidationPipe());
}
