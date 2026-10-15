import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorpoJsonPipe } from '../../core/validation/corpo-json.pipe.js';
import { IdPositivoPipe } from '../../core/validation/id-positivo.pipe.js';
import { CriarJogadorDtoPipe } from './dto/criar-jogador.dto.js';
import { EditarJogadorDtoPipe } from './dto/editar-jogador.dto.js';
import { Jogador } from './entities/jogador.entity.js';
import { JogadoresController } from './jogadores.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Jogador])],
  controllers: [JogadoresController],
  providers: [
    CorpoJsonPipe,
    IdPositivoPipe,
    CriarJogadorDtoPipe,
    EditarJogadorDtoPipe,
  ],
})
export class JogadoresModule {}
