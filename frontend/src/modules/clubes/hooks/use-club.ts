import { useQuery } from '@tanstack/react-query'
import { getClub } from '../services/clubs-api'

export function useClub(clubId: string) {
  return useQuery({
    queryKey: ['clubs', 'detail', clubId],
    // Ausências de indicadores e elenco são tratadas pela página, sem recorrer a dados locais.
    queryFn: ({ signal }) => getClub(clubId, signal),
  })
}
