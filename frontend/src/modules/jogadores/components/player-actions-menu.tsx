import { useState } from 'react'
import { Ellipsis, Eye, HeartPulse, Pencil, Trash2 } from 'lucide-react'
import type { Player } from '@/shared/types/player'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type PlayerAction = 'details' | 'edit' | 'condition' | 'delete'

export interface PlayerActionsMenuProps {
  player: Player
  onAction: (action: PlayerAction, player: Player) => void
}

export function PlayerActionsMenu({
  player,
  onAction,
}: PlayerActionsMenuProps) {
  const [open, setOpen] = useState(false)

  function chooseAction(action: PlayerAction) {
    setOpen(false)
    onAction(action, player)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        aria-label={`Ações de ${player.name}`}
        render={<Button type="button" variant="default" size="icon-sm" />}
      >
        <Ellipsis aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={6}
        alignOffset={4}
        className="w-48"
        aria-label={`Ações de ${player.name}`}
      >
        <DropdownMenuItem onClick={() => chooseAction('details')}>
          <Eye aria-hidden="true" />
          Ver detalhes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => chooseAction('edit')}>
          <Pencil aria-hidden="true" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => chooseAction('condition')}>
          <HeartPulse aria-hidden="true" />
          Alterar condição
        </DropdownMenuItem>
        {player.club_id === null && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => chooseAction('delete')}
            >
              <Trash2 aria-hidden="true" />
              Excluir
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
