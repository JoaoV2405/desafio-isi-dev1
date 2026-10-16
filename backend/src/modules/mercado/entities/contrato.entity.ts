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

export enum SituacaoContrato {
  Ativo = 'ATIVO',
  Encerrado = 'ENCERRADO',
  Rescindido = 'RESCINDIDO',
}

@Entity({ name: 'contratos' })
@Index('idx_contratos_jogador_id', ['jogadorId'])
@Index('idx_contratos_clube_id', ['clubeId'])
@Index('uq_contratos_jogador_ativo', ['jogadorId'], {
  unique: true,
  where: '"situacao" = \'ATIVO\'',
})
@Check('ck_contratos_valor_compra_positivo', '"valor_compra" > 0')
@Check(
  'ck_contratos_situacao',
  `"situacao" IN ('ATIVO', 'ENCERRADO', 'RESCINDIDO')`,
)
@Check(
  'ck_contratos_encerramento',
  `("situacao" = 'ATIVO' AND "encerrado_em" IS NULL) OR ("situacao" IN ('ENCERRADO', 'RESCINDIDO') AND "encerrado_em" IS NOT NULL)`,
)
export class Contrato {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_contratos',
  })
  id: number;

  @Column({ name: 'jogador_id', type: 'integer' })
  jogadorId: number;

  @Column({ name: 'clube_id', type: 'integer' })
  clubeId: number;

  @Column({ name: 'valor_compra', type: 'decimal', precision: 6, scale: 2 })
  valorCompra: string;

  @Column({ name: 'fidelidade_ate', type: 'timestamptz' })
  fidelidadeAte: Date;

  @Column({ name: 'situacao', type: 'varchar', length: 10 })
  situacao: SituacaoContrato;

  @CreateDateColumn({
    name: 'iniciado_em',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  iniciadoEm: Date;

  @Column({ name: 'encerrado_em', type: 'timestamptz', nullable: true })
  encerradoEm: Date | null;

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
    foreignKeyConstraintName: 'fk_contratos_jogador',
  })
  jogador: Relation<Jogador>;

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
    foreignKeyConstraintName: 'fk_contratos_clube',
  })
  clube: Relation<Clube>;
}
