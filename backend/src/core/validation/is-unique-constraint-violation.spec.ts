import { describe, expect, it } from 'vitest';
import { isUniqueConstraintViolation } from './is-unique-constraint-violation.js';

describe('isUniqueConstraintViolation', () => {
  it('reconhece uma violação de unicidade do PostgreSQL', () => {
    expect(
      isUniqueConstraintViolation({
        driverError: { code: '23505', constraint: 'qualquer_constraint' },
      }),
    ).toBe(true);
  });

  it.each([
    undefined,
    null,
    'erro',
    {},
    { driverError: { code: '23503' } },
    { driverError: { code: 23505 } },
  ])('não reconhece outros erros: %s', (error) => {
    expect(isUniqueConstraintViolation(error)).toBe(false);
  });
});
