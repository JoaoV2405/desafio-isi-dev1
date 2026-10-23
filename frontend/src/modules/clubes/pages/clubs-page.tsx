import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { CreateClubModal } from '../components/club-modal/create-club-modal'
import { createClub } from '../services/clubs-api'
import type { CreateClubInput } from '../types/club-input'
import { Plus, Shield } from 'lucide-react'
import { PageIcon } from '@/components/page/page-icon'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { ClubsTable } from '../components/club-table/clubs-table'
import { dashboardQueryOptions } from '@/shared/hooks/use-dashboard'
import { formatMoney } from '@/shared/lib/format-money'

export function ClubsPage() {
  const { create: isCreateModalOpen } = useSearch({ from: '/mercado/clubes' })
  const inFlight = useRef(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const creation = useMutation({
    mutationFn: createClub,
    retry: false,
    onSuccess: async (club) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['clubs'] }),
        queryClient.invalidateQueries({ queryKey: ['classificacao'] }),
        queryClient.invalidateQueries({
          queryKey: dashboardQueryOptions.queryKey,
        }),
      ])
      // Remove a intenção de criação antes de abrir o detalhe: Voltar não reabre o modal.
      await navigate({ to: '/mercado/clubes', search: {}, replace: true })
      await navigate({
        to: '/mercado/clubes/$clubeId',
        params: { clubeId: String(club.id) },
      })
      toast.add({
        type: 'success',
        title: 'Clube criado',
        description: `${club.name} (${club.acronym}) começa com ${formatMoney(club.cash)} em caixa.`,
        timeout: 5000,
      })
    },
    onSettled: () => {
      inFlight.current = false
    },
  })

  function changeCreateModalOpen(open: boolean) {
    if (inFlight.current) return
    creation.reset()
    void navigate({
      to: '/mercado/clubes',
      search: open ? { create: true } : {},
      replace: true,
    })
  }

  function submitClub(input: CreateClubInput) {
    if (inFlight.current) return
    inFlight.current = true
    creation.mutate(input)
  }

  return (
    <PageContainer>
      <PageHeader
        icon={<PageIcon icon={Shield} />}
        title="Clubes"
        description="Acompanhe os clubes e gerencie sua participação na liga."
        actions={
          <Button
            type="button"
            disabled={creation.isPending}
            onClick={() => changeCreateModalOpen(true)}
          >
            <Plus aria-hidden="true" />
            Criar clube
          </Button>
        }
      />
      <PageSection aria-label="Clubes">
        <ClubsTable onCreateClub={() => changeCreateModalOpen(true)} />
      </PageSection>
      {isCreateModalOpen && (
        <CreateClubModal
          open
          onOpenChange={changeCreateModalOpen}
          onConfirm={submitClub}
          isSubmitting={creation.isPending}
          error={creation.error?.message}
        />
      )}
    </PageContainer>
  )
}
