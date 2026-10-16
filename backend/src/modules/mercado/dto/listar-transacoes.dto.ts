import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, registerDecorator } from 'class-validator';
import { IsIntegerQuery } from '../../../core/validation/query-value.validator.js';

const TIPOS_TRANSACAO = ['COMPRA', 'VENDA'] as const;

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
              TIPOS_TRANSACAO.includes(tipo as (typeof TIPOS_TRANSACAO)[number]),
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

export function parseTiposTransacao(value: string | undefined):
  | readonly ('COMPRA' | 'VENDA')[]
  | undefined {
  return value === undefined
    ? undefined
    : (value.split(',') as ('COMPRA' | 'VENDA')[]);
}
