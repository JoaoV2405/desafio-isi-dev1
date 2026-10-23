import { useQuery } from '@tanstack/react-query'
import { getMatch } from '../services/matches-api'
import { ApiError } from '@/shared/lib/api-error'

export const matchDetailKey = (id: string) => ['matches', 'detail', id] as const

export function useMatch(id?: string) {
  return useQuery({
    queryKey: matchDetailKey(id ?? ''),
    enabled: id !== undefined,
    queryFn: ({ signal }) => {
      if (
        !id ||
        !/^\d+$/.test(id) ||
        !Number.isSafeInteger(Number(id)) ||
        Number(id) < 1
      ) {
        throw new ApiError('Partida não encontrada.', {
          kind: 'http',
          status: 404,
        })
      }
      return getMatch(id, signal)
    },
    staleTime: Infinity,
    retry: false,
  })
}
