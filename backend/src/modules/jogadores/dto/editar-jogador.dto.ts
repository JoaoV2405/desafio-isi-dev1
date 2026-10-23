import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsInt, Max, Min } from 'class-validator';
import { NormalizarTexto } from '../../../core/validation/normalizar-texto.transform.js';
import { PosicaoJogador } from '../entities/jogador.entity.js';
import { IsNomeJogador } from '../validators/jogador-input.validator.js';

export class EditarJogadorDto {
  @ApiProperty({
    type: String,
    description: 'Nome completo normalizado do jogador',
    example: 'Meia Lua',
    minLength: 3,
    maxLength: 100,
  })
  @IsDefined()
  @NormalizarTexto()
  @IsNomeJogador()
  readonly name: string;

  @ApiProperty({
    type: String,
    description: 'Nova posição esportiva do jogador',
    enum: PosicaoJogador,
    example: PosicaoJogador.Meia,
  })
  @IsDefined()
  @IsEnum(PosicaoJogador)
  readonly position: PosicaoJogador;

  @ApiProperty({
    type: Number,
    description: 'Nova agilidade do jogador',
    example: 85,
    minimum: 1,
    maximum: 100,
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly agility: number;

  @ApiProperty({
    type: Number,
    description: 'Nova idade do jogador',
    example: 26,
    minimum: 16,
    maximum: 45,
  })
  @IsDefined()
  @IsInt()
  @Min(16)
  @Max(45)
  readonly age: number;

  constructor(
    name: string,
    position: PosicaoJogador,
    agility: number,
    age: number,
  ) {
    this.name = name;
    this.position = position;
    this.agility = agility;
    this.age = age;
  }
}
