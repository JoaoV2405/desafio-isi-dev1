import { BadRequestException } from '@nestjs/common';
import {
  normalizarTexto,
  obterCampoObrigatorio,
  validarBooleanoJson,
  validarBooleanoQuery,
  validarDataBrasilia,
  validarDecimalQuery,
  validarEnum,
  validarInteiroJson,
  validarInteiroQuery,
  validarObjetoJson,
  validarString,
} from './validadores-gerais.js';

describe('validadores gerais', () => {
  describe('validarObjetoJson', () => {
    it('aceita somente objetos JSON', () => {
      const objeto = { nome: 'Clube Teste' };

      expect(validarObjetoJson(objeto)).toBe(objeto);
      expect(() => validarObjetoJson(null)).toThrow(BadRequestException);
      expect(() => validarObjetoJson([])).toThrow(BadRequestException);
      expect(() => validarObjetoJson('texto')).toThrow(BadRequestException);
    });
  });

  describe('obterCampoObrigatorio', () => {
    it('distingue campo presente de ausente ou nulo', () => {
      expect(obterCampoObrigatorio({ idade: 0 }, 'idade')).toBe(0);
      expect(() => obterCampoObrigatorio({}, 'idade')).toThrow(
        BadRequestException,
      );
      expect(() => obterCampoObrigatorio({ idade: null }, 'idade')).toThrow(
        BadRequestException,
      );
    });
  });

  it('preserva tipos JSON sem coerção', () => {
    expect(validarString('10', 'campo')).toBe('10');
    expect(validarInteiroJson(50.0, 'campo')).toBe(50);
    expect(validarBooleanoJson(false, 'campo')).toBe(false);
    expect(() => validarString(10, 'campo')).toThrow(BadRequestException);
    expect(() => validarInteiroJson('50', 'campo')).toThrow(
      BadRequestException,
    );
    expect(() => validarInteiroJson(50.5, 'campo')).toThrow(
      BadRequestException,
    );
    expect(() => validarBooleanoJson('false', 'campo')).toThrow(
      BadRequestException,
    );
  });

  it('valida enums sem alterar a caixa', () => {
    const valores = ['APTO', 'DOENTE'] as const;

    expect(validarEnum('APTO', 'condition', valores)).toBe('APTO');
    expect(() => validarEnum('apto', 'condition', valores)).toThrow(
      BadRequestException,
    );
  });

  describe('normalizarTexto', () => {
    it('normaliza somente espaços U+0020', () => {
      expect(normalizarTexto('  Clube   Teste  ', 'name')).toBe('Clube Teste');
      expect(normalizarTexto('   ', 'name')).toBeUndefined();
    });

    it('recusa caracteres de controle', () => {
      expect(() => normalizarTexto('Clube\nTeste', 'name')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('validarInteiroQuery', () => {
    it.each(['1', '50', '9007199254740991'])(
      'aceita o inteiro positivo %s',
      (valor) => {
        expect(validarInteiroQuery(valor, 'page')).toBe(Number(valor));
      },
    );

    it.each(['', '0', '01', '+1', '-1', '1.0', '1e2', '9007199254740992'])(
      'recusa a sintaxe %s',
      (valor) => {
        expect(() => validarInteiroQuery(valor, 'page')).toThrow(
          BadRequestException,
        );
      },
    );
  });

  describe('validarDecimalQuery', () => {
    it.each(['0', '0.1', '0.01', '10', '10.5', '10.55'])(
      'aceita o decimal %s sem perder precisão',
      (valor) => {
        expect(validarDecimalQuery(valor, 'min_value')).toBe(valor);
      },
    );

    it.each(['', '00', '01', '.5', '1.', '1.555', '-1', '+1', '1e2', '1,5'])(
      'recusa a sintaxe %s',
      (valor) => {
        expect(() => validarDecimalQuery(valor, 'min_value')).toThrow(
          BadRequestException,
        );
      },
    );
  });

  it('valida booleanos de query sem coerção', () => {
    expect(validarBooleanoQuery('true', 'free')).toBe(true);
    expect(validarBooleanoQuery('false', 'free')).toBe(false);
    expect(() => validarBooleanoQuery('TRUE', 'free')).toThrow(
      BadRequestException,
    );
    expect(() => validarBooleanoQuery('', 'free')).toThrow(BadRequestException);
  });

  describe('validarDataBrasilia', () => {
    it('converte uma data válida com offset fixo de Brasília', () => {
      const data = validarDataBrasilia(
        '2026-10-14T18:30-03:00',
        'loyalty_until',
      );

      expect(data.toISOString()).toBe('2026-10-14T21:30:00.000Z');
    });

    it.each([
      '2026-02-29T10:00-03:00',
      '2026-13-01T10:00-03:00',
      '2026-01-01T24:00-03:00',
      '2026-01-01T10:60-03:00',
      '2026-01-01T10:00Z',
      '2026-01-01T10:00:00-03:00',
    ])('recusa a data inválida %s', (valor) => {
      expect(() => validarDataBrasilia(valor, 'data')).toThrow(
        BadRequestException,
      );
    });
  });
});
