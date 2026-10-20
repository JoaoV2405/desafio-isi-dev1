import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { Clube } from '../../clubes/entities/clube.entity.js';
import {
  CondicaoJogador,
  Jogador,
  PosicaoJogador,
} from '../../jogadores/entities/jogador.entity.js';
import { Partida } from './partida.entity.js';

export enum AtributoDuelo {
  Finalizacao = 'shooting',
  Passe = 'passing',
  Drible = 'dribbling',
  Defesa = 'defending',
}

export type CondicaoDuelo =
  CondicaoJogador.Apto | CondicaoJogador.MalCondicionado;

@Entity({ name: 'duelos_partida' })
@Unique('uq_duelos_partida_ordem', ['partidaId', 'ordem'])
@Index('idx_duelos_partida_clube_atacante_id', ['clubeAtacanteId'])
@Index('idx_duelos_partida_atacante_id', ['atacanteId'])
@Index('idx_duelos_partida_defensor_id', ['defensorId'])
@Check('ck_duelos_partida_ordem', '"ordem" BETWEEN 1 AND 6')
@Check(
  'ck_duelos_partida_jogadores_distintos',
  '"atacante_id" <> "defensor_id"',
)
@Check(
  'ck_duelos_partida_nome_atacante',
  'char_length("nome_atacante") BETWEEN 3 AND 100',
)
@Check(
  'ck_duelos_partida_nome_defensor',
  'char_length("nome_defensor") BETWEEN 3 AND 100',
)
@Check(
  'ck_duelos_partida_posicao_atacante',
  `"posicao_atacante" IN ('ZAG', 'LAT', 'MEI', 'ATA')`,
)
@Check(
  'ck_duelos_partida_posicao_defensor',
  `"posicao_defensor" IN ('GOL', 'ZAG', 'LAT', 'MEI', 'ATA')`,
)
@Check(
  'ck_duelos_partida_defensor_por_ordem',
  `("ordem" IN (1, 4) AND "posicao_defensor" = 'GOL') OR ("ordem" IN (2, 3, 5, 6) AND "posicao_defensor" <> 'GOL')`,
)
@Check(
  'ck_duelos_partida_condicao_atacante',
  `"condicao_atacante" IN ('APTO', 'MAL_CONDICIONADO')`,
)
@Check(
  'ck_duelos_partida_condicao_defensor',
  `"condicao_defensor" IN ('APTO', 'MAL_CONDICIONADO')`,
)
@Check(
  'ck_duelos_partida_atributo_ataque',
  `("posicao_atacante" = 'ATA' AND "atributo_ataque" = 'shooting') OR ("posicao_atacante" = 'MEI' AND "atributo_ataque" = 'passing') OR ("posicao_atacante" IN ('ZAG', 'LAT') AND "atributo_ataque" = 'dribbling')`,
)
@Check('ck_duelos_partida_atributo_defesa', `"atributo_defesa" = 'defending'`)
@Check(
  'ck_duelos_partida_valor_ataque',
  `"valor_ataque" BETWEEN 1 AND CASE WHEN "condicao_atacante" = 'MAL_CONDICIONADO' THEN 84 ELSE 99 END`,
)
@Check(
  'ck_duelos_partida_valor_defesa',
  `"valor_defesa" BETWEEN 1 AND CASE WHEN "condicao_defensor" = 'MAL_CONDICIONADO' THEN 84 ELSE 99 END`,
)
@Check('ck_duelos_partida_gol', '"gol" = ("valor_ataque" > "valor_defesa")')
export class DueloPartida {
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    type: 'integer',
    generatedIdentity: 'BY DEFAULT',
    primaryKeyConstraintName: 'pk_duelos_partida',
  })
  id: number;

  @Column({ name: 'partida_id', type: 'integer' })
  partidaId: number;

  @Column({ name: 'ordem', type: 'integer' })
  ordem: number;

  @Column({ name: 'clube_atacante_id', type: 'integer' })
  clubeAtacanteId: number;

  @Column({ name: 'atacante_id', type: 'integer' })
  atacanteId: number;

  @Column({ name: 'defensor_id', type: 'integer' })
  defensorId: number;

  @Column({ name: 'nome_atacante', type: 'varchar', length: 100 })
  nomeAtacante: string;

  @Column({ name: 'nome_defensor', type: 'varchar', length: 100 })
  nomeDefensor: string;

  @Column({ name: 'posicao_atacante', type: 'varchar', length: 3 })
  posicaoAtacante: Exclude<PosicaoJogador, PosicaoJogador.Goleiro>;

  @Column({ name: 'posicao_defensor', type: 'varchar', length: 3 })
  posicaoDefensor: PosicaoJogador;

  @Column({ name: 'condicao_atacante', type: 'varchar', length: 20 })
  condicaoAtacante: CondicaoDuelo;

  @Column({ name: 'condicao_defensor', type: 'varchar', length: 20 })
  condicaoDefensor: CondicaoDuelo;

  @Column({ name: 'atributo_ataque', type: 'varchar', length: 10 })
  atributoAtaque: Exclude<AtributoDuelo, AtributoDuelo.Defesa>;

  @Column({ name: 'atributo_defesa', type: 'varchar', length: 10 })
  atributoDefesa: AtributoDuelo.Defesa;

  @Column({ name: 'valor_ataque', type: 'integer' })
  valorAtaque: number;

  @Column({ name: 'valor_defesa', type: 'integer' })
  valorDefesa: number;

  @Column({ name: 'gol', type: 'boolean' })
  gol: boolean;

  @ManyToOne(() => Partida, (partida) => partida.duelos, {
    cascade: false,
    eager: false,
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'partida_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_duelos_partida_partida',
  })
  partida: Relation<Partida>;

  @ManyToOne(() => Clube, {
    cascade: false,
    eager: false,
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'clube_atacante_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_duelos_partida_clube_atacante',
  })
  clubeAtacante: Relation<Clube>;

  @ManyToOne(() => Jogador, {
    cascade: false,
    eager: false,
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'atacante_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_duelos_partida_atacante',
  })
  atacante: Relation<Jogador>;

  @ManyToOne(() => Jogador, {
    cascade: false,
    eager: false,
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'defensor_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_duelos_partida_defensor',
  })
  defensor: Relation<Jogador>;
}
