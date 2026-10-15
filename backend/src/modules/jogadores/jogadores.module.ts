import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clube } from '../clubes/entities/clube.entity.js';
import { Escalacao } from '../liga/entities/escalacao.entity.js';
import { Jogador } from './entities/jogador.entity.js';
import { JogadoresController } from './jogadores.controller.js';
import { JogadoresService } from './services/jogadores.service.js';
import { ValidacaoJogadoresService } from './services/validacao-jogadores.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Jogador, Clube, Escalacao])],
  controllers: [JogadoresController],
  providers: [JogadoresService, ValidacaoJogadoresService],
  exports: [JogadoresService],
})
export class JogadoresModule {}
