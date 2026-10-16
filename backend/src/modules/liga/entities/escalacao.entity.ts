import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { Clube } from '../../clubes/entities/clube.entity.js';
import { Jogador } from '../../jogadores/entities/jogador.entity.js';

@Entity({ name: 'escalacoes' })
@Unique('uq_escalacoes_jogador_id', ['jogadorId'])
export class Escalacao {
  @PrimaryColumn({ name: 'clube_id', type: 'integer' })
  clubeId: number;

  @PrimaryColumn({ name: 'jogador_id', type: 'integer' })
  jogadorId: number;

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
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'clube_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_escalacoes_clube',
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
    foreignKeyConstraintName: 'fk_escalacoes_jogador',
  })
  jogador: Relation<Jogador>;
}
