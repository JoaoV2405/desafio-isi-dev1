import { registerDecorator, type ValidationOptions } from 'class-validator';

type FaixaNumerica = {
  min: number;
  max: number;
};

const FORMATO_INTEIRO_QUERY = /^[1-9]\d*$/;
const FORMATO_DECIMAL_QUERY = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;

export function IsIntegerQuery(
  faixa: FaixaNumerica,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    registerDecorator({
      name: 'isIntegerQuery',
      target: target.constructor,
      propertyName: String(propertyKey),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string' || !FORMATO_INTEIRO_QUERY.test(value)) {
            return false;
          }

          const number = Number(value);

          return (
            Number.isSafeInteger(number) &&
            number >= faixa.min &&
            number <= faixa.max
          );
        },
        defaultMessage(): string {
          return `$property deve ser um inteiro entre ${faixa.min} e ${faixa.max}`;
        },
      },
    });
  };
}

export function IsDecimalQuery(
  faixa: FaixaNumerica,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    registerDecorator({
      name: 'isDecimalQuery',
      target: target.constructor,
      propertyName: String(propertyKey),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string' || !FORMATO_DECIMAL_QUERY.test(value)) {
            return false;
          }

          const number = Number(value);

          return number >= faixa.min && number <= faixa.max;
        },
        defaultMessage(): string {
          return `$property deve ser um decimal entre ${faixa.min} e ${faixa.max} com até duas casas`;
        },
      },
    });
  };
}
