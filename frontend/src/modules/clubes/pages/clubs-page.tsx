import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { CreateClubModal } from '../components/club-modal/create-club-modal'
import { createClub } from '../services/clubs-api'
import type { CreateClubInput } from '../types/club-input'
import { IconPlaceholder } from '@/components/layout/icon-placeholder'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'
import { Button } from '@/components/ui/button'
import { ClubsTable } from '../components/club-table/clubs-table'

export function ClubsPage() {
  const { create: isCreateModalOpen } = useSearch({ from: '/mercado/clubes' })
  const inFlight = useRef(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const creation = useMutation({
    mutationFn: createClub,
    retry: false,
    onSuccess: async (club) => {
      await queryClient.invalidateQueries({ queryKey: ['clubs'] })
      // Remove a intenção de criação antes de abrir o detalhe: Voltar não reabre o modal.
      await navigate({ to: '/mercado/clubes', search: {}, replace: true })
      await navigate({
        to: '/mercado/clubes/$clubeId',
        params: { clubeId: String(club.id) },
        state: { createdClubId: club.id },
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
        icon={<IconPlaceholder />}
        title="Clubes"
        description="Acompanhe os clubes e gerencie sua participação na liga."
        actions={
          <Button
            type="button"
            disabled={creation.isPending}
            onClick={() => changeCreateModalOpen(true)}
          >
            <IconPlaceholder />
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
