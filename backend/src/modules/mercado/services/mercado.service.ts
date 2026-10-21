import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, type Repository } from 'typeorm';
import { formatarDataBrasilia } from '../../../core/date/formatar-data-brasilia.js';
import {
  centavosParaDecimal,
  centavosParaNumero,
  decimalParaCentavos,
} from '../../../core/money/conversoes-monetarias.js';
import { validarDataBrasilia } from '../../../core/validation/validadores-gerais.js';
import { Clube } from '../../clubes/entities/clube.entity.js';
import { calculateLoyaltyTerms } from '../../contratos/index.js';
import { JogadoresService } from '../../jogadores/services/jogadores.service.js';
import { Escalacao } from '../../liga/entities/escalacao.entity.js';
import { ComprarJogadorDto } from '../dto/comprar-jogador.dto.js';
import {
  ListarTransacoesDto,
  parseTiposTransacao,
} from '../dto/listar-transacoes.dto.js';
import {
  CompraResponse,
  ContratoCompraResponse,
  HistoricoTransacoesResponse,
  ResumoTransacoesResponse,
  TransacaoResponse,
  VendaResponse,
} from '../dto/transacao.response.js';
import { Contrato, SituacaoContrato } from '../entities/contrato.entity.js';
import { Jogador } from '../../jogadores/entities/jogador.entity.js';
import { Transacao, TipoTransacao } from '../entities/transacao.entity.js';
import {
  calcularComissaoVenda,
  calcularMultaVenda,
  calcularTaxaCompra,
} from './calculos-mercado.js';

const LIMITE_ELENCO = 12;
const MAXIMO_DIAS_FIDELIDADE = 1_095;
const MILISSEGUNDOS_POR_DIA = 86_400_000;

@Injectable()
export class MercadoService {
  constructor(
    @InjectRepository(Clube)
    private readonly clubesRepository: Repository<Clube>,
    @InjectRepository(Jogador)
    private readonly jogadoresRepository: Repository<Jogador>,
    @InjectRepository(Transacao)
    private readonly transacoesRepository: Repository<Transacao>,
    private readonly dataSource: DataSource,
    private readonly jogadoresService: JogadoresService,
  ) {}

  async comprar(
    jogadorId: number,
    dto: ComprarJogadorDto,
  ): Promise<CompraResponse> {
    const fidelidadeAte = validarDataBrasilia(
      dto.loyalty_until,
      'loyalty_until',
    );

    return this.dataSource.transaction(async (manager) => {
      const jogador = await manager
        .getRepository(Jogador)
        .createQueryBuilder('jogador')
        .setLock('pessimistic_write')
        .where('jogador.id = :jogadorId', { jogadorId })
        .andWhere('jogador.excluido_em IS NULL')
        .getOne();

      if (!jogador) {
        throw new NotFoundException('Jogador não encontrado');
      }

      if (jogador.clubeId !== null) {
        throw new ConflictException('O jogador não está livre');
      }

      const clube = await manager
        .getRepository(Clube)
        .createQueryBuilder('clube')
        .setLock('pessimistic_write')
        .where('clube.id = :clubeId', { clubeId: dto.club_id })
        .getOne();

      if (!clube) {
        throw new NotFoundException('Clube não encontrado');
      }

      const instante = new Date();
      const limiteFidelidade =
        instante.getTime() + MAXIMO_DIAS_FIDELIDADE * MILISSEGUNDOS_POR_DIA;

      if (
        fidelidadeAte.getTime() <= instante.getTime() ||
        fidelidadeAte.getTime() > limiteFidelidade
      ) {
        throw new BadRequestException(
          'loyalty_until deve ser futuro e estar até 1.095 dias à frente',
        );
      }

      const contratosRepository = manager.getRepository(Contrato);
      const recompraProibida = await contratosRepository.existsBy({
        jogadorId,
        clubeId: clube.id,
        situacao: In([SituacaoContrato.Encerrado, SituacaoContrato.Rescindido]),
      });

      if (recompraProibida) {
        throw new ConflictException(
          'Este clube não pode comprar novamente um jogador que já vendeu',
        );
      }

      const jogadoresNoElenco = await manager.getRepository(Jogador).countBy({
        clubeId: clube.id,
        excluidoEm: IsNull(),
      });

      if (jogadoresNoElenco >= LIMITE_ELENCO) {
        throw new ConflictException('O clube já possui 12 jogadores');
      }

      const valorEmCentavos =
        this.jogadoresService.calculateMarketValueInCents(jogador);
      const taxaEmCentavos = calcularTaxaCompra(valorEmCentavos);
      const custoEmCentavos = valorEmCentavos + taxaEmCentavos;
      const caixaAnteriorEmCentavos = decimalParaCentavos(clube.caixa);

      if (custoEmCentavos * 2 > caixaAnteriorEmCentavos) {
        throw new ConflictException(
          'O custo total da compra não pode ultrapassar metade do caixa atual',
        );
      }

      const novoCaixaEmCentavos = caixaAnteriorEmCentavos - custoEmCentavos;
      const contrato = contratosRepository.create({
        jogadorId: jogador.id,
        clubeId: clube.id,
        valorCompra: centavosParaDecimal(valorEmCentavos),
        fidelidadeAte,
        situacao: SituacaoContrato.Ativo,
        encerradoEm: null,
      });

      jogador.clubeId = clube.id;
      clube.caixa = centavosParaDecimal(novoCaixaEmCentavos);
      const transacao = manager.getRepository(Transacao).create({
        clubeId: clube.id,
        jogadorId: jogador.id,
        nomeJogador: jogador.nome,
        tipo: TipoTransacao.Compra,
        valor: centavosParaDecimal(valorEmCentavos),
        taxa: centavosParaDecimal(taxaEmCentavos),
        multa: centavosParaDecimal(0),
        lucro: null,
        variacaoCaixa: centavosParaDecimal(-custoEmCentavos),
      });

      await manager.getRepository(Jogador).save(jogador);
      await manager.getRepository(Clube).save(clube);
      const contratoSalvo = await contratosRepository.save(contrato);
      const transacaoSalva = await manager
        .getRepository(Transacao)
        .save(transacao);

      return Object.assign(
        new CompraResponse(),
        this.apresentarTransacao(transacaoSalva),
        {
          contract: this.apresentarContratoCompra(contratoSalvo),
          club_cash: centavosParaNumero(novoCaixaEmCentavos),
        },
      );
    });
  }

  async vender(jogadorId: number): Promise<VendaResponse> {
    return this.dataSource.transaction(async (manager) => {
      const jogadoresRepository = manager.getRepository(Jogador);
      const jogador = await jogadoresRepository
        .createQueryBuilder('jogador')
        .setLock('pessimistic_write')
        .where('jogador.id = :jogadorId', { jogadorId })
        .andWhere('jogador.excluido_em IS NULL')
        .getOne();

      if (!jogador) {
        throw new NotFoundException('Jogador não encontrado');
      }

      if (jogador.clubeId === null) {
        throw new ConflictException('Jogador livre não pode ser vendido');
      }

      const clube = await manager
        .getRepository(Clube)
        .createQueryBuilder('clube')
        .setLock('pessimistic_write')
        .where('clube.id = :clubeId', { clubeId: jogador.clubeId })
        .getOne();

      if (!clube) {
        throw new NotFoundException('Clube não encontrado');
      }

      const contratoRepository = manager.getRepository(Contrato);
      const contrato = await contratoRepository.findOne({
        where: {
          jogadorId,
          clubeId: clube.id,
          situacao: SituacaoContrato.Ativo,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!contrato) {
        throw new ConflictException('O jogador não possui contrato ativo');
      }

      const instante = new Date();
      const valorEmCentavos =
        this.jogadoresService.calculateMarketValueInCents(jogador);
      const valorCompraEmCentavos = decimalParaCentavos(contrato.valorCompra);
      const lucroEmCentavos = valorEmCentavos - valorCompraEmCentavos;
      const { remainingDays: diasRestantes, penaltyRate: percentualMulta } =
        calculateLoyaltyTerms(contrato.fidelidadeAte, instante);
      const multaEmCentavos = calcularMultaVenda(
        valorEmCentavos,
        percentualMulta,
      );
      const comissaoEmCentavos = calcularComissaoVenda(lucroEmCentavos);
      const variacaoCaixaEmCentavos =
        valorEmCentavos - multaEmCentavos - comissaoEmCentavos;
      const novoCaixaEmCentavos =
        decimalParaCentavos(clube.caixa) + variacaoCaixaEmCentavos;
      const situacao =
        multaEmCentavos > 0
          ? SituacaoContrato.Rescindido
          : SituacaoContrato.Encerrado;

      contrato.situacao = situacao;
      contrato.encerradoEm = instante;
      jogador.clubeId = null;
      clube.caixa = centavosParaDecimal(novoCaixaEmCentavos);

      const transacao = manager.getRepository(Transacao).create({
        clubeId: clube.id,
        jogadorId: jogador.id,
        nomeJogador: jogador.nome,
        tipo: TipoTransacao.Venda,
        valor: centavosParaDecimal(valorEmCentavos),
        taxa: centavosParaDecimal(comissaoEmCentavos),
        multa: centavosParaDecimal(multaEmCentavos),
        lucro: centavosParaDecimal(lucroEmCentavos),
        variacaoCaixa: centavosParaDecimal(variacaoCaixaEmCentavos),
      });

      await jogadoresRepository.save(jogador);
      await manager.getRepository(Clube).save(clube);
      await contratoRepository.save(contrato);
      await manager.delete(Escalacao, { jogadorId });
      const transacaoSalva = await manager
        .getRepository(Transacao)
        .save(transacao);

      return Object.assign(
        new VendaResponse(),
        this.apresentarTransacao(transacaoSalva),
        {
          purchase_value: centavosParaNumero(valorCompraEmCentavos),
          remaining_days: diasRestantes,
          penalty_rate: percentualMulta,
          contract_status: situacao,
          club_cash: centavosParaNumero(novoCaixaEmCentavos),
        },
      );
    });
  }

  async listarTransacoes(
    clubeId: number,
    filtros: ListarTransacoesDto,
  ): Promise<HistoricoTransacoesResponse> {
    if (!(await this.clubesRepository.existsBy({ id: clubeId }))) {
      throw new NotFoundException('Clube não encontrado');
    }

    const jogadorId =
      filtros.player_id === undefined ? undefined : Number(filtros.player_id);

    if (
      jogadorId !== undefined &&
      !(await this.jogadoresRepository.existsBy({ id: jogadorId }))
    ) {
      throw new NotFoundException('Jogador não encontrado');
    }

    const tipos = parseTiposTransacao(filtros.type);
    const transacoes = await this.transacoesRepository.find({
      where: {
        clubeId,
        ...(jogadorId === undefined ? {} : { jogadorId }),
        ...(tipos === undefined ? {} : { tipo: In(tipos) }),
      },
      order: { criadoEm: 'DESC', id: 'DESC' },
    });

    const resumo = this.somarTransacoes(transacoes);

    return {
      data: transacoes.map((transacao) => this.apresentarTransacao(transacao)),
      summary: resumo,
    };
  }

  private somarTransacoes(
    transacoes: readonly Transacao[],
  ): ResumoTransacoesResponse {
    const totais = {
      totalSpent: 0,
      totalReceived: 0,
      totalFees: 0,
      totalPenalties: 0,
      totalProfit: 0,
    };

    for (const transacao of transacoes) {
      const valor = decimalParaCentavos(transacao.valor);
      const taxa = decimalParaCentavos(transacao.taxa);
      const multa = decimalParaCentavos(transacao.multa);
      const lucro =
        transacao.lucro === null ? 0 : decimalParaCentavos(transacao.lucro);
      const variacaoCaixa = decimalParaCentavos(transacao.variacaoCaixa);

      totais.totalFees += taxa;

      if (transacao.tipo === TipoTransacao.Compra) {
        totais.totalSpent += valor + taxa;
      } else {
        totais.totalReceived += variacaoCaixa;
        totais.totalPenalties += multa;
        totais.totalProfit += lucro;
      }
    }

    return {
      total_spent: centavosParaNumero(totais.totalSpent),
      total_received: centavosParaNumero(totais.totalReceived),
      total_fees: centavosParaNumero(totais.totalFees),
      total_penalties: centavosParaNumero(totais.totalPenalties),
      total_profit: centavosParaNumero(totais.totalProfit),
    };
  }

  private apresentarContratoCompra(contrato: Contrato): ContratoCompraResponse {
    return {
      purchase_value: Number(contrato.valorCompra),
      loyalty_until: formatarDataBrasilia(contrato.fidelidadeAte),
      status: contrato.situacao,
    };
  }

  private apresentarTransacao(transacao: Transacao): TransacaoResponse {
    return {
      id: transacao.id,
      club_id: transacao.clubeId,
      player_id: transacao.jogadorId,
      player_name: transacao.nomeJogador,
      type: transacao.tipo,
      value: Number(transacao.valor),
      fee: Number(transacao.taxa),
      penalty: Number(transacao.multa),
      profit: transacao.lucro === null ? null : Number(transacao.lucro),
      cash_change: Number(transacao.variacaoCaixa),
      created_at: formatarDataBrasilia(transacao.criadoEm),
    };
  }
}
