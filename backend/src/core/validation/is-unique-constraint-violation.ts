type ErrorObject = Record<string, unknown>;

function isErrorObject(value: unknown): value is ErrorObject {
  return typeof value === 'object' && value !== null;
}

/** Identifica a violação de unicidade do PostgreSQL (SQLSTATE 23505). */
export function isUniqueConstraintViolation(error: unknown): boolean {
  if (!isErrorObject(error)) {
    return false;
  }

  const driverError = error.driverError;

  return isErrorObject(driverError) && driverError.code === '23505';
}
