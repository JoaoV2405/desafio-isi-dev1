import type { ClubPlayer } from '../types/club-details'
import { ClubRosterTable } from './club-roster-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type ClubTab = 'roster' | 'lineup' | 'history'

interface ClubTabsProps {
  players: ClubPlayer[]
  value: ClubTab
  onValueChange: (tab: ClubTab) => void
  onSellPlayer: (player: ClubPlayer) => void
  isSubmitting: boolean
}

export function ClubTabs({
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
      <TabsContent value="lineup" className="p-6 text-muted-foreground">
        Escalação em breve.
      </TabsContent>
      <TabsContent value="history" className="p-6 text-muted-foreground">
        Histórico em breve.
      </TabsContent>
    </Tabs>
  )
}
