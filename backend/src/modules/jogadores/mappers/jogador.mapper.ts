import { centavosParaDecimal } from '../../../core/money/conversoes-monetarias.js';
import { CriarJogadorDto } from '../dto/criar-jogador.dto.js';
import { EditarJogadorDto } from '../dto/editar-jogador.dto.js';
import { CondicaoJogador, Jogador } from '../entities/jogador.entity.js';

export class JogadorMapper {
  static fromCreation(dto: CriarJogadorDto, baseValueInCents: number): Jogador {
    return Object.assign(new Jogador(), {
      nome: dto.name,
      posicao: dto.position,
      agilidade: dto.agility,
      idade: dto.age,
      valorBase: centavosParaDecimal(baseValueInCents),
      condicao: CondicaoJogador.Apto,
      clubeId: null,
      velocidade: dto.pace,
      finalizacao: dto.shooting,
      passe: dto.passing,
      drible: dto.dribbling,
      defesa: dto.defending,
      fisico: dto.physical,
      potencial: dto.potential,
      excluidoEm: null,
    });
  }

  static applyUpdate(jogador: Jogador, dto: EditarJogadorDto): Jogador {
    return Object.assign(jogador, {
      nome: dto.name,
      posicao: dto.position,
      agilidade: dto.agility,
      idade: dto.age,
    });
  }
}
