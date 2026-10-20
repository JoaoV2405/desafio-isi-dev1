import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clube } from '../clubes/entities/clube.entity.js';
import { Jogador } from '../jogadores/entities/jogador.entity.js';
import { JogadoresModule } from '../jogadores/jogadores.module.js';
import { EscalacaoController } from './controllers/escalacao.controller.js';
import { DueloPartida } from './entities/duelo-partida.entity.js';
import { Escalacao } from './entities/escalacao.entity.js';
import { Partida } from './entities/partida.entity.js';
import { EscalacoesService } from './services/escalacao.service.js';

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
  controllers: [EscalacaoController],
  providers: [EscalacoesService],
})
export class LigaModule {}
