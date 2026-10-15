import { BadRequestException } from '@nestjs/common';

export type ObjetoJson = Record<string, unknown>;
//dividir validadores
const FORMATO_INTEIRO_QUERY = /^[1-9]\d*$/;
const FORMATO_DECIMAL_QUERY = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;
const FORMATO_DATA_BRASILIA = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})-03:00$/;
const CARACTERE_DE_CONTROLE = /\p{Cc}/u;

function entradaInvalida(campo: string, motivo: string): BadRequestException {
  return new BadRequestException(`O campo ${campo} ${motivo}`);
}

export function validarObjetoJson(valor: unknown): ObjetoJson {
  if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) {
    throw new BadRequestException('O corpo deve ser um objeto JSON');
  }

  return valor as ObjetoJson;
}

export function obterCampoObrigatorio(
  objeto: ObjetoJson,
  campo: string,
): unknown {
  if (!Object.hasOwn(objeto, campo) || objeto[campo] == null) {
    throw entradaInvalida(campo, 'é obrigatório');
  }

  return objeto[campo];
}

export function validarString(valor: unknown, campo: string): string {
  if (typeof valor !== 'string') {
    throw entradaInvalida(campo, 'deve ser uma string');
  }

  return valor;
}

export function validarInteiroJson(valor: unknown, campo: string): number {
  if (typeof valor !== 'number' || !Number.isInteger(valor)) {
    throw entradaInvalida(campo, 'deve ser um número inteiro');
  }

  return valor;
}

export function validarBooleanoJson(valor: unknown, campo: string): boolean {
  if (typeof valor !== 'boolean') {
    throw entradaInvalida(campo, 'deve ser um booleano');
  }

  return valor;
}

export function contarCaracteres(valor: string): number {
  return Array.from(valor).length;
}

export function validarEnum<T extends string>(
  valor: unknown,
  campo: string,
  valoresPermitidos: readonly T[],
): T {
  if (typeof valor !== 'string' || !valoresPermitidos.includes(valor as T)) {
    throw entradaInvalida(campo, 'possui um valor inválido');
  }

  return valor as T;
}

export function normalizarTexto(
  valor: unknown,
  campo: string,
): string | undefined {
  const texto = validarString(valor, campo);

  if (CARACTERE_DE_CONTROLE.test(texto)) {
    throw entradaInvalida(campo, 'não pode conter caracteres de controle');
  }

  const textoNormalizado = texto.replace(/ +/g, ' ').replace(/^ +| +$/g, '');

  return textoNormalizado || undefined;
}

export function validarInteiroQuery(valor: unknown, campo: string): number {
  if (typeof valor !== 'string' || !FORMATO_INTEIRO_QUERY.test(valor)) {
    throw entradaInvalida(campo, 'deve ser um inteiro positivo válido');
  }

  const inteiro = Number(valor);

  if (!Number.isSafeInteger(inteiro)) {
    throw entradaInvalida(campo, 'deve ser um inteiro positivo válido');
  }

  return inteiro;
}

export function validarDecimalQuery(valor: unknown, campo: string): string {
  if (typeof valor !== 'string' || !FORMATO_DECIMAL_QUERY.test(valor)) {
    throw entradaInvalida(
      campo,
      'deve ser um decimal não negativo com até duas casas',
    );
  }

  return valor;
}

export function validarBooleanoQuery(valor: unknown, campo: string): boolean {
  if (valor === 'true') {
    return true;
  }

  if (valor === 'false') {
    return false;
  }

  throw entradaInvalida(campo, 'deve ser true ou false');
}

export function validarDataBrasilia(valor: unknown, campo: string): Date {
  if (typeof valor !== 'string') {
    throw entradaInvalida(campo, 'deve ser uma data válida');
  }

  const partes = FORMATO_DATA_BRASILIA.exec(valor);

  if (!partes) {
    throw entradaInvalida(
      campo,
      'deve seguir o formato AAAA-MM-DDTHH:MM-03:00',
    );
  }

  const [, anoTexto, mesTexto, diaTexto, horaTexto, minutoTexto] = partes;
  const ano = Number(anoTexto);
  const mes = Number(mesTexto);
  const dia = Number(diaTexto);
  const hora = Number(horaTexto);
  const minuto = Number(minutoTexto);

  if (
    ano === 0 ||
    mes < 1 ||
    mes > 12 ||
    dia < 1 ||
    dia > quantidadeDeDiasNoMes(ano, mes) ||
    hora > 23 ||
    minuto > 59
  ) {
    throw entradaInvalida(campo, 'deve ser uma data válida');
  }

  const data = new Date(0);
  data.setUTCFullYear(ano, mes - 1, dia);
  data.setUTCHours(hora + 3, minuto, 0, 0);

  return data;
}

function quantidadeDeDiasNoMes(ano: number, mes: number): number {
  const diasPorMes = [
    31,
    anoBissexto(ano) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return diasPorMes[mes - 1];
}

function anoBissexto(ano: number): boolean {
  return ano % 400 === 0 || (ano % 4 === 0 && ano % 100 !== 0);
}
