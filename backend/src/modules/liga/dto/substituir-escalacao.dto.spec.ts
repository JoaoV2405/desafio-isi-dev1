import { BadRequestException } from '@nestjs/common';
import { createValidationPipe } from '../../../core/bootstrap/validation.config.js';
import { FormacaoClube } from '../../clubes/entities/clube.entity.js';
import { SubstituirEscalacaoDto } from './substituir-escalacao.dto.js';

const pipe = createValidationPipe();
const validInput = { formation: '2-1-1', player_ids: [5, 3, 1, 4, 2] };

function parse(value: unknown): Promise<SubstituirEscalacaoDto> {
  return pipe.transform(value, {
    type: 'body',
    metatype: SubstituirEscalacaoDto,
  });
}

describe('SubstituirEscalacaoDto', () => {
  it.each(Object.values(FormacaoClube))(
    'aceita a formação %s sem alterar a ordem dos ids',
    async (formation) => {
      await expect(parse({ ...validInput, formation })).resolves.toEqual({
        ...validInput,
        formation,
      });
    },
  );

  it.each([
    undefined,
    null,
    [],
    'texto',
    1,
    true,
    {},
    { ...validInput, formation: null },
    { ...validInput, formation: '2-1-1 ' },
    { ...validInput, formation: '4-0' },
    { player_ids: validInput.player_ids },
    { formation: validInput.formation },
    { ...validInput, player_ids: null },
    { ...validInput, player_ids: '1,2,3,4,5' },
    { ...validInput, player_ids: [] },
    { ...validInput, player_ids: [1, 2, 3, 4] },
    { ...validInput, player_ids: [1, 2, 3, 4, 5, 6] },
    { ...validInput, player_ids: [1, 2, 3, 4, 4] },
    ...[0, -1, 1.5, '5', null, true, {}, []].map((id) => ({
      ...validInput,
      player_ids: [1, 2, 3, 4, id],
    })),
  ])('recusa corpo ou campos inválidos: %j', async (input) => {
    await expect(parse(input)).rejects.toThrow(BadRequestException);
  });

  it('ignora campos controlados e desconhecidos', async () => {
    await expect(
      parse({
        ...validInput,
        cash: 0,
        complete: false,
        club_id: 9,
        other: true,
      }),
    ).resolves.toEqual(validInput);
  });
});
