import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';
import { NormalizarTexto } from '../../../core/validation/normalizar-texto.transform.js';

export class CriarClubeDto {
  @ApiProperty({
    type: String,
    description: 'Nome normalizado do clube',
    example: 'Águias Futebol Clube',
  })
  @IsDefined()
  @NormalizarTexto()
  @IsString()
  readonly name: string;

  @ApiProperty({
    type: String,
    description: 'Sigla de três letras maiúsculas do clube',
    example: 'AFC',
  })
  @IsDefined()
  @IsString()
  readonly acronym: string;

  constructor(name: string, acronym: string) {
    this.name = name;
    this.acronym = acronym;
  }
}
