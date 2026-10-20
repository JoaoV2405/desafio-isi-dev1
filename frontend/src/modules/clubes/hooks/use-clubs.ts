import { useQuery } from '@tanstack/react-query'
import { getClubs } from '../services/clubs-api'

export function useClubs() {
  return useQuery({
    queryKey: ['clubs', 'list'],
    // A mesma consulta abastece listagem, filtros e sidebar, compartilhando o cache.
    queryFn: ({ signal }) => getClubs(signal),
  })
}
