import { formatarDataBrasilia } from './formatar-data-brasilia.js';

describe('formatarDataBrasilia', () => {
  it.each([
    ['2027-03-02T13:15:49.987Z', '2027-03-02T10:15:49-03:00'],
    ['2027-01-01T01:00:00Z', '2026-12-31T22:00:00-03:00'],
    ['2028-03-01T01:00:00Z', '2028-02-29T22:00:00-03:00'],
    ['2026-12-20T15:00:00Z', '2026-12-20T12:00:00-03:00'],
  ])(
    'serializa %s com offset fixo e sem alterar o instante',
    (utc, esperado) => {
      const instante = new Date(utc);
      const timestamp = instante.getTime();
      expect(formatarDataBrasilia(instante)).toBe(esperado);
      expect(instante.getTime()).toBe(timestamp);
    },
  );
});
