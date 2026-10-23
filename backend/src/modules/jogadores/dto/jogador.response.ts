import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CondicaoJogador, PosicaoJogador } from '../entities/jogador.entity.js';

export class JogadorResponse {
  @ApiProperty({
    type: Number,
    description: 'Identificador do jogador',
    example: 2,
  })
  id: number;

  @ApiProperty({
    type: String,
    description: 'Nome do jogador',
    example: 'Meia Lua',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'Posição esportiva',
    enum: PosicaoJogador,
  })
  position: PosicaoJogador;

  @ApiProperty({
    type: Number,
    description: 'Agilidade do jogador',
    example: 85,
  })
  agility: number;

  @ApiProperty({ type: Number, description: 'Idade do jogador', example: 25 })
  age: number;

  @ApiProperty({
    type: String,
    description: 'Condição física',
    enum: CondicaoJogador,
  })
  condition: CondicaoJogador;

  @ApiProperty({
    type: Number,
    description: 'Valor base calculado no cadastro',
    example: 40,
  })
  base_value: number;

  @ApiProperty({
    type: Number,
    description: 'Valor de mercado atual',
    example: 37,
  })
  market_value: number;

  @ApiProperty({
    type: Number,
    description: 'Atributo de velocidade',
    example: 70,
  })
  pace: number;

  @ApiProperty({
    type: Number,
    description: 'Atributo de finalização',
    example: 68,
  })
  shooting: number;

  @ApiProperty({ type: Number, description: 'Atributo de passe', example: 82 })
  passing: number;

  @ApiProperty({ type: Number, description: 'Atributo de drible', example: 79 })
  dribbling: number;

  @ApiProperty({ type: Number, description: 'Atributo de defesa', example: 55 })
  defending: number;

  @ApiProperty({ type: Number, description: 'Atributo físico', example: 64 })
  physical: number;

  @ApiProperty({
    type: Number,
    description: 'Potencial esportivo',
    example: 86,
  })
  potential: number;

  @ApiProperty({ type: Number, description: 'Overall calculado', example: 75 })
  overall: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Identificador do clube atual ou nulo quando livre',
    nullable: true,
    example: null,
  })
  club_id: number | null;
}

export class MetaJogadoresResponse {
  @ApiProperty({ type: Number, description: 'Página atual', example: 1 })
  page: number;

  @ApiProperty({ type: Number, description: 'Itens por página', example: 10 })
  limit: number;

  @ApiProperty({
    type: Number,
    description: 'Total de jogadores encontrados',
    example: 1,
  })
  total_items: number;

  @ApiProperty({ type: Number, description: 'Total de páginas', example: 1 })
  total_pages: number;
}

export class ListaJogadoresResponse {
  @ApiProperty({
    type: [JogadorResponse],
    description: 'Jogadores da página atual',
  })
  data: JogadorResponse[];

  @ApiProperty({
    type: MetaJogadoresResponse,
    description: 'Metadados da paginação',
  })
  meta: MetaJogadoresResponse;
}
