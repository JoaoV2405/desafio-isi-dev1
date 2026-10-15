import { BadRequestException } from '@nestjs/common';
import {
  contarCaracteres,
  normalizarTexto,
  obterCampoObrigatorio,
  type ObjetoJson,
  validarObjetoJson,
  validarString,
} from '../../../core/validation/validadores-gerais.js';
import { CriarClubeDto } from '../dto/criar-clube.dto.js';

const FORMATO_NOME_CLUBE = /^[\p{L} .-]+$/u;
const FORMATO_SIGLA = /^[A-Z]{3}$/;

export function validateClubCreation(value: unknown): CriarClubeDto {
  const body = validarObjetoJson(value);
  const name = validateClubName(body);
  const acronym = validateClubAcronym(body, name);

  return new CriarClubeDto(name, acronym);
}

function validateClubName(body: ObjetoJson): string {
  const name = normalizarTexto(obterCampoObrigatorio(body, 'name'), 'name');

  if (!name) {
    throw new BadRequestException('O campo name é obrigatório');
  }

  const characterCount = contarCaracteres(name);
  const wordCount = name.split(' ').length;

  if (
    characterCount < 3 ||
    characterCount > 60 ||
    wordCount < 2 ||
    wordCount > 5 ||
    !FORMATO_NOME_CLUBE.test(name)
  ) {
    throw new BadRequestException('O campo name possui um valor inválido');
  }

  return name;
}

function validateClubAcronym(body: ObjetoJson, name: string): string {
  const acronym = validarString(
    obterCampoObrigatorio(body, 'acronym'),
    'acronym',
  );

  if (!FORMATO_SIGLA.test(acronym) || new Set(acronym).size === 1) {
    throw new BadRequestException('O campo acronym possui um valor inválido');
  }

  const comparableName = name
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toUpperCase();
  const firstLetter = comparableName.match(/\p{L}/u)?.[0];

  if (
    firstLetter !== acronym[0] ||
    !lettersAppearInOrder(acronym, comparableName)
  ) {
    throw new BadRequestException('O campo acronym não corresponde ao name');
  }

  return acronym;
}

function lettersAppearInOrder(acronym: string, name: string): boolean {
  let searchFrom = 0;

  for (const letter of acronym) {
    const letterPosition = name.indexOf(letter, searchFrom);

    if (letterPosition === -1) {
      return false;
    }

    searchFrom = letterPosition + 1;
  }

  return true;
}
