import { useFormContext, useWatch } from 'react-hook-form'
import type { CreatePlayerFormValues } from '../lib/create-player-form'
import { PLAYER_ATTRIBUTE_FIELDS } from '../lib/create-player-form'
import { AttributeProgressRow } from '@/shared/components/attribute-progress-row'

export function PlayerAttributesPreview() {
  // Observa apenas atributos e potencial para atualizar a prévia enquanto o usuário digita.
  const { control } = useFormContext<CreatePlayerFormValues>()
  const values = useWatch({
    control,
    name: [
      'pace',
      'shooting',
      'passing',
      'dribbling',
      'defending',
      'physical',
      'potential',
    ],
  })
  return (
    <aside
      aria-label="Prévia dos atributos"
      className="min-w-0 self-start space-y-5 rounded-xl border bg-muted/50 p-4"
    >
      <h3 className="text-base leading-6 font-semibold">
        Prévia dos atributos
      </h3>
      <div className="space-y-4">
        {PLAYER_ATTRIBUTE_FIELDS.map(({ key, label }, index) => (
          <AttributeProgressRow
            key={key}
            label={label}
            value={values[index]}
            potential={values[6]}
          />
        ))}
      </div>
    </aside>
  )
}
