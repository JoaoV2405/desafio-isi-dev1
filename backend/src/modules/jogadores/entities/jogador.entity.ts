import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Clube } from '../../clubes/entities/clube.entity.js';

export enum PosicaoJogador {
  Goleiro = 'GOL',
  Zagueiro = 'ZAG',
  Lateral = 'LAT',
  Meia = 'MEI',
  Atacante = 'ATA',
}

export enum CondicaoJogador {
  Apto = 'APTO',
  MalCondicionado = 'MAL_CONDICIONADO',
  Doente = 'DOENTE',
}

@Entity({ name: 'jogadores' })
@Index('idx_jogadores_posicao_ativos', ['posicao'], {
  where: '"excluido_em" IS NULL',
})
@Index('idx_jogadores_condicao_ativos', ['condicao'], {
  where: '"excluido_em" IS NULL',
})
@Index('idx_jogadores_idade_ativos', ['idade'], {
  where: '"excluido_em" IS NULL',
})
@Check('ck_jogadores_nome_comprimento', 'char_length("nome") BETWEEN 3 AND 100')
@Check(
  'ck_jogadores_posicao',
  `"posicao" IN ('GOL', 'ZAG', 'LAT', 'MEI', 'ATA')`,
)
@Check('ck_jogadores_agilidade', '"agilidade" BETWEEN 1 AND 100')
@Check('ck_jogadores_idade', '"idade" BETWEEN 16 AND 45')
@Check('ck_jogadores_valor_base', '"valor_base" >= 1.00')
@Check(
  'ck_jogadores_condicao',
  `"condicao" IN ('APTO', 'MAL_CONDICIONADO', 'DOENTE')`,
)
@Check('ck_jogadores_velocidade', '"velocidade" BETWEEN 1 AND 99')
@Check('ck_jogadores_finalizacao', '"finalizacao" BETWEEN 1 AND 99')
@Check('ck_jogadores_passe', '"passe" BETWEEN 1 AND 99')
@Check('ck_jogadores_drible', '"drible" BETWEEN 1 AND 99')
@Check('ck_jogadores_defesa', '"defesa" BETWEEN 1 AND 99')
@Check('ck_jogadores_fisico', '"fisico" BETWEEN 1 AND 99')
@Check('ck_jogadores_potencial', '"potencial" BETWEEN 1 AND 99')
@Check(
  'ck_jogadores_soma_atributos',
  '"velocidade" + "finalizacao" + "passe" + "drible" + "defesa" + "fisico" <= 480',
)
@Check(
  'ck_jogadores_potencial_atributos',
  '"potencial" >= GREATEST("velocidade", "finalizacao", "passe", "drible", "defesa", "fisico")',
)
@Check('ck_jogadores_agilidade_idade', '"idade" < 35 OR "agilidade" <= 85')
export class Jogador {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_jogadores',
  })
  id: number;

  @Column({ name: 'nome', type: 'varchar', length: 100 })
  nome: string;

  @Column({ name: 'posicao', type: 'varchar', length: 3 })
  posicao: PosicaoJogador;

  @Column({ name: 'agilidade', type: 'integer' })
  agilidade: number;

  @Column({ name: 'idade', type: 'integer' })
  idade: number;

  @Column({ name: 'valor_base', type: 'decimal', precision: 6, scale: 2 })
  valorBase: string;

  @Column({
    name: 'condicao',
    type: 'varchar',
    length: 17,
    default: CondicaoJogador.Apto,
  })
  condicao: CondicaoJogador;

  @Index('idx_jogadores_clube_id')
  @Column({ name: 'clube_id', type: 'integer', nullable: true })
  clubeId: number | null;

  @Column({ name: 'velocidade', type: 'integer' })
  velocidade: number;

  @Column({ name: 'finalizacao', type: 'integer' })
  finalizacao: number;

  @Column({ name: 'passe', type: 'integer' })
  passe: number;

  @Column({ name: 'drible', type: 'integer' })
  drible: number;

  @Column({ name: 'defesa', type: 'integer' })
  defesa: number;

  @Column({ name: 'fisico', type: 'integer' })
  fisico: number;

  @Column({ name: 'potencial', type: 'integer' })
  potencial: number;

  @DeleteDateColumn({
    name: 'excluido_em',
    type: 'timestamptz',
    nullable: true,
  })
  excluidoEm: Date | null;

  @CreateDateColumn({
    name: 'criado_em',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  criadoEm: Date;

  @UpdateDateColumn({
    name: 'atualizado_em',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  atualizadoEm: Date;

  @ManyToOne(() => Clube, (clube) => clube.jogadores, {
    cascade: false,
    eager: false,
    nullable: true,
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'clube_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_jogadores_clube',
  })
  clube: Relation<Clube> | null;
}
