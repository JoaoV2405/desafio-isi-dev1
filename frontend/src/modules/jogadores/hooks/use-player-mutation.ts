import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardQueryOptions } from '@/modules/inicio/hooks/use-dashboard'

export function usePlayerMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
  onSuccess: (result: TResult) => void,
) {
  const queryClient = useQueryClient()
  const inFlight = useRef(false)
  const mutation = useMutation({
    mutationFn,
    // Uma ação de escrita não deve ser repetida automaticamente após falha de conexão.
    retry: false,
    onSuccess: async (result) => {
      // Atualiza listas filtradas, detalhes de clubes e escalações antes de encerrar o modal.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['players'] }),
        queryClient.invalidateQueries({ queryKey: ['clubs'] }),
        queryClient.invalidateQueries({
          queryKey: dashboardQueryOptions.queryKey,
        }),
      ])
      onSuccess(result)
    },
    onSettled: () => {
      inFlight.current = false
    },
  })

  function submit(input: TInput) {
    // O bloqueio síncrono também impede cliques duplos anteriores à próxima renderização.
    if (inFlight.current) return
    inFlight.current = true
    mutation.mutate(input)
  }

  return {
    submit,
    isPending: mutation.isPending,
    error: mutation.error?.message,
    reset: mutation.reset,
  }
}
