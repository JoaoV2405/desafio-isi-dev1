export const PLAYER_ATTRIBUTE_LABELS = {
  pace: 'Velocidade',
  shooting: 'Finalização',
  passing: 'Passe',
  dribbling: 'Drible',
  defending: 'Defesa',
  physical: 'Físico',
} as const

export type PlayerAttributeKey = keyof typeof PLAYER_ATTRIBUTE_LABELS

export const PLAYER_ATTRIBUTE_FIELDS = (
  Object.keys(PLAYER_ATTRIBUTE_LABELS) as PlayerAttributeKey[]
).map((key) => ({ key, label: PLAYER_ATTRIBUTE_LABELS[key] }))

const PLAYER_AVATAR_CLASSES = [
  'bg-avatar-violet text-avatar-violet-foreground',
  'bg-avatar-pink text-avatar-pink-foreground',
  'bg-avatar-cyan text-avatar-cyan-foreground',
  'bg-avatar-teal text-avatar-teal-foreground',
  'bg-avatar-zinc text-avatar-zinc-foreground',
] as const

export function getPlayerAvatarClassName(playerId: number) {
  // O ID mantém a cor consistente entre telas, ordenações e edições do nome.
  return PLAYER_AVATAR_CLASSES[playerId % PLAYER_AVATAR_CLASSES.length]
}

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
