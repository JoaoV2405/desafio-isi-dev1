import type { ClubPlayer } from '../types/club-details'
import { ClubRosterTable } from './club-table/club-roster-table'
import { ClubHistory } from './club-history/club-history'
import { ClubLineup } from './club-lineup/club-lineup'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type ClubTab = 'roster' | 'lineup' | 'history'

interface ClubTabsProps {
  clubId: number
  players: ClubPlayer[]
  value: ClubTab
  onValueChange: (tab: ClubTab) => void
  onSellPlayer: (player: ClubPlayer) => void
  isSubmitting: boolean
}

export function ClubTabs({
  clubId,
  players,
  value,
  onValueChange,
  onSellPlayer,
  isSubmitting,
}: ClubTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as ClubTab)}
      className="gap-0 overflow-hidden rounded-xl border"
    >
      <div className="border-b p-4">
        <TabsList variant="line" aria-label="Seções do clube">
          <TabsTrigger value="roster">Elenco</TabsTrigger>
          <TabsTrigger value="lineup">Escalação</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="roster">
        <ClubRosterTable
          players={players}
          onSellPlayer={onSellPlayer}
          isSubmitting={isSubmitting}
        />
      </TabsContent>
      <TabsContent value="lineup">
        <ClubLineup key={clubId} clubId={clubId} players={players} />
      </TabsContent>
      <TabsContent value="history">
        <ClubHistory clubId={clubId} />
      </TabsContent>
    </Tabs>
  )
}
