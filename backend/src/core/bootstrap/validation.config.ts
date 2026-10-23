import {
  type ArgumentMetadata,
  BadRequestException,
  type INestApplication,
  type ValidationError,
  ValidationPipe,
} from '@nestjs/common';

class ApiValidationPipe extends ValidationPipe {
  override createExceptionFactory(): (
    validationErrors?: ValidationError[],
  ) => BadRequestException {
    return (validationErrors = []) => {
      const message = this.flattenValidationErrors(validationErrors).join('; ');
      return new BadRequestException(message || 'Dados inválidos');
    };
  }

  protected override transformPrimitive(
    value: unknown,
    metadata: ArgumentMetadata,
  ): unknown {
    // O pipe de id precisa da sintaxe original para recusar "01", "1.0" e "1e2".
    if (metadata.type === 'param') return value;
    return super.transformPrimitive(value, metadata);
  }
}

export function createValidationPipe(): ValidationPipe {
  return new ApiValidationPipe({
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
