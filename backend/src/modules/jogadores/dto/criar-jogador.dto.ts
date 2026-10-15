import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsInt, Max, Min } from 'class-validator';
import { NormalizarTexto } from '../../../core/validation/normalizar-texto.transform.js';
import { PosicaoJogador } from '../entities/jogador.entity.js';
import { IsNomeJogador } from './jogador-input.validator.js';

export class CriarJogadorDto {
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
    description: 'Posição esportiva do jogador',
    enum: PosicaoJogador,
    example: PosicaoJogador.Meia,
  })
  @IsDefined()
  @IsEnum(PosicaoJogador)
  readonly position: PosicaoJogador;

  @ApiProperty({
    type: Number,
    description: 'Agilidade do jogador',
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
    description: 'Idade atual do jogador',
    example: 25,
    minimum: 16,
    maximum: 45,
  })
  @IsDefined()
  @IsInt()
  @Min(16)
  @Max(45)
  readonly age: number;

  @ApiProperty({
    type: Number,
    description: 'Atributo de velocidade',
    example: 70,
    minimum: 1,
    maximum: 99,
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(99)
  readonly pace: number;

  @ApiProperty({
    type: Number,
    description: 'Atributo de finalização',
    example: 68,
    minimum: 1,
    maximum: 99,
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(99)
  readonly shooting: number;

  @ApiProperty({
    type: Number,
    description: 'Atributo de passe',
    example: 82,
    minimum: 1,
    maximum: 99,
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(99)
  readonly passing: number;

  @ApiProperty({
    type: Number,
    description: 'Atributo de drible',
    example: 79,
    minimum: 1,
    maximum: 99,
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(99)
  readonly dribbling: number;

  @ApiProperty({
    type: Number,
    description: 'Atributo de defesa',
    example: 55,
    minimum: 1,
    maximum: 99,
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(99)
  readonly defending: number;

  @ApiProperty({
    type: Number,
    description: 'Atributo físico',
    example: 64,
    minimum: 1,
    maximum: 99,
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(99)
  readonly physical: number;

  @ApiProperty({
    type: Number,
    description: 'Potencial esportivo do jogador',
    example: 86,
    minimum: 1,
    maximum: 99,
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(99)
  readonly potential: number;

  constructor(
    name: string,
    position: PosicaoJogador,
    agility: number,
    age: number,
    pace: number,
    shooting: number,
    passing: number,
    dribbling: number,
    defending: number,
    physical: number,
    potential: number,
  ) {
    this.name = name;
    this.position = position;
    this.agility = agility;
    this.age = age;
    this.pace = pace;
    this.shooting = shooting;
    this.passing = passing;
    this.dribbling = dribbling;
    this.defending = defending;
    this.physical = physical;
    this.potential = potential;
  }
}
