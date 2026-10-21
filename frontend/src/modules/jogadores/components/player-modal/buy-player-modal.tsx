import { useId, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays, Clock3 } from 'lucide-react'
import type { BuyPlayerInput } from '../../types/player-purchase'
import type { Player } from '@/shared/types/player'
import type { Club } from '@/shared/types/club'
import { useClubs } from '@/modules/clubes/hooks/use-clubs'
import { Modal } from '@/components/modal/modal'
import { PlayerIdentity } from '@/shared/components/player-identity'
import { formatMoney } from '@/shared/lib/format-money'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface BuyPlayerModalProps {
  open: boolean
  player: Player
  onOpenChange: (open: boolean) => void
  onConfirm: (input: BuyPlayerInput) => void
  isSubmitting?: boolean
  error?: string
}

interface BuyPlayerFormValues {
  clubId: number | null
  date: Date | undefined
  time: string
}

function getClubLabel(club: Club) {
  return `${club.name} (${club.acronym}) · Caixa: ${formatMoney(club.cash)} moedas`
}

export function BuyPlayerModal({
  open,
  player,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  error,
}: BuyPlayerModalProps) {
  const formId = useId()
  const clubId = `${formId}-club`
  const dateId = `${formId}-date`
  const timeId = `${formId}-time`
  const [calendarOpen, setCalendarOpen] = useState(false)
  const clubs = useClubs()
  const form = useForm<BuyPlayerFormValues>({
    defaultValues: { clubId: null, date: undefined, time: '' },
    mode: 'onTouched',
  })
  const { errors } = form.formState
  const isFree = player.club_id === null
  const unavailable = clubs.isPending || clubs.isError || !clubs.data.length
  const blocked = isSubmitting || !isFree || unavailable
  const submitForm = form.handleSubmit((values) => {
    if (blocked || values.clubId === null || !values.date) return
    // O calendário representa uma data civil; o horário digitado é sempre de Brasília.
    onConfirm({
      club_id: values.clubId,
      loyalty_until: `${format(values.date, 'yyyy-MM-dd')}T${values.time}-03:00`,
    })
  })

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Comprar jogador"
      subtitle="Escolha o clube comprador e defina o fim da fidelidade."
      className="max-w-2xl"
      primaryAction={{
        label: 'Confirmar compra',
        pendingLabel: 'Confirmando compra...',
        formId,
        disabled: blocked,
      }}
      isSubmitting={isSubmitting || form.formState.isSubmitting}
    >
      <div className="flex w-full items-start justify-between gap-4 rounded-xl border bg-muted/30 p-4">
        <PlayerIdentity
          playerId={player.id}
          name={player.name}
          position={player.position}
          age={player.age}
          className="min-w-0 flex-1 items-start"
        />
        <div className="shrink-0 text-right">
          <p className="text-sm text-muted-foreground">Valor de mercado</p>
          <p className="mt-1 text-sm font-semibold tabular-nums">
            {formatMoney(player.market_value)} moedas
          </p>
        </div>
      </div>

      <form id={formId} noValidate onSubmit={submitForm} className="space-y-6">
        <fieldset disabled={isSubmitting} className="min-w-0 space-y-6">
          <div className="space-y-2">
            <label htmlFor={clubId} className="text-sm font-medium">
              Clube comprador
            </label>
            <Controller
              name="clubId"
              control={form.control}
              rules={{ required: 'Selecione o clube comprador.' }}
              render={({ field }) => (
                <Combobox
                  items={clubs.data ?? []}
                  value={
                    clubs.data?.find((club) => club.id === field.value) ?? null
                  }
                  onValueChange={(club) => field.onChange(club?.id ?? null)}
                  itemToStringLabel={getClubLabel}
                  isItemEqualToValue={(club, value) => club.id === value.id}
                  disabled={isSubmitting || unavailable}
                >
                  <ComboboxInput
                    id={clubId}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    className="w-full"
                    placeholder={
                      clubs.isPending
                        ? 'Carregando clubes...'
                        : 'Selecione um clube'
                    }
                    disabled={isSubmitting || unavailable}
                    aria-required="true"
                    aria-invalid={Boolean(errors.clubId)}
                    aria-describedby={`${clubId}-description${errors.clubId ? ` ${clubId}-error` : ''}`}
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>Nenhum clube encontrado.</ComboboxEmpty>
                    <ComboboxList>
                      {(club: Club) => (
                        <ComboboxItem key={club.id} value={club}>
                          {getClubLabel(club)}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              )}
            />
            <p
              id={`${clubId}-description`}
              className="text-xs text-muted-foreground"
            >
              Selecione o clube que receberá o jogador e confira seu caixa
              atual.
            </p>
            {errors.clubId && (
              <Alert id={`${clubId}-error`} variant="destructive">
                <AlertDescription>{errors.clubId.message}</AlertDescription>
              </Alert>
            )}
            {!clubs.isPending && !clubs.isError && !clubs.data.length && (
              <p role="status" className="text-sm text-muted-foreground">
                Cadastre um clube antes de comprar um jogador.
              </p>
            )}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Fim da fidelidade</legend>
            <div className="grid grid-cols-[minmax(0,3fr)_minmax(7rem,1fr)] gap-3">
              <div className="space-y-2">
                <label htmlFor={dateId} className="block text-sm font-medium">
                  Data
                </label>
                <Controller
                  name="date"
                  control={form.control}
                  rules={{ required: 'Selecione a data do fim da fidelidade.' }}
                  render={({ field }) => (
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger
                        render={<Button type="button" variant="outline" />}
                        id={dateId}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        disabled={isSubmitting}
                        className="w-full justify-start font-normal tabular-nums"
                        aria-label="Data do fim de fidelidade"
                        aria-invalid={Boolean(errors.date)}
                        aria-describedby={`${formId}-loyalty-description${errors.date ? ` ${dateId}-error` : ''}`}
                      >
                        <CalendarDays
                          aria-hidden="true"
                          className="text-muted-foreground"
                        />
                        {field.value
                          ? format(field.value, 'dd/MM/yyyy')
                          : 'Selecione uma data'}
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                          mode="single"
                          locale={ptBR}
                          selected={field.value}
                          defaultMonth={field.value}
                          onSelect={(date) => {
                            field.onChange(date)
                            if (date) setCalendarOpen(false)
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor={timeId} className="block text-sm font-medium">
                  Horário
                </label>
                <InputGroup>
                  <InputGroupAddon>
                    <Clock3 aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...form.register('time', {
                      required: 'Informe o horário do fim da fidelidade.',
                      pattern: {
                        value: /^([01]\d|2[0-3]):[0-5]\d$/,
                        message: 'Informe um horário válido.',
                      },
                    })}
                    id={timeId}
                    type="time"
                    step={60}
                    aria-required="true"
                    aria-invalid={Boolean(errors.time)}
                    aria-describedby={`${formId}-loyalty-description${errors.time ? ` ${timeId}-error` : ''}`}
                    className="min-w-0 appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                </InputGroup>
              </div>
            </div>
            <p
              id={`${formId}-loyalty-description`}
              className="text-xs text-muted-foreground"
            >
              Informe a data e a hora de Brasília. O fim da fidelidade deve ser
              futuro, em até 1.095 dias.
            </p>
            {errors.date && (
              <Alert id={`${dateId}-error`} variant="destructive">
                <AlertDescription>{errors.date.message}</AlertDescription>
              </Alert>
            )}
            {errors.time && (
              <Alert id={`${timeId}-error`} variant="destructive">
                <AlertDescription>{errors.time.message}</AlertDescription>
              </Alert>
            )}
          </fieldset>
        </fieldset>
        {clubs.error && (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível carregar os clubes</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{clubs.error.message}</p>
              <Button
                type="button"
                variant="outline"
                disabled={clubs.isFetching}
                onClick={() => void clubs.refetch()}
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {!isFree && (
          <Alert variant="destructive">
            <AlertDescription>
              Apenas jogadores livres podem ser comprados.
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="whitespace-pre-line">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </form>
    </Modal>
  )
}
