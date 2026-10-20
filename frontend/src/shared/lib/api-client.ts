export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const origin = (import.meta.env.VITE_API_ORIGIN ?? '').replace(/\/$/, '')
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  let response: Response
  try {
    response = await fetch(`${origin}/api/v1${path}`, { ...options, headers })
  } catch (error) {
    // Preserva cancelamentos do React Query para não apresentá-los como falhas de conexão.
    if (options.signal?.aborted) throw error
    throw new Error('Não foi possível conectar à API.', { cause: error })
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    let message = `Falha na requisição à API (HTTP ${response.status}).`
    if (body && typeof body === 'object' && 'message' in body) {
      if (typeof body.message === 'string' && body.message)
        message = body.message
      else if (
        Array.isArray(body.message) &&
        body.message.length &&
        body.message.every((item) => typeof item === 'string')
      ) {
        message = body.message.join('\n')
      }
    }
    throw new Error(message)
  }

  return response
}

export async function apiJson<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await apiFetch(path, options)
  try {
    return (await response.json()) as T
  } catch {
    throw new Error('A API retornou uma resposta JSON inválida.')
  }
}
