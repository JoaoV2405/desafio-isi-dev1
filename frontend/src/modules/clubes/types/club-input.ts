import type { ClubSummary } from '@/shared/types/club'

export type CreateClubInput = Pick<ClubSummary, 'name' | 'acronym'>
