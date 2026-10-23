import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, registerDecorator } from 'class-validator';
import { IsIntegerQuery } from '../../../core/validation/query-value.validator.js';
import { TipoTransacao } from '../entities/transacao.entity.js';

const TIPOS_TRANSACAO = Object.values(TipoTransacao);

function IsListaTipoTransacao(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    registerDecorator({
      name: 'isListaTipoTransacao',
      target: target.constructor,
      propertyName: String(propertyKey),
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;

          const tipos = value.split(',');

          return (
            tipos.length > 0 &&
            tipos.every((tipo) =>
              TIPOS_TRANSACAO.includes(tipo as TipoTransacao),
            ) &&
            new Set(tipos).size === tipos.length
          );
        },
        defaultMessage(): string {
          return '$property deve conter COMPRA, VENDA ou ambos, sem repetição ou espaços';
        },
      },
    });
  };
}

export class ListarTransacoesDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Filtra por um ou ambos os tipos de transação',
    example: 'COMPRA,VENDA',
  })
  @IsOptional()
  @IsString()
  @IsListaTipoTransacao()
  readonly type?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filtra por um jogador existente e não excluído',
    pattern: '^[1-9]\\d*$',
    example: '2',
  })
  @IsOptional()
  @IsIntegerQuery({ min: 1, max: 2_147_483_647 })
  readonly player_id?: string;
}

export function parseTiposTransacao(
  value: string | undefined,
): readonly TipoTransacao[] | undefined {
  return value === undefined
    ? undefined
    : (value.split(',') as TipoTransacao[]);
}
