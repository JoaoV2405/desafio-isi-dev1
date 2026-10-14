import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const port = Number(this.configService.getOrThrow<string>('DB_PORT'));

    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
      throw new Error(
        'A variável de ambiente DB_PORT deve ser uma porta válida',
      );
    }

    return {
      type: 'postgres',
      host: this.configService.getOrThrow<string>('DB_HOST'),
      port,
      username: this.configService.getOrThrow<string>('DB_USER'),
      password: this.configService.getOrThrow<string>('DB_PASSWORD'),
      database: this.configService.getOrThrow<string>('DB_NAME'),
      synchronize: false,
      autoLoadEntities: true,
    };
  }
}
