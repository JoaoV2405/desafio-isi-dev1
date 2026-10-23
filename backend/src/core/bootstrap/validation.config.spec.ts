import { HttpException } from '@nestjs/common';
import { CriarJogadorDto } from '../../modules/jogadores/dto/criar-jogador.dto.js';
import { ListarJogadoresDto } from '../../modules/jogadores/dto/listar-jogadores.dto.js';
import { createValidationPipe } from './validation.config.js';

describe('Mensagens do pipe global de validação', () => {
  it.each([
    { type: 'body' as const, metatype: CriarJogadorDto, value: {} },
    {
      type: 'body' as const,
      metatype: CriarJogadorDto,
      value: { name: null, agility: '50' },
    },
    {
      type: 'query' as const,
      metatype: ListarJogadoresDto,
      value: { page: '01', position: 'mei' },
    },
  ])(
    'recusa $type inválido com message textual',
    async ({ value, ...metadata }) => {
      const error: unknown = await createValidationPipe()
        .transform(value, metadata)
        .catch((cause: unknown) => cause);

      expect(error).toBeInstanceOf(HttpException);
      if (!(error instanceof HttpException)) return;

      expect(error.getStatus()).toBe(400);
      expect(error.getResponse()).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: expect.stringMatching(/\S/),
      });
    },
  );

  it('preserva as mensagens de todos os campos inválidos', async () => {
    const error: unknown = await createValidationPipe()
      .transform(
        { page: '01', position: 'mei' },
        { type: 'query', metatype: ListarJogadoresDto },
      )
      .catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(HttpException);
    if (!(error instanceof HttpException)) return;

    expect(error.getResponse()).toMatchObject({
      message: expect.stringMatching(/position[\s\S]*page|page[\s\S]*position/),
    });
  });

  it('inclui mensagens de validações aninhadas no texto', () => {
    const error = createValidationPipe().createExceptionFactory()([
      {
        property: 'contract',
        children: [
          {
            property: 'loyalty_until',
            constraints: { isDefined: 'loyalty_until é obrigatório' },
          },
        ],
      },
    ]);
    expect(error).toBeInstanceOf(HttpException);
    if (!(error instanceof HttpException)) return;
    expect(error.getResponse()).toMatchObject({
      message: expect.stringContaining('contract.loyalty_until é obrigatório'),
    });
  });

  it('usa mensagem não vazia se não houver detalhes de validação', () => {
    const error = createValidationPipe().createExceptionFactory()();
    expect(error).toBeInstanceOf(HttpException);
    if (!(error instanceof HttpException)) return;
    expect(error.getResponse()).toMatchObject({
      message: expect.stringMatching(/\S/),
    });
  });
});
