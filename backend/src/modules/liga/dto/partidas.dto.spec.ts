import { BadRequestException } from '@nestjs/common';
import { createValidationPipe } from '../../../core/bootstrap/validation.config.js';
import { CriarPartidaDto } from './criar-partida.dto.js';
import { ListarPartidasDto } from './listar-partidas.dto.js';

const pipe = createValidationPipe();
const valido = { home_club_id: 1, away_club_id: 2 };

function parseBody(value: unknown): Promise<CriarPartidaDto> {
  return pipe.transform(value, { type: 'body', metatype: CriarPartidaDto });
}

function parseQuery(value: unknown): Promise<ListarPartidasDto> {
  return pipe.transform(value, { type: 'query', metatype: ListarPartidasDto });
}

describe('CriarPartidaDto', () => {
  it('aceita somente ids numéricos inteiros, inclusive a representação 50.0', async () => {
    await expect(
      parseBody({ home_club_id: 50.0, away_club_id: 2 }),
    ).resolves.toEqual({ home_club_id: 50, away_club_id: 2 });
  });

  it.each([
    undefined,
    null,
    [],
    'texto',
    1,
    true,
    {},
    { home_club_id: 1 },
    { away_club_id: 2 },
  ])('recusa corpo incompleto ou fora do formato: %j', async (body) => {
    await expect(parseBody(body)).rejects.toThrow(BadRequestException);
  });

  it.each([0, -1, 1.5, '1', null, true, {}, [], Number.MAX_SAFE_INTEGER + 1])(
    'recusa id de body inválido em qualquer lado: %j',
    async (id) => {
      await expect(parseBody({ ...valido, home_club_id: id })).rejects.toThrow(
        BadRequestException,
      );
      await expect(parseBody({ ...valido, away_club_id: id })).rejects.toThrow(
        BadRequestException,
      );
    },
  );

  it('ignora campos calculados, controlados e desconhecidos', async () => {
    await expect(
      parseBody({
        ...valido,
        goals: 99,
        duels: [],
        formation: '3-1',
        result: 'MANDANTE',
        played_at: '2000-01-01',
        extra: true,
      }),
    ).resolves.toEqual(valido);
  });

  it('não substitui o campo obrigatório por outra grafia', async () => {
    await expect(parseBody({ homeClubId: 1, away_club_id: 2 })).rejects.toThrow(
      BadRequestException,
    );
  });
});

describe('ListarPartidasDto', () => {
  it.each(['1', '2147483647'])(
    'mantém o filtro textual %s até a conversão no controller',
    async (club_id) => {
      await expect(parseQuery({ club_id })).resolves.toEqual({ club_id });
    },
  );

  it('aceita filtro ausente e ignora parâmetros desconhecidos', async () => {
    await expect(
      parseQuery({ page: '2', search: 'ignorado' }),
    ).resolves.toEqual({});
  });

  it.each([
    '',
    '0',
    '01',
    '-1',
    '+1',
    '1.0',
    '1e2',
    ' 1',
    '1 ',
    '2147483648',
    '1 OR 1=1',
    1,
    null,
    true,
    {},
    ['1', '2'],
  ])('recusa filtro inválido sem coerção: %j', async (club_id) => {
    await expect(parseQuery({ club_id })).rejects.toThrow(BadRequestException);
  });
});
