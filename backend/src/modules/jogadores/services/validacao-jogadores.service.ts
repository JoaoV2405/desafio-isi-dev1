import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CriarJogadorDto } from '../dto/criar-jogador.dto.js';
import { EditarJogadorDto } from '../dto/editar-jogador.dto.js';
import { type FiltrosJogadores } from '../dto/listar-jogadores.dto.js';
import {
  CondicaoJogador,
  Jogador,
  type PosicaoJogador,
} from '../entities/jogador.entity.js';
import {
  calcularOverall,
  calcularValorBaseEmCentavos,
  calcularValorMercadoEmCentavos,
} from './calculos-jogador.js';

@Injectable()
export class ValidacaoJogadoresService {
      

  validateCreation(dto: CriarJogadorDto): void {
    // Estes limites combinam atributos, potencial, idade e agilidade e por isso complementam os decorators do DTO.
    const attributes = this.getAttributes(dto);
    const highestAttribute = Math.max(...attributes);
    const attributesTotal = attributes.reduce(
      (total, attribute) => total + attribute,
      0,
    );

    if (attributesTotal > 480) {
      throw new BadRequestException(
        'A soma dos atributos do jogador não pode ultrapassar 480',
      );
    }

    if (dto.potential < highestAttribute) {
      throw new BadRequestException(
        'O campo potential deve ser maior ou igual ao maior atributo',
      );
    }

    if (dto.age >= 33 && dto.potential !== highestAttribute) {
      throw new BadRequestException(
        'Para jogadores com 33 anos ou mais, potential deve ser igual ao maior atributo',
      );
    }

    this.validateAgilityForAge(dto.agility, dto.age);
  }

  validateUpdate(dto: EditarJogadorDto, jogador: Jogador): void {
    // Atualizações preservam atributos e valor base, mas ainda obedecem às regras de idade, agilidade e vínculo.
    this.validateAgilityForAge(dto.agility, dto.age);

    if (dto.age < jogador.idade) {
      throw new ConflictException('A idade do jogador não pode diminuir');
    }

    if (jogador.clubeId !== null && dto.position !== jogador.posicao) {
      throw new ConflictException(
        'A posição de um jogador vinculado a um clube não pode mudar',
      );
    }
  }

  validateConditionChange(
    currentCondition: CondicaoJogador,
    nextCondition: CondicaoJogador,
  ): void {
    // A única transição proibida é sair de DOENTE diretamente para APTO.
    if (
      currentCondition === CondicaoJogador.Doente &&
      nextCondition === CondicaoJogador.Apto
    ) {
      throw new ConflictException(
        'Um jogador doente não pode voltar diretamente para APTO',
      );
    }
  }

  validateRemoval(jogador: Jogador): void {
    if (jogador.clubeId !== null) {
      throw new ConflictException(
        'Somente jogadores livres podem ser excluídos',
      );
    }
  }

  validateFilters(filters: FiltrosJogadores): void {
    // Rejeita combinações incoerentes que não podem ser validadas olhando cada query parameter isoladamente.
    if (filters.minAge > filters.maxAge) {
      throw new BadRequestException('min_age não pode ser maior que max_age');
    }

    if (filters.minValueInCents > filters.maxValueInCents) {
      throw new BadRequestException(
        'min_value não pode ser maior que max_value',
      );
    }

    if (filters.free === true && filters.clubId !== undefined) {
      throw new BadRequestException(
        'free=true não pode ser combinado com club_id',
      );
    }

    if (filters.limit < 1 || filters.limit > 50) {
      throw new BadRequestException('limit deve estar entre 1 e 50');
    }
  }

  // Guia do item 2: manter a fórmula e as duas assinaturas deste método.
  // O ajuste é no chamador: calculatePlayer deixa de chamá-lo; na listagem, presentPlayer
  // o chama somente após o slice. No cadastro, ele continua necessário para o valor base.
  // Não armazenar o resultado na entity nem criar cache persistente para essa otimização.
  calculateOverall(dto: CriarJogadorDto): number;
  calculateOverall(jogador: Jogador): number;
  calculateOverall(input: CriarJogadorDto | Jogador): number {
    const position = this.getPosition(input);
    const [velocidade, finalizacao, passe, drible, defesa, fisico] =
      this.getAttributes(input);

    return calcularOverall(position, {
      velocidade,
      finalizacao,
      passe,
      drible,
      defesa,
      fisico,
    });
  }

  calculateBaseValueInCents(dto: CriarJogadorDto): number {
    // Guia do item 2: preservar esta chamada a calculateOverall; ela calcula o valor base
    // uma única vez no cadastro e não participa do trabalho antecipado da paginação.
    return calcularValorBaseEmCentavos(
      this.calculateOverall(dto),
      dto.potential,
      dto.age,
    );
  }

  calculateMarketValueInCents(jogador: Jogador): number {
    // Guia do item 2: preservar este cálculo antes dos filtros e da ordenação por valor.
    // O resultado em centavos deve ser reaproveitado ao montar a resposta após o slice,
    // pelo argumento opcional de presentPlayer descrito no guia de JogadoresService.
    return calcularValorMercadoEmCentavos(
      jogador.valorBase,
      jogador.condicao,
      jogador.agilidade,
      jogador.idade,
    );
  }

  private validateAgilityForAge(agility: number, age: number): void {
    if (age >= 35 && agility > 85) {
      throw new BadRequestException(
        'Para jogadores com 35 anos ou mais, agility deve ser no máximo 85',
      );
    }
  }

  private getAttributes(input: CriarJogadorDto | Jogador): number[] {
    if (input instanceof Jogador) {
      return [
        input.velocidade,
        input.finalizacao,
        input.passe,
        input.drible,
        input.defesa,
        input.fisico,
      ];
    }

    return [
      input.pace,
      input.shooting,
      input.passing,
      input.dribbling,
      input.defending,
      input.physical,
    ];
  }

  private getPosition(input: CriarJogadorDto | Jogador): PosicaoJogador {
    return input instanceof Jogador ? input.posicao : input.position;
  }
}
