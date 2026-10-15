import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { validateClubCreation } from './clube.validators.js';

describe('validateClubCreation', () => {
  it('normaliza o nome e valida a sigla pela ordem em que aparece', () => {
    const club = validateClubCreation({
      name: '  Águias   Futebol Clube  ',
      acronym: 'AFC',
    });

    expect(club.name).toBe('Águias Futebol Clube');
    expect(club.acronym).toBe('AFC');
  });

  it.each([null, [], 'texto', 10, true])(
    'recusa corpo que não seja objeto: %s',
    (body) => {
      expect(() => validateClubCreation(body)).toThrow(BadRequestException);
    },
  );

  it.each([
    [{ name: '', acronym: 'AFC' }, 'nome vazio'],
    [{ name: 'Clube', acronym: 'CLU' }, 'nome com uma palavra'],
    [{ name: 'Clube 10', acronym: 'CLU' }, 'nome com dígito'],
    [{ name: 'Clube Teste', acronym: 'CT' }, 'sigla curta'],
    [{ name: 'Clube Teste', acronym: 'ctE' }, 'sigla minúscula'],
    [{ name: 'Clube Teste', acronym: 'CCC' }, 'letras iguais'],
    [{ name: 'Clube Teste', acronym: 'TCE' }, 'primeira letra divergente'],
    [{ name: 'Clube Teste', acronym: 'CAX' }, 'letra ausente no nome'],
    [{ name: 'Clube Teste', acronym: 'CTL' }, 'letras fora de ordem'],
  ])('recusa entrada inválida: %s (%s)', (input) => {
    expect(() => validateClubCreation(input)).toThrow(BadRequestException);
  });
});
