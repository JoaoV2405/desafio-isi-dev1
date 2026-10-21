import type { ClubPlayer } from '../types/club-details'
import { ClubRosterTable } from './club-roster-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ClubTabs({ players }: { players: ClubPlayer[] }) {
  return (
    <Tabs
      defaultValue="roster"
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
        <ClubRosterTable players={players} />
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
