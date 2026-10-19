export function getPlayerInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const firstName = words.at(0) ?? ''
  const secondInitial =
    words.length > 1 ? (words.at(-1)?.slice(0, 1) ?? '') : firstName.slice(1, 2)

  return (
    `${firstName.slice(0, 1)}${secondInitial}`.toLocaleUpperCase('pt-BR') ||
    '--'
  )
}

export function getAgilityColor(value: number) {
  if (value <= 35) return 'red'
  if (value <= 79) return 'gray'
  return 'green'
}
