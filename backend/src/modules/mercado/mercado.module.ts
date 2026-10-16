import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JogadoresModule } from '../jogadores/jogadores.module.js';
import { Clube } from '../clubes/entities/clube.entity.js';
import { Jogador } from '../jogadores/entities/jogador.entity.js';
import { Escalacao } from '../liga/entities/escalacao.entity.js';
import { MercadoController } from './mercado.controller.js';
import { TransacoesController } from './transacoes.controller.js';
import { Contrato } from './entities/contrato.entity.js';
import { Transacao } from './entities/transacao.entity.js';
import { MercadoService } from './services/mercado.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clube, Jogador, Escalacao, Contrato, Transacao]),
    JogadoresModule,
  ],
  controllers: [MercadoController, TransacoesController],
  providers: [MercadoService],
})
export class MercadoModule {}
