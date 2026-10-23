import { queryOptions, useQuery } from '@tanstack/react-query'
import { getDashboard } from '../services/dashboard-api'

export const dashboardQueryOptions = queryOptions({
  queryKey: ['dashboard'],
  queryFn: ({ signal }) => getDashboard(signal),
})

export function useDashboard({
  refetchOnMount = true,
}: {
  refetchOnMount?: boolean | 'always'
} = {}) {
  return useQuery({ ...dashboardQueryOptions, refetchOnMount })
}
