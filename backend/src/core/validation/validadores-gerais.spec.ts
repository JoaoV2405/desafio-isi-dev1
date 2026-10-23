import { BadRequestException } from '@nestjs/common';
import {
  normalizarTexto,
  obterCampoObrigatorio,
  validarDataBrasilia,
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

  it('preserva strings sem coerção', () => {
    expect(validarString('10', 'campo')).toBe('10');
    expect(() => validarString(10, 'campo')).toThrow(BadRequestException);
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
