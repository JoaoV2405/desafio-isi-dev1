import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { Jogador } from '../../jogadores/entities/jogador.entity.js';

export enum FormacaoClube {
  TresUm = '3-1',
  DoisDois = '2-2',
  DoisUmUm = '2-1-1',
  UmDoisUm = '1-2-1',
}

@Entity({ name: 'clubes' })
@Index('uq_clubes_nome_normalizado', { synchronize: false })
@Unique('uq_clubes_sigla', ['sigla'])
@Check('ck_clubes_nome_comprimento', 'char_length("nome") BETWEEN 3 AND 60')
@Check('ck_clubes_caixa_nao_negativo', '"caixa" >= 0')
@Check(
  'ck_clubes_formacao',
  `"formacao" IS NULL OR "formacao" IN ('3-1', '2-2', '2-1-1', '1-2-1')`,
)
export class Clube {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_clubes',
  })
  id: number;

  @Column({ name: 'nome', type: 'varchar', length: 60 })
  nome: string;

  @Column({ name: 'sigla', type: 'char', length: 3 })
  sigla: string;

  @Column({
    name: 'caixa',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 300,
  })
  caixa: string;

  @Column({ name: 'formacao', type: 'varchar', length: 5, nullable: true })
  formacao: FormacaoClube | null;

  @CreateDateColumn({
    name: 'criado_em',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  criadoEm: Date;

  @OneToMany(() => Jogador, (jogador) => jogador.clube, {
    cascade: false,
    eager: false,
  })
  jogadores: Relation<Jogador[]>;
}
