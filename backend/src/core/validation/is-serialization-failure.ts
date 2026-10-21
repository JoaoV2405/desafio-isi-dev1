/** Identifica a falha de serialização PostgreSQL (SQLSTATE 40001) encapsulada pelo TypeORM. */
export function isSerializationFailure(error: unknown): boolean {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('driverError' in error)
  ) {
    return false;
  }
  const driverError = error.driverError;
  return (
    typeof driverError === 'object' &&
    driverError !== null &&
    'code' in driverError &&
    driverError.code === '40001'
  );
}
