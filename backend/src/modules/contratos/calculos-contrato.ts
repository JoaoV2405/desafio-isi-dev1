export type TermosFidelidade = {
  remainingDays: number;
  penaltyRate: number;
};

export function calculateLoyaltyTerms(
  fidelidadeAte: Date,
  instante: Date,
): TermosFidelidade {
  const diferenca = fidelidadeAte.getTime() - instante.getTime();
  const remainingDays = diferenca <= 0 ? 0 : Math.ceil(diferenca / 86_400_000);

  return { remainingDays, penaltyRate: calculatePenaltyRate(remainingDays) };
}

function calculatePenaltyRate(diasRestantes: number): number {
  if (diasRestantes === 0) return 0;
  if (diasRestantes <= 30) return 5;
  if (diasRestantes <= 180) return 10;
  return 20;
}
