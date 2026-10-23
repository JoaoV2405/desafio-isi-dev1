import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { NormalizarTexto } from '../../../core/validation/normalizar-texto.transform.js';
import {
  IsDecimalQuery,
  IsIntegerQuery,
} from '../../../core/validation/query-value.validator.js';
import { CondicaoJogador, PosicaoJogador } from '../entities/jogador.entity.js';
import { IsOrdenacaoJogadores } from '../validators/jogador-input.validator.js';
import type { OrdenacaoJogadores } from './ordenacao-jogadores.js';

export {
  ORDENACOES_JOGADORES,
  type OrdenacaoJogadores,
} from './ordenacao-jogadores.js';

export class ListarJogadoresDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Trecho normalizado procurado no nome do jogador',
    minLength: 2,
    maxLength: 100,
    example: 'João Silva',
  })
  @IsOptional()
  @NormalizarTexto()
  @IsString()
  @Length(2, 100)
  @Matches(/^[^\p{Cc}]*$/u)
  readonly search?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Posição esportiva filtrada',
    enum: PosicaoJogador,
    example: PosicaoJogador.Meia,
  })
  @IsOptional()
  @IsEnum(PosicaoJogador)
  readonly position?: PosicaoJogador;

  @ApiPropertyOptional({
    type: String,
    description: 'Condição física filtrada',
    enum: CondicaoJogador,
    example: CondicaoJogador.Apto,
  })
  @IsOptional()
  @IsEnum(CondicaoJogador)
  readonly condition?: CondicaoJogador;

  @ApiPropertyOptional({
    type: String,
    description: 'Filtra jogadores livres ou vinculados',
    enum: ['true', 'false'],
    example: 'true',
  })
  @IsOptional()
  @IsIn(['true', 'false'])
  readonly free?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Identificador positivo do clube',
    pattern: '^[1-9]\\d*$',
    example: '4',
  })
  @IsOptional()
  @IsIntegerQuery({ min: 1, max: 2_147_483_647 })
  readonly club_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Idade mínima inclusiva',
    pattern: '^[1-9]\\d*$',
    example: '16',
  })
  @IsOptional()
  @IsIntegerQuery({ min: 16, max: 45 })
  readonly min_age?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Idade máxima inclusiva',
    pattern: '^[1-9]\\d*$',
    example: '45',
  })
  @IsOptional()
  @IsIntegerQuery({ min: 16, max: 45 })
  readonly max_age?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Valor de mercado mínimo com até duas casas decimais',
    pattern: '^(?:0|[1-9]\\d*)(?:\\.\\d{1,2})?$',
    example: '10.50',
  })
  @IsOptional()
  @IsDecimalQuery({ min: 0, max: 550 })
  readonly min_value?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Valor de mercado máximo com até duas casas decimais',
    pattern: '^(?:0|[1-9]\\d*)(?:\\.\\d{1,2})?$',
    example: '550',
  })
  @IsOptional()
  @IsDecimalQuery({ min: 0, max: 550 })
  readonly max_value?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Até dois critérios de ordenação separados por vírgula',
    example: 'value_desc,age_asc',
  })
  @IsOptional()
  @IsOrdenacaoJogadores()
  readonly sort?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Página positiva solicitada',
    pattern: '^[1-9]\\d*$',
    default: '1',
    example: '1',
  })
  @IsOptional()
  @IsIntegerQuery({ min: 1, max: 2_147_483_647 })
  readonly page?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Quantidade de jogadores por página',
    pattern: '^[1-9]\\d*$',
    default: '10',
    example: '10',
  })
  @IsOptional()
  @IsIntegerQuery({ min: 1, max: 50 })
  readonly limit?: string;
}

export type FiltrosJogadores = {
  search: string | undefined;
  position: PosicaoJogador | undefined;
  condition: CondicaoJogador | undefined;
  free: boolean | undefined;
  clubId: number | undefined;
  minAge: number;
  maxAge: number;
  minValueInCents: number;
  maxValueInCents: number;
  sort: readonly OrdenacaoJogadores[];
  page: number;
  limit: number;
};
