import { decimalParaCentavos } from '../../../core/money/conversoes-monetarias.js';
import {
  type FiltrosJogadores,
  type ListarJogadoresDto,
  type OrdenacaoJogadores,
} from '../dto/listar-jogadores.dto.js';

const IDADE_MINIMA = 16;
const IDADE_MAXIMA = 45;
const VALOR_MAXIMO_CENTAVOS = 55_000;

export class FiltrosJogadoresMapper {
  static fromDto(dto: ListarJogadoresDto): FiltrosJogadores {
    return {
      search: dto.search,
      position: dto.position,
      condition: dto.condition,
      free: dto.free === undefined ? undefined : dto.free === 'true',
      clubId: this.toOptionalNumber(dto.club_id),
      minAge: this.toOptionalNumber(dto.min_age) ?? IDADE_MINIMA,
      maxAge: this.toOptionalNumber(dto.max_age) ?? IDADE_MAXIMA,
      minValueInCents: this.toOptionalCents(dto.min_value) ?? 0,
      maxValueInCents:
        this.toOptionalCents(dto.max_value) ?? VALOR_MAXIMO_CENTAVOS,
      sort: this.toSort(dto.sort),
      page: this.toOptionalNumber(dto.page) ?? 1,
      limit: this.toOptionalNumber(dto.limit) ?? 10,
    };
  }

  private static toOptionalNumber(value?: string): number | undefined {
    return value === undefined ? undefined : Number(value);
  }

  private static toOptionalCents(value?: string): number | undefined {
    if (value === undefined) {
      return undefined;
    }

    return decimalParaCentavos(value);
  }

  private static toSort(value?: string): readonly OrdenacaoJogadores[] {
    return value === undefined
      ? ['name']
      : (value.split(',') as OrdenacaoJogadores[]);
  }
}
