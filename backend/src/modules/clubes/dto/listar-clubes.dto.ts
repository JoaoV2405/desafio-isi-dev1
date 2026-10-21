import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum OrdenacaoClubes {
  Nome = 'name',
  PatrimonioCrescente = 'net_worth_asc',
  PatrimonioDecrescente = 'net_worth_desc',
}

export class ListarClubesDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Ordenação dos clubes, com desempate por nome e id',
    enum: OrdenacaoClubes,
    default: OrdenacaoClubes.Nome,
  })
  @IsOptional()
  @IsEnum(OrdenacaoClubes)
  sort?: OrdenacaoClubes;
}
