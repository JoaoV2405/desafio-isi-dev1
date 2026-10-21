import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clube } from '../clubes/entities/clube.entity.js';
import { Jogador } from '../jogadores/entities/jogador.entity.js';
import { JogadoresModule } from '../jogadores/jogadores.module.js';
import { EscalacaoController } from './controllers/escalacao.controller.js';
import { PartidasController } from './controllers/partidas.controller.js';
import { DueloPartida } from './entities/duelo-partida.entity.js';
import { Escalacao } from './entities/escalacao.entity.js';
import { Partida } from './entities/partida.entity.js';
import { EscalacoesService } from './services/escalacao.service.js';
import { PartidasService } from './services/partidas.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Clube,
      Jogador,
      Escalacao,
      Partida,
      DueloPartida,
    ]),
    JogadoresModule,
  ],
  controllers: [EscalacaoController, PartidasController],
  providers: [EscalacoesService, PartidasService],
})
export class LigaModule {}
