export function formatarDataBrasilia(instante: Date): string {
  const horarioBrasilia = new Date(instante.getTime() - 3 * 60 * 60 * 1_000);
  const preencher = (valor: number): string => String(valor).padStart(2, '0');
  const ano = horarioBrasilia.getUTCFullYear();
  const mes = preencher(horarioBrasilia.getUTCMonth() + 1);
  const dia = preencher(horarioBrasilia.getUTCDate());
  const hora = preencher(horarioBrasilia.getUTCHours());
  const minuto = preencher(horarioBrasilia.getUTCMinutes());
  const segundo = preencher(horarioBrasilia.getUTCSeconds());

  return `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}-03:00`;
}
