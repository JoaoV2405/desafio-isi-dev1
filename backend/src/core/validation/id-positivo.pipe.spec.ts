import { NotFoundException } from '@nestjs/common';
import { createValidationPipe } from '../bootstrap/validation.config.js';
import { IdPositivoPipe } from './id-positivo.pipe.js';

describe('IdPositivoPipe', () => {
  const pipe = new IdPositivoPipe();

  it.each([
    ['1', 1],
    ['2147483647', 2_147_483_647],
  ])('converte o id válido %s', (value, expected) => {
    expect(pipe.transform(value)).toBe(expected);
  });

  it.each(['', '0', '01', '-1', '+1', '1.0', '1e2', '2147483648'])(
    'trata o id inválido %s como recurso inexistente',
    (value) => {
      expect(() => pipe.transform(value)).toThrow(NotFoundException);
    },
  );

  it.each(['01', '+1', '1.0', '1e2'])(
    'preserva %s até a validação de id mesmo com o pipe global',
    async (value) => {
      const parsed = await createValidationPipe().transform(value, {
        type: 'param',
        metatype: Number,
        data: 'id',
      });
      expect(parsed).toBe(value);
      expect(() => pipe.transform(parsed)).toThrow(NotFoundException);
    },
  );
});
