import { registerDecorator, type ValidationOptions } from 'class-validator';
import {
  ORDENACOES_JOGADORES,
  type OrdenacaoJogadores,
} from './ordenacao-jogadores.js';

const DIGITO = /[0-9]/u;
const LETRA = /\p{L}/u;
const CARACTERE_DE_CONTROLE = /\p{Cc}/u;

export function IsNomeJogador(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    registerDecorator({
      name: 'isNomeJogador',
      target: target.constructor,
      propertyName: String(propertyKey),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }

          const words = value.split(' ');

          return (
            Array.from(value).length >= 3 &&
            Array.from(value).length <= 100 &&
            words.length >= 2 &&
            words.every((word) => LETRA.test(word)) &&
            !DIGITO.test(value) &&
            !CARACTERE_DE_CONTROLE.test(value)
          );
        },
        defaultMessage(): string {
          return '$property deve ter de 3 a 100 caracteres, ao menos duas palavras e nenhum dígito';
        },
      },
    });
  };
}

export function IsOrdenacaoJogadores(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    registerDecorator({
      name: 'isOrdenacaoJogadores',
      target: target.constructor,
      propertyName: String(propertyKey),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }

          const sorts = value.split(',');

          if (
            sorts.length > 2 ||
            sorts.some(
              (sort) =>
                !ORDENACOES_JOGADORES.includes(sort as OrdenacaoJogadores),
            )
          ) {
            return false;
          }

          const fields = sorts.map((sort) => {
            if (sort.startsWith('value_')) {
              return 'value';
            }

            return sort.startsWith('age_') ? 'age' : sort;
          });

          return new Set(fields).size === fields.length;
        },
        defaultMessage(): string {
          return '$property deve conter até dois critérios válidos sem repetir o mesmo campo';
        },
      },
    });
  };
}
