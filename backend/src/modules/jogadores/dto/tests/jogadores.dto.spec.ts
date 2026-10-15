import { BadRequestException, type ArgumentMetadata } from '@nestjs/common';
import { CriarClubeDto } from '../../../clubes/dto/criar-clube.dto.js';
import { createValidationPipe } from '../../../../core/bootstrap/validation.config.js';
import { AlterarCondicaoJogadorDto } from '../alterar-condicao-jogador.dto.js';
import { CriarJogadorDto } from '../criar-jogador.dto.js';
import { EditarJogadorDto } from '../editar-jogador.dto.js';
import { ListarJogadoresDto } from '../listar-jogadores.dto.js';

const validPlayer = {
  name: '  João   da Silva  ',
  position: 'ATA',
  agility: 80,
  age: 21,
  pace: 80,
  shooting: 80,
  passing: 80,
  dribbling: 80,
  defending: 70,
  physical: 70,
  potential: 90,
};

async function transform<T extends object>(
  value: unknown,
  metatype: new (...args: never[]) => T,
  type: ArgumentMetadata['type'] = 'body',
): Promise<T> {
  return createValidationPipe().transform(value, {
    type,
    metatype,
  }) as Promise<T>;
}

describe('DTOs de jogadores', () => {
  it('normaliza a criação e ignora campos desconhecidos ou controlados', async () => {
    await expect(
      transform(
        {
          ...validPlayer,
          condition: 'DOENTE',
          club_id: 4,
          unknown: true,
        },
        CriarJogadorDto,
      ),
    ).resolves.toEqual({
      ...validPlayer,
      name: 'João da Silva',
    });
  });

  it.each([
    [{ ...validPlayer, agility: '80' }, 'string numérica'],
    [{ ...validPlayer, agility: 80.5 }, 'número fracionário'],
    [{ ...validPlayer, position: 'ata' }, 'enum com caixa incorreta'],
    [{ ...validPlayer, name: 'João 10' }, 'nome com dígito'],
    [{ ...validPlayer, name: 'João' }, 'nome com uma palavra'],
    [{ ...validPlayer, pace: 100 }, 'atributo fora da faixa'],
    [{ ...validPlayer, potential: null }, 'campo obrigatório nulo'],
  ])('recusa criação com %s (%s)', async (value) => {
    await expect(transform(value, CriarJogadorDto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it.each([null, [], 'texto', 10, true])(
    'recusa corpo que não seja objeto: %s',
    async (value) => {
      await expect(transform(value, CriarJogadorDto)).rejects.toThrow(
        BadRequestException,
      );
    },
  );

  it('valida e normaliza os quatro campos de edição', async () => {
    await expect(
      transform(
        {
          name: '  João   da Silva ',
          position: 'MEI',
          agility: 75,
          age: 30,
          pace: 99,
        },
        EditarJogadorDto,
      ),
    ).resolves.toEqual({
      name: 'João da Silva',
      position: 'MEI',
      agility: 75,
      age: 30,
    });
  });

  it('aceita somente uma condição com caixa exata', async () => {
    await expect(
      transform(
        { condition: 'DOENTE', name: 'ignorado' },
        AlterarCondicaoJogadorDto,
      ),
    ).resolves.toEqual({ condition: 'DOENTE' });

    await expect(
      transform({ condition: 'doente' }, AlterarCondicaoJogadorDto),
    ).rejects.toThrow(BadRequestException);
  });

  it('valida e preserva a sintaxe textual da query', async () => {
    await expect(
      transform(
        {
          search: '  João   Silva ',
          position: 'MEI',
          free: 'false',
          min_age: '16',
          min_value: '10.50',
          sort: 'value_desc,age_asc',
          page: '2',
          limit: '20',
          unknown: 'ignorado',
        },
        ListarJogadoresDto,
        'query',
      ),
    ).resolves.toEqual({
      search: 'João Silva',
      position: 'MEI',
      free: 'false',
      min_age: '16',
      min_value: '10.50',
      sort: 'value_desc,age_asc',
      page: '2',
      limit: '20',
    });
  });

  it.each([
    [{ search: '' }, 'busca vazia'],
    [{ search: 'a' }, 'busca curta'],
    [{ position: 'mei' }, 'enum com caixa incorreta'],
    [{ free: true }, 'booleano JSON no lugar de texto'],
    [{ club_id: '01' }, 'id com zero à esquerda'],
    [{ min_age: '16.0' }, 'inteiro decimal'],
    [{ min_value: '01' }, 'decimal com zero à esquerda'],
    [{ min_value: '10.555' }, 'decimal com três casas'],
    [{ sort: 'value_asc,value_desc' }, 'ordenação repetida'],
    [{ limit: '51' }, 'limite acima da faixa'],
  ])('recusa query com %s (%s)', async (value) => {
    await expect(transform(value, ListarJogadoresDto, 'query')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('preserva os campos do DTO de clube no pipeline global', async () => {
    await expect(
      transform(
        {
          name: '  Águias   Futebol Clube ',
          acronym: 'AFC',
          cash: 900,
        },
        CriarClubeDto,
      ),
    ).resolves.toEqual({
      name: 'Águias Futebol Clube',
      acronym: 'AFC',
    });
  });
});
