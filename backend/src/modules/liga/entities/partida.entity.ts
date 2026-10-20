import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Clube, FormacaoClube } from '../../clubes/entities/clube.entity.js';
import { DueloPartida } from './duelo-partida.entity.js';

@Entity({ name: 'partidas' })
@Index('idx_partidas_jogada_em_id', () => ({ jogadaEm: -1, id: -1 }))
@Index('idx_partidas_mandante_jogada_em_id', () => ({
  mandanteId: 1,
  jogadaEm: -1,
  id: -1,
}))
@Index('idx_partidas_visitante_jogada_em_id', () => ({
  visitanteId: 1,
  jogadaEm: -1,
  id: -1,
}))
@Check('ck_partidas_clubes_distintos', '"mandante_id" <> "visitante_id"')
@Check('ck_partidas_gols_mandante', '"gols_mandante" BETWEEN 0 AND 3')
@Check('ck_partidas_gols_visitante', '"gols_visitante" BETWEEN 0 AND 3')
@Check(
  'ck_partidas_formacao_mandante',
  `"formacao_mandante" IN ('3-1', '2-2', '2-1-1', '1-2-1')`,
)
@Check(
  'ck_partidas_formacao_visitante',
  `"formacao_visitante" IN ('3-1', '2-2', '2-1-1', '1-2-1')`,
)
export class Partida {
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    type: 'integer',
    generatedIdentity: 'BY DEFAULT',
    primaryKeyConstraintName: 'pk_partidas',
  })
  id: number;

  @Column({ name: 'mandante_id', type: 'integer' })
  mandanteId: number;

  @Column({ name: 'visitante_id', type: 'integer' })
  visitanteId: number;

  @Column({ name: 'gols_mandante', type: 'integer' })
  golsMandante: number;

  @Column({ name: 'gols_visitante', type: 'integer' })
  golsVisitante: number;

  @Column({ name: 'formacao_mandante', type: 'varchar', length: 5 })
  formacaoMandante: FormacaoClube;

  @Column({ name: 'formacao_visitante', type: 'varchar', length: 5 })
  formacaoVisitante: FormacaoClube;

  @CreateDateColumn({
    name: 'jogada_em',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  jogadaEm: Date;

  @ManyToOne(() => Clube, {
    cascade: false,
    eager: false,
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'mandante_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_partidas_mandante',
  })
  mandante: Relation<Clube>;

  @ManyToOne(() => Clube, {
    cascade: false,
    eager: false,
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'visitante_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_partidas_visitante',
  })
  visitante: Relation<Clube>;

  @OneToMany(() => DueloPartida, (duelo) => duelo.partida, {
    cascade: false,
    eager: false,
  })
  duelos: Relation<DueloPartida[]>;
}
