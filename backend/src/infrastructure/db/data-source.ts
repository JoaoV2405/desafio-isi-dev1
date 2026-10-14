import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';

function loadEnvironmentFile(path: string): void {
  try {
    process.loadEnvFile(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`A variável de ambiente ${name} é obrigatória`);
  }

  return value;
}

function getDatabasePort(): number {
  const port = Number(getRequiredEnvironmentVariable('DB_PORT'));

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('A variável de ambiente DB_PORT deve ser uma porta válida');
  }

  return port;
}

loadEnvironmentFile('.env.local');
loadEnvironmentFile('.env');

const currentDirectory = dirname(fileURLToPath(import.meta.url));

export default new DataSource({
  type: 'postgres',
  host: getRequiredEnvironmentVariable('DB_HOST'),
  port: getDatabasePort(),
  username: getRequiredEnvironmentVariable('DB_USER'),
  password: getRequiredEnvironmentVariable('DB_PASSWORD'),
  database: getRequiredEnvironmentVariable('DB_NAME'),
  entities: [resolve(currentDirectory, '../../**/*.entity{.ts,.js}')],
  migrations: [resolve(currentDirectory, 'migrations/*{.ts,.js}')],
  synchronize: false,
});
