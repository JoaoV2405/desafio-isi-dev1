import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Clube } from '../../clubes/entities/clube.entity.js';
import { Jogador } from '../../jogadores/entities/jogador.entity.js';

export enum TipoTransacao {
  Compra = 'COMPRA',
  Venda = 'VENDA',
}

@Entity({ name: 'transacoes' })
@Index('idx_transacoes_clube_criado_em_id', () => ({
  clubeId: 1,
  criadoEm: -1,
  id: -1,
}))
@Index('idx_transacoes_jogador_id', ['jogadorId'])
@Check('ck_transacoes_tipo', `"tipo" IN ('COMPRA', 'VENDA')`)
@Check('ck_transacoes_valor_positivo', '"valor" > 0')
@Check('ck_transacoes_taxa_nao_negativa', '"taxa" >= 0')
@Check('ck_transacoes_multa_nao_negativa', '"multa" >= 0')
@Check(
  'ck_transacoes_campos_por_tipo',
  `("tipo" = 'COMPRA' AND "multa" = 0 AND "lucro" IS NULL) OR ("tipo" = 'VENDA' AND "lucro" IS NOT NULL)`,
)
export class Transacao {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_transacoes',
  })
  id: number;

  @Column({ name: 'clube_id', type: 'integer' })
  clubeId: number;

  @Column({ name: 'jogador_id', type: 'integer' })
  jogadorId: number;

  @Column({ name: 'nome_jogador', type: 'varchar', length: 100 })
  nomeJogador: string;

  @Column({ name: 'tipo', type: 'varchar', length: 6 })
  tipo: TipoTransacao;

  @Column({ name: 'valor', type: 'decimal', precision: 6, scale: 2 })
  valor: string;

  @Column({ name: 'taxa', type: 'decimal', precision: 6, scale: 2 })
  taxa: string;

  @Column({ name: 'multa', type: 'decimal', precision: 6, scale: 2 })
  multa: string;

  @Column({
    name: 'lucro',
    type: 'decimal',
    precision: 7,
    scale: 2,
    nullable: true,
  })
  lucro: string | null;

  @Column({ name: 'variacao_caixa', type: 'decimal', precision: 8, scale: 2 })
  variacaoCaixa: string;

  @CreateDateColumn({
    name: 'criado_em',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  criadoEm: Date;

  @ManyToOne(() => Clube, {
    cascade: false,
    eager: false,
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'clube_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_transacoes_clube',
  })
  clube: Relation<Clube>;

  @ManyToOne(() => Jogador, {
    cascade: false,
    eager: false,
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'jogador_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_transacoes_jogador',
  })
  jogador: Relation<Jogador>;
}
