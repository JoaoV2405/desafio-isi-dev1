import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { FormacaoClube } from '../../clubes/entities/clube.entity.js';

export class SubstituirEscalacaoDto {
  @ApiProperty({
    type: String,
    description: 'Formação dos quatro jogadores de linha',
    enum: FormacaoClube,
    example: '2-1-1',
  })
  @IsEnum(FormacaoClube)
  formation: FormacaoClube;

  @ApiProperty({
    type: [Number],
    description:
      'Cinco identificadores inteiros positivos distintos, em qualquer ordem',
    minItems: 5,
    maxItems: 5,
    uniqueItems: true,
    example: [1, 2, 3, 4, 5],
  })
  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  player_ids: number[];
}
