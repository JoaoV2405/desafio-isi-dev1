import { useFormContext, useWatch } from 'react-hook-form'
import type { CreatePlayerFormValues } from '../lib/create-player-form'
import { PLAYER_ATTRIBUTE_FIELDS } from '@/shared/lib/player-presentation'
import { AttributeProgressRow } from '@/shared/components/attribute-progress-row'

export function PlayerAttributesPreview() {
  // Acessa cada atributo pelo nome para manter os valores ligados aos seus rótulos.
  const { control } = useFormContext<CreatePlayerFormValues>()
  const values = useWatch({ control, compute: (formValues) => formValues })
  return (
    <aside
      aria-label="Prévia dos atributos"
      className="min-w-0 self-start space-y-5 rounded-xl border bg-muted/50 p-4"
    >
      <h3 className="text-base leading-6 font-semibold">
        Prévia dos atributos
      </h3>
      <div className="space-y-4">
        {PLAYER_ATTRIBUTE_FIELDS.map(({ key, label }) => (
          <AttributeProgressRow
            key={key}
            label={label}
            value={values[key]}
            potential={values.potential}
          />
        ))}
      </div>
    </aside>
  )
}
