import { useNavigate } from '@tanstack/react-router'
import { ContentState } from '@/components/custom/content-state'
import { ContentErrorState } from '@/components/custom/content-error-state'
import { useClubs } from '@/modules/clubes/hooks/use-clubs'
import { IconPlaceholder } from '@/components/layout/icon-placeholder'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'
import { Button } from '@/components/ui/button'
import { DataTable } from '#/components/data-table/data-table'

export function MatchesPage() {
  const clubs = useClubs()
  const navigate = useNavigate()

  return (
    <PageContainer>
      <PageHeader
        icon={<IconPlaceholder />}
        title="Partidas"
        description="Consulte o histórico e organize os confrontos da liga."
        actions={
          // TODO: abrir o formulário de nova partida.
          <Button disabled>
            <IconPlaceholder />
            Criar partida
          </Button>
        }
      />
      <PageSection aria-label="Histórico de partidas">
        {clubs.isPending ? (
          <p role="status">Carregando clubes...</p>
        ) : clubs.isError ? (
          <ContentErrorState
            title="Não foi possível carregar os clubes"
            error={clubs.error}
          />
        ) : clubs.data.length === 0 ? (
          <ContentState
            variant="empty"
            title="Nenhum clube cadastrado"
            description="Crie um clube para começar a preparar os confrontos da liga."
            action={{
              label: 'Criar clube',
              onClick: () =>
                void navigate({
                  to: '/mercado/clubes',
                  search: { create: true },
                }),
            }}
          />
        ) : (
          <p>Você está na página de Partidas</p>
        )}
      </PageSection>
    </PageContainer>
  )
}
