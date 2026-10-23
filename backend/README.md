# Passe — backend

API REST de uma liga fictícia de futebol, implementada com NestJS 12, TypeScript 6, TypeORM e PostgreSQL 17. Os módulos cobrem jogadores, clubes, contratos, mercado, escalações, partidas, classificação e indicadores da tela inicial.

Para a avaliação, siga primeiro o [procedimento com Docker na raiz](../README.md#instalar-e-executar). Ele prepara as duas aplicações e o banco a partir do `.env` distribuído, sem edição de configuração.

## Pré-requisitos para execução local

- Node.js **22 LTS, 22.22.3 ou superior da série 22.x**, com npm 10. O `.nvmrc` da raiz seleciona a série 22.
- PostgreSQL **17**, que pode ser iniciado pelo Compose da raiz com Docker Engine e Compose v2.
- Portas `3003` para a API e `5432` para o banco disponíveis.

O Dockerfile utiliza `node:22-alpine` para build, instalação de dependências de produção e execução. A versão mínima de Node.js também atende às ferramentas de build declaradas no lock.

## Instalar e executar localmente

Este é um caminho alternativo ao Docker completo. A partir da raiz, inicie somente o banco:

```bash
docker compose up -d --wait database
```

Em seguida, entre em `backend/`, copie o ambiente local, instale as dependências travadas e aplique as migrations:

```bash
cd backend
cp .env.example .env
npm ci
npm run migration:run
npm run start:dev
```

A origem da API é **http://localhost:3003**, sem o prefixo `/api/v1`. Swagger: **http://localhost:3003/docs**; OpenAPI: **http://localhost:3003/docs-json**. O frontend local usa **http://localhost:3000**.

`migration:run` executa um build prévio e aplica apenas migrations pendentes. O comando funciona neste caminho porque `npm ci` instala também as dependências de desenvolvimento. Na imagem final Docker, use a CLI TypeORM indicada no README da raiz.

Para executar o build sem observação, na pasta `backend`, substitua `start:dev` por:

```bash
npm run build
npm run start:prod
```

## Variáveis de ambiente

O arquivo [.env.example](.env.example) contém valores prontos para a API local e o banco criado pelo Compose. O NestJS e a CLI de migrations carregam `.env.local` antes de `.env`; variáveis já exportadas no terminal têm precedência. O fluxo de avaliação em Docker recebe as variáveis diretamente do Compose e não lê esses arquivos locais.

| Variável          | Exemplo local              | Uso                                                                                                 |
| ----------------- | -------------------------- | --------------------------------------------------------------------------------------------------- |
| `DB_HOST`         | `127.0.0.1`                | Host do PostgreSQL; em Docker, `database`.                                                          |
| `DB_PORT`         | `5432`                     | Porta do PostgreSQL, validada como inteiro de 1 a 65535.                                            |
| `DB_USER`         | `postgres`                 | Usuário do banco.                                                                                   |
| `DB_PASSWORD`     | `postgres`                 | Senha de exemplo do banco local.                                                                    |
| `DB_NAME`         | `dev-junior-project`       | Nome do banco, criado pelo Compose.                                                                 |
| `PORT`            | `3003`                     | Porta HTTP local; o código usa `3000` se ausente. No container, o Compose fixa `3000`.              |
| `FRONTEND_DOMAIN` | `http://localhost:3000`    | Única origem autorizada pelo CORS, sem caminho ou barra final.                                      |
| `NODE_ENV`        | `production` no Dockerfile | Indica execução de produção ao runtime NestJS; não é necessário defini-la no desenvolvimento local. |

As cinco variáveis `DB_*` são obrigatórias para o banco. `SERVER_URL` não é utilizada pelo código. Sem `FRONTEND_DOMAIN`, o código usa `http://localhost:5173`; os arquivos de exemplo e o Compose configuram explicitamente `http://localhost:3000`.

CORS não autoriza outras origens do navegador. Requisições sem `Origin`, como curl, continuam disponíveis. O cabeçalho `Content-Disposition` é exposto para o download CSV. Reinicie a API após mudar a configuração.

## Banco, migrations e recriação

O schema é mantido em `src/infrastructure/db/migrations/`, com `synchronize: false`. A criação inicial deixa o banco sem registros de domínio. A recriação completa, incluindo a remoção do volume, está no [README da raiz](../README.md#criar-e-recriar-o-banco-do-zero).

Para consultar ou reverter a última migration em desenvolvimento, na pasta `backend`, com o banco em execução:

```bash
npm run migration:show
npm run migration:revert
```

Cada reversão desfaz uma migration; migrations que removem tabelas também removem os dados dessas tabelas. Para reaplicar as pendentes:

```bash
npm run migration:run
```

## Contrato HTTP e Swagger

A API usa prefixo `/api/v1`, nomes em inglês e `snake_case` no JSON. Recusas retornam `message` como texto. O Swagger em `/docs` descreve DTOs, respostas e erros; `/docs-json` disponibiliza o documento OpenAPI.

| Área                 | Operações                                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Jogadores            | `GET /players`, `GET /players/{id}`, `POST /players`, `PUT /players/{id}`, `PATCH /players/{id}/condition`, `DELETE /players/{id}`. |
| Clubes               | `POST /clubs`, `GET /clubs`, `GET /clubs/{id}`.                                                                                     |
| Mercado              | `POST /players/{id}/buy`, `POST /players/{id}/sell`.                                                                                |
| Histórico financeiro | `GET /clubs/{id}/transactions`, `GET /clubs/{id}/transactions/export`.                                                              |
| Escalação            | `GET /clubs/{id}/lineup`, `PUT /clubs/{id}/lineup`.                                                                                 |
| Partidas             | `POST /matches`, `GET /matches`, `GET /matches/{id}`.                                                                               |
| Classificação        | `GET /standings`.                                                                                                                   |
| Tela inicial         | `GET /dashboard`.                                                                                                                   |

A listagem de jogadores é paginada. Clubes aceitam `sort=name`, `net_worth_asc` e `net_worth_desc`. O detalhe do clube inclui indicadores financeiros, elenco e contratos ativos. Compras, vendas e substituições de escalação preservam a atomicidade das operações.

O histórico aceita `type=COMPRA`, `type=VENDA` ou `type=COMPRA,VENDA` e `player_id`. A exportação aplica os mesmos filtros, usa UTF-8 sem BOM, separador `;`, linhas LF e `Content-Disposition` com `historico-clube-{id}.csv`.

A partida recebe apenas os dois clubes; o backend calcula placar e seis duelos e persiste snapshots. O histórico é ordenado por data e id decrescentes. A classificação inclui todos os clubes e devolve posições, pontos, saldo e demais estatísticas já calculados e ordenados.

## Validação

Na pasta `backend`, após `npm ci`:

```bash
npm run lint
npm run test
npm run build
```

`npm run test` usa `vitest run`: termina sozinho, sem modo de observação. Os testes unitários em `src/**/*.spec.ts` incluem cálculos de valor de mercado, regras de compra/venda, contratos, validação, escalação, duelos, classificação e contratos HTTP em isolamento. Não dependem de um PostgreSQL em execução. O arquivo `test/fixtures/partida.fixture.ts` fornece dados auxiliares para os unitários de partidas e precisa acompanhá-los no repositório.

Prettier está configurado, mas a verificação global ainda aponta pendências em arquivos existentes. O diferencial de lint e formatação não é declarado como concluído. O script `format` modifica arquivos.

## Estrutura de pastas

| Caminho                            | Responsabilidade                                                           |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `src/main.ts`                      | Inicialização, prefixo, validação, CORS, Swagger e porta HTTP.             |
| `src/core/`                        | Infraestrutura HTTP compartilhada e utilitários de dinheiro, data e texto. |
| `src/modules/`                     | Domínios e casos de uso, com controllers, DTOs, services e entidades.      |
| `src/infrastructure/db/`           | Conexão TypeORM/PostgreSQL e migrations.                                   |
| `src/**/*.spec.ts`                 | Testes unitários.                                                          |
| `test/fixtures/partida.fixture.ts` | Dados auxiliares compartilhados pelos testes unitários de partidas.        |
| `vitest.config.ts`                 | Configuração da suíte unitária.                                            |

## Bibliotecas utilizadas

A tabela cobre as dependências diretas declaradas no `package.json`, incluindo ferramentas de desenvolvimento.

| Pacote                                                       | Motivo de uso                                                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | Estrutura NestJS, injeção de dependências, decorators e servidor HTTP Express.                         |
| `@nestjs/config`                                             | Carregamento dos arquivos de ambiente e consulta da configuração.                                      |
| `@nestjs/swagger`                                            | Geração do documento OpenAPI e interface Swagger.                                                      |
| `@nestjs/typeorm`                                            | Integração do TypeORM com módulos e injeção do NestJS.                                                 |
| `typeorm`                                                    | Entidades, consultas, transações e migrations do schema.                                               |
| `pg`                                                         | Driver de conexão PostgreSQL.                                                                          |
| `class-validator`                                            | Validação declarativa dos DTOs.                                                                        |
| `class-transformer`                                          | Conversão de objetos e apoio à transformação dos DTOs.                                                 |
| `reflect-metadata`                                           | Metadados utilizados pelos decorators do NestJS e TypeORM.                                             |
| `rxjs`                                                       | Primitivas reativas utilizadas pela infraestrutura do NestJS.                                          |
| `@nestjs/cli`, `@nestjs/schematics`                          | Build, desenvolvimento e geração de estruturas NestJS.                                                 |
| `@nestjs/testing`                                            | Criação dos módulos de teste e substituição de dependências.                                           |
| `vitest`, `@vitest/coverage-v8`                              | Testes unitários e coleta opcional de cobertura com V8.                                                |
| `vite-tsconfig-paths`                                        | Resolução dos aliases TypeScript durante os testes.                                                    |
| `supertest`, `@types/supertest`                              | Requisições HTTP simuladas e seus tipos, inclusive nos testes unitários de configuração global.        |
| `oxlint`, `oxlint-tsgolint`                                  | Lint e análise de regras com informação de tipos.                                                      |
| `prettier`                                                   | Padronização e verificação de formatação.                                                              |
| `typescript`                                                 | Tipagem e compilação do código.                                                                        |
| `@types/express`, `@types/node`                              | Tipos das APIs HTTP e do runtime Node.js.                                                              |
| `source-map-support`                                         | Suporte a stack traces com source maps no ambiente de desenvolvimento.                                 |
| `@nestjs/mau`                                                | Dependência de deploy herdada do template; não é utilizada na execução nem na avaliação desta entrega. |

## Decisões, limitações e uso de IA

As seções [Decisões e premissas](../README.md#decisões-e-premissas), [Funcionalidades não implementadas](../README.md#funcionalidades-não-implementadas) e [Uso de inteligência artificial](../README.md#uso-de-inteligência-artificial) são compartilhadas pelo repositório e estão no README da raiz.
