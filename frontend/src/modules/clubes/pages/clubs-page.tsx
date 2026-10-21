import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { CreateClubModal } from '../components/create-club-modal'
import { createClub } from '../services/clubs-api'
import type { CreateClubInput } from '../types/club-input'
import { IconPlaceholder } from '@/components/layout/icon-placeholder'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'
import { Button } from '@/components/ui/button'
import { ClubsTable } from '../components/clubs-table'

export function ClubsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const inFlight = useRef(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const creation = useMutation({
    mutationFn: createClub,
    retry: false,
    onSuccess: async (club) => {
      await queryClient.invalidateQueries({ queryKey: ['clubs'] })
      setIsCreateModalOpen(false)
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
    if (open) creation.reset()
    setIsCreateModalOpen(open)
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
        <ClubsTable />
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
