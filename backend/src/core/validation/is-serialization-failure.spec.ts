import { isSerializationFailure } from './is-serialization-failure.js';

describe('isSerializationFailure', () => {
  it('reconhece somente o SQLSTATE de serialização do driver', () => {
    expect(isSerializationFailure({ driverError: { code: '40001' } })).toBe(
      true,
    );
  });

  it.each([
    undefined,
    null,
    'erro',
    {},
    { driverError: null },
    { driverError: { code: '23505' } },
    { driverError: { code: 40001 } },
    { code: '40001' },
  ])('não reconhece outros formatos: %j', (error) => {
    expect(isSerializationFailure(error)).toBe(false);
  });
});
