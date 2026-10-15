import { NotFoundException } from '@nestjs/common';
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
});
