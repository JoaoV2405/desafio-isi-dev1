import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, type Repository } from 'typeorm';
import { isUniqueConstraintViolation } from '../../../core/validation/is-unique-constraint-violation.js';
import { decimalParaCentavos } from '../../../core/money/conversoes-monetarias.js';
import { calculateLoyaltyTerms } from '../../contratos/index.js';
import { projectRoster } from '../../jogadores/index.js';
import { CriarClubeDto } from '../dto/criar-clube.dto.js';
import { ClubeDetailResponse, ClubeResponse } from '../dto/clube-response.js';
import { Clube } from '../entities/clube.entity.js';
import { ListarClubesDto, OrdenacaoClubes } from '../dto/listar-clubes.dto.js';
import {
  ClubePresenter,
  type TotaisClube,
} from '../presenters/clube.presenter.js';
import { DetalhesClubeQuery } from '../queries/detalhes-clube.query.js';
import type { ContratoAtivoLeitura } from '../queries/detalhes-clube.types.js';
import { validateClubCreation } from '../validators/clube.validators.js';

const CLUB_LIMIT = 20;

function normalizeNameForSorting(name: string): string[] {
  return Array.from(
    name
      .normalize('NFD')
      .toLowerCase()
      .replace(/\p{Mn}/gu, ''),
  );
}

function compareNames(firstName: string, secondName: string): number {
  const firstCharacters = normalizeNameForSorting(firstName);
  const secondCharacters = normalizeNameForSorting(secondName);
  const sharedLength = Math.min(
    firstCharacters.length,
    secondCharacters.length,
  );

  for (let index = 0; index < sharedLength; index += 1) {
    const difference =
      firstCharacters[index].codePointAt(0)! -
      secondCharacters[index].codePointAt(0)!;

    if (difference !== 0) {
      return difference;
    }
  }

  return firstCharacters.length - secondCharacters.length;
}

@Injectable()
export class ClubesService {
  constructor(
    @InjectRepository(Clube)
    private readonly clubsRepository: Repository<Clube>,
    private readonly dataSource: DataSource,
    private readonly detalhesClubeQuery: DetalhesClubeQuery,
  ) {}

  async create(input: CriarClubeDto): Promise<ClubeResponse> {
    const clubData = validateClubCreation(input);

    try {
      const club = await this.dataSource.transaction(async (manager) => {
        // O bloqueio impede duas criações simultâneas de ultrapassarem o limite.
        await manager.query('LOCK TABLE "clubes" IN SHARE ROW EXCLUSIVE MODE');

        const clubsRepository = manager.getRepository(Clube);

        if ((await clubsRepository.count()) >= CLUB_LIMIT) {
          throw new ConflictException('O limite de 20 clubes foi atingido');
        }

        const newClub = clubsRepository.create({
          nome: clubData.name,
          sigla: clubData.acronym,
        });

        return clubsRepository.save(newClub);
      });

      return ClubePresenter.present(club, this.calculateTotals(club, 0));
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (isUniqueConstraintViolation(error)) {
        throw new ConflictException('Nome ou sigla do clube já cadastrado');
      }

      throw error;
    }
  }

  async findAll(query: ListarClubesDto = {}): Promise<ClubeResponse[]> {
    const clubs = await this.clubsRepository
      .createQueryBuilder('clube')
      .leftJoinAndSelect(
        'clube.jogadores',
        'jogador',
        'jogador.excluidoEm IS NULL',
      )
      .getMany();
    const calculados = clubs.map((clube) => {
      const { squadValueInCents } = projectRoster(clube.jogadores);
      return { clube, totais: this.calculateTotals(clube, squadValueInCents) };
    });
    const sort = query.sort ?? OrdenacaoClubes.Nome;

    calculados.sort((first, second) => {
      const diferencaPatrimonio =
        sort === OrdenacaoClubes.Nome
          ? 0
          : (first.totais.netWorthInCents - second.totais.netWorthInCents) *
            (sort === OrdenacaoClubes.PatrimonioDecrescente ? -1 : 1);

      return (
        diferencaPatrimonio ||
        compareNames(first.clube.nome, second.clube.nome) ||
        first.clube.id - second.clube.id
      );
    });

    return calculados.map(({ clube, totais }) =>
      ClubePresenter.present(clube, totais),
    );
  }

  async findById(id: number): Promise<ClubeDetailResponse> {
    const leitura = await this.detalhesClubeQuery.findById(id);

    if (!leitura) {
      throw new NotFoundException('Clube não encontrado');
    }

    const instante = new Date();
    const contratosPorJogador = new Map<number, ContratoAtivoLeitura | null>(
      leitura.elenco.map(({ jogador, contrato }) => [jogador.id, contrato]),
    );
    const { players, squadValueInCents } = projectRoster(
      leitura.elenco.map(({ jogador }) => jogador),
    );
    const elenco = players.map((jogador) => {
      const contrato = contratosPorJogador.get(jogador.id);

      if (!contrato) {
        throw new InternalServerErrorException(
          'Não foi possível consultar o elenco do clube',
        );
      }

      return {
        jogador,
        contrato: {
          purchaseValueInCents: decimalParaCentavos(contrato.valorCompra),
          loyaltyUntil: contrato.fidelidadeAte,
          ...calculateLoyaltyTerms(contrato.fidelidadeAte, instante),
        },
      };
    });

    return ClubePresenter.presentDetails(
      leitura.clube,
      this.calculateTotals(leitura.clube, squadValueInCents),
      elenco,
    );
  }

  private calculateTotals(
    clube: Pick<Clube, 'caixa'>,
    squadValueInCents: number,
  ): TotaisClube {
    const cashInCents = decimalParaCentavos(clube.caixa);

    return {
      cashInCents,
      squadValueInCents,
      netWorthInCents: cashInCents + squadValueInCents,
    };
  }
}
