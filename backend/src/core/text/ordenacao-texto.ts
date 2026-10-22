export function normalizeForComparison(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '');
}

export function compareText(first: string, second: string): number {
  const firstCharacters = Array.from(first);
  const secondCharacters = Array.from(second);
  const sharedLength = Math.min(
    firstCharacters.length,
    secondCharacters.length,
  );

  for (let index = 0; index < sharedLength; index += 1) {
    const difference =
      firstCharacters[index].codePointAt(0)! -
      secondCharacters[index].codePointAt(0)!;
    if (difference !== 0) return difference;
  }

  return firstCharacters.length - secondCharacters.length;
}

export function compareNames(first: string, second: string): number {
  return compareText(
    normalizeForComparison(first),
    normalizeForComparison(second),
  );
}
