import { apiFetch } from '@/shared/lib/api-client'

// Disponibiliza a operação para a integração dos modais, sem ler JSON em uma resposta 204.
export async function deletePlayer(playerId: number): Promise<void> {
  await apiFetch(`/players/${playerId}`, {
    method: 'DELETE',
  })

  // O sucesso não tem corpo; a interface deve produzir sua própria mensagem de confirmação.
}
