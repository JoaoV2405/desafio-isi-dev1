export const ORDENACOES_JOGADORES = [
  'name',
  'value_asc',
  'value_desc',
  'age_asc',
  'age_desc',
  'position',
] as const;

export type OrdenacaoJogadores = (typeof ORDENACOES_JOGADORES)[number];
