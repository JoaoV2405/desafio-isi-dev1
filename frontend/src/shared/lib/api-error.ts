export type ApiErrorKind = 'network' | 'http' | 'invalid-response'

interface ApiErrorOptions extends ErrorOptions {
  kind: ApiErrorKind
  status?: number
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(message: string, { kind, status, cause }: ApiErrorOptions) {
    super(message, { cause })
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

export function isConnectionError(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'network'
}
