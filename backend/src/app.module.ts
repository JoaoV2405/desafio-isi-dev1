import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ClubesModule } from './modules/clubes/clubes.module.js';
import { TypeOrmConfigService } from './infrastructure/db/typeorm-config.service.js';
import { JogadoresModule } from './modules/jogadores/jogadores.module.js';
import { MercadoModule } from './modules/mercado/mercado.module.js';
import { LigaModule } from './modules/liga/liga.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    JogadoresModule,
    ClubesModule,
    MercadoModule,
    LigaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
