# Passe

Aplicação para administrar uma liga fictícia de futebol: jogadores, clubes, compra e venda, contratos de fidelidade, histórico financeiro com CSV, escalações, partidas e classificação. O frontend usa React e Vite; a API usa NestJS e TypeORM com PostgreSQL.

## Pré-requisitos

O procedimento principal foi preparado para Ubuntu 24.04 LTS (amd64), com Docker disponível, conforme o ambiente de avaliação. Execute os comandos **na raiz do repositório**, na ordem indicada.

| Ferramenta     | Versão utilizada e finalidade                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------- |
| Docker Engine  | 28.5.1 na validação; constrói e executa os containers.                                             |
| Docker Compose | v2.40.3 na validação; requer Compose v2 com `up --wait`.                                           |
| Node.js        | 22 LTS, **22.22.3 ou superior da série 22.x**, com npm 10; fornecido pela imagem `node:22-alpine`. |
| PostgreSQL     | 17, fornecido pela imagem `postgres:17-alpine`.                                                    |
| Nginx          | 1.31.8 na validação, pela imagem pública `nginx:alpine`; serve o build estático do frontend.       |
| Git            | 2.x, para obter o repositório.                                                                     |

Não é necessário instalar Node.js, npm, PostgreSQL ou Nginx no host para seguir o procedimento com Docker. A execução local está nos READMEs do [backend](backend/README.md) e do [frontend](frontend/README.md); o arquivo `.nvmrc` seleciona Node.js 22. As dependências atuais exigem o patch mínimo indicado acima. React 19, Vite 8, NestJS 12 e TypeScript 6 estão definidos nos `package.json`; os dois `package-lock.json` fixam as versões instaladas por `npm ci`.

As portas `3000` (frontend), `3003` (API) e `5432` (PostgreSQL) devem estar disponíveis. O Docker precisa estar em execução e acessível pelo usuário.

## Variáveis de ambiente

O arquivo **`.env` da raiz acompanha a entrega pronto para uso local pela banca**. Suas credenciais são exclusivas do banco local criado pelo Compose. O arquivo [.env.example](.env.example) contém os mesmos valores de configuração. Não é necessário editar nem criar arquivos de ambiente para a execução principal.

Se precisar recuperar o arquivo distribuído, execute na raiz:

```bash
cp .env.example .env
```

| Variável          | Valor da entrega        | Uso                                                                                  |
| ----------------- | ----------------------- | ------------------------------------------------------------------------------------ |
| `DB_HOST`         | `localhost`             | Referência para acesso pelo host; no backend em Docker, o Compose define `database`. |
| `DB_PORT`         | `5432`                  | Porta do banco; dentro da rede Docker é sempre `5432`.                               |
| `DB_USER`         | `postgres`              | Usuário criado na inicialização do PostgreSQL.                                       |
| `DB_PASSWORD`     | `postgres`              | Senha de exemplo do banco local de avaliação.                                        |
| `DB_NAME`         | `dev-junior-project`    | Banco criado na primeira inicialização do volume.                                    |
| `FRONTEND_PORT`   | `3000`                  | Porta do frontend publicada no host.                                                 |
| `BACKEND_PORT`    | `3003`                  | Porta da API publicada no host.                                                      |
| `POSTGRES_PORT`   | `5432`                  | Porta do PostgreSQL publicada no host.                                               |
| `FRONTEND_DOMAIN` | `http://localhost:3000` | Única origem permitida pelo CORS da API, sem caminho ou barra final.                 |
| `VITE_API_ORIGIN` | `http://localhost:3003` | Origem da API incorporada ao build do frontend, sem `/api/v1`.                       |

O Compose fixa `PORT=3000` **dentro** do container do backend e publica essa porta em `BACKEND_PORT`. Fora do Docker, `PORT` é lida pela API e vale `3003` no [backend/.env.example](backend/.env.example); se ausente, o código usa `3000`. `SERVER_URL` não é utilizada pelo código e não precisa ser definida.

No fluxo Docker, não são necessários `backend/.env` nem `frontend/.env`: o Compose fornece o ambiente da API e o argumento de build do Vite a partir do `.env` da raiz. Esses arquivos locais ficam fora do contexto de build. Para execução fora do Docker, consulte também [frontend/.env.example](frontend/.env.example).

O Vite incorpora `VITE_API_ORIGIN` durante a compilação: uma alteração exige reconstruir o frontend. Alterações na origem autorizada exigem recriar o backend. O PostgreSQL inicializa usuário, senha e banco somente no primeiro uso do volume. Variáveis exportadas no terminal têm precedência sobre o `.env` do Compose.

## Instalar e executar

Este é o caminho principal para a preparação da banca. Siga o bloco abaixo uma vez, na ordem apresentada; ao terminar, frontend e API ficam disponíveis nos endereços da tabela. As seções de recriação do banco, manutenção e validação têm finalidades próprias e indicam quando usar seus comandos. Os caminhos locais dos READMEs de backend e frontend são alternativas ao ambiente completo em Docker.

O fluxo constrói as imagens a partir deste repositório, cria um banco vazio e aplica as migrations antes de iniciar a API. Não há carga automática de jogadores, clubes, transações ou partidas.

Na raiz do repositório:

```bash
docker compose config --quiet
docker compose build
docker compose up -d --wait database
docker compose run --rm --no-deps backend node node_modules/typeorm/cli.js migration:run -d dist/infrastructure/db/data-source.js
docker compose up -d --no-build --wait backend frontend
docker compose ps
```

| Serviço                      | Endereço                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------- |
| Frontend                     | [http://localhost:3000](http://localhost:3000)                               |
| Origem da API, sem o prefixo | [http://localhost:3003](http://localhost:3003)                               |
| Lista de jogadores           | [http://localhost:3003/api/v1/players](http://localhost:3003/api/v1/players) |
| Swagger                      | [http://localhost:3003/docs](http://localhost:3003/docs)                     |
| Documento OpenAPI            | [http://localhost:3003/docs-json](http://localhost:3003/docs-json)           |

O prefixo dos endpoints é `/api/v1`. Com o banco vazio, a lista de jogadores responde HTTP 200 com `data: []`. Para verificar a comunicação do frontend, abra **Mercado de jogadores**: a tela deve mostrar a lista vazia, sem erro de conexão.

Como alternativa ao bloco de preparação acima, é possível construir e subir os três serviços, incluindo migrations, em **um único comando**, também na raiz. Escolha uma das duas formas de preparação:

```bash
docker compose build && docker compose up -d --wait database && docker compose run --rm --no-deps backend node node_modules/typeorm/cli.js migration:run -d dist/infrastructure/db/data-source.js && docker compose up -d --no-build --wait backend frontend
```

As migrations são explícitas e só aplicam alterações pendentes. A imagem final da API contém dependências de produção; por isso o comando usa a CLI TypeORM diretamente, sem os scripts npm que fazem um build prévio com o Nest CLI.

Para consultar logs:

```bash
docker compose logs --tail 100 backend frontend database
```

## Criar e recriar o banco do zero

A criação inicial é feita pelos comandos de instalação acima. Antes de cada roteiro de avaliação, use o procedimento abaixo para **apagar todos os dados**, criar um novo banco vazio, aplicar as migrations e iniciar novamente frontend e API. Ele pressupõe que as imagens já foram construídas na preparação; não é necessário recompilá-las para limpar os dados.

Na raiz do repositório:

```bash
docker compose down --volumes
docker compose up -d --wait database
docker compose run --rm --no-deps backend node node_modules/typeorm/cli.js migration:run -d dist/infrastructure/db/data-source.js
docker compose up -d --no-build --wait backend frontend
```

O volume PostgreSQL deste projeto Compose é removido, inclusive seus dados. O procedimento não carrega exemplos. Após a recriação, os endereços continuam sendo os da tabela de execução.

## Atualizar, parar e retomar

Esta seção reúne operações de manutenção, utilizadas conforme a necessidade após a preparação.

Após atualizar o código, reconstrua e aplique as migrations antes de retomar a API:

```bash
docker compose stop backend
docker compose build
docker compose up -d --wait database
docker compose run --rm --no-deps backend node node_modules/typeorm/cli.js migration:run -d dist/infrastructure/db/data-source.js
docker compose up -d --no-build --wait backend frontend
```

Para parar preservando os dados e retomar com as imagens já construídas:

```bash
docker compose down
docker compose up -d --no-build --wait
```

Para reiniciar frontend e API durante a avaliação, preservando os dados e o banco em execução:

```bash
docker compose restart backend frontend
docker compose ps
```

Para consultar as migrations aplicadas, com o banco em execução:

```bash
docker compose run --rm --no-deps backend node node_modules/typeorm/cli.js migration:show -d dist/infrastructure/db/data-source.js
```

## Estrutura de pastas

| Caminho                          | Responsabilidade                                                       |
| -------------------------------- | ---------------------------------------------------------------------- |
| `backend/src/modules/`           | Jogadores, clubes, contratos, mercado, liga e indicadores iniciais.    |
| `backend/src/core/`              | Validações, dinheiro, datas, texto e configuração HTTP compartilhados. |
| `backend/src/infrastructure/db/` | Configuração PostgreSQL e migrations versionadas.                      |
| `backend/src/**/*.spec.ts`       | Testes unitários do backend.                                           |
| `frontend/src/routes/`           | Rotas e composição das páginas.                                        |
| `frontend/src/modules/`          | Telas, hooks, tipos e serviços por funcionalidade.                     |
| `frontend/src/components/`       | Layout e componentes reutilizáveis.                                    |
| `frontend/src/shared/`           | Cliente HTTP, apresentação, tipos e campo de futebol.                  |
| `docker-compose.yaml`            | Construção e execução da interface, API e banco.                       |

## Bibliotecas utilizadas

A relação completa das dependências declaradas, incluindo ferramentas de desenvolvimento e o motivo de cada uma, está em trechos próprios dos READMEs do [backend](backend/README.md#bibliotecas-utilizadas) e do [frontend](frontend/README.md#bibliotecas-utilizadas).

As escolhas centrais são TypeORM para persistência e migrations; `class-validator` e `class-transformer` para os DTOs; TanStack Query para consultas e cache; TanStack Router para navegação; React Hook Form para formulários; e Tailwind CSS, shadcn/ui e Base UI para a interface.

## Decisões e premissas

- A API é um monólito modular. Controllers recebem os pedidos, services executam os casos de uso e o TypeORM persiste os dados. A interface usa `fetch` e apresenta os valores de domínio devolvidos pelo backend.
- O ambiente de avaliação usa arquivos `.env` e `.env.example` com valores locais prontos, banco vazio e migrations explícitas. O schema é controlado por migrations, com `synchronize: false`.
- A aplicação administra a liga inteira, sem login, conforme o enunciado. Nenhum serviço externo é necessário para executar os fluxos.
- Datas do domínio seguem Brasília (`-03:00`); o formulário de compra envia explicitamente esse deslocamento. Valores financeiros são calculados no backend com conversões monetárias compartilhadas e apresentados em moedas pela interface.
- Como detalhe de apresentação não fixado pelo enunciado, o CSV é baixado com o nome `historico-clube-{id}.csv`. Os nomes nas transações e nos resultados das partidas usam snapshots históricos.
- Na inconsistência de um jogador vinculado sem contrato ativo do clube atual, o detalhe do clube retorna erro com `message`, sem inventar dados de contrato. Na criação de partidas, uma falha de serialização do PostgreSQL permite até três tentativas da transação; conflito persistente retorna recusa sem gravação parcial.
- A tela inicial com indicadores e a sidebar complementam a navegação. A aparência segue uma interpretação do mockup; a classificação mantém os valores e a ordem da API.

## Funcionalidades não implementadas

- **Logs por requisição** com data/hora, método, caminho e status, pelo formato exigido para esse diferencial, não foram implementados. Os logs padrão de inicialização do NestJS continuam disponíveis.

A padronização de formatação ainda tem pendências em arquivos existentes nas duas aplicações; o diferencial de lint **e** formatação não é declarado como concluído.

Os fluxos obrigatórios de jogadores, clubes, mercado, histórico/CSV, escalação, partidas e classificação possuem implementação no código. Isso não representa aprovação antecipada dos roteiros da banca. A navegação completa e a responsividade em 375 px não foram verificadas nesta revisão de documentação.

## Validações disponíveis

Para verificar o código e o diferencial de testes unitários, execute os comandos abaixo **na raiz do repositório**. Esta etapa é separada da inicialização da aplicação. As imagens de validação são construídas localmente a partir dos Dockerfiles do projeto, com Node.js 22 e as dependências instaladas por `npm ci`; elas não dependem de Node.js no host nem de imagens publicadas pelo candidato.

Backend: construa a etapa de build e execute lint, testes unitários e build. O comando de testes termina sozinho e inclui a verificação do valor de mercado:

```bash
docker build --target build --tag passe-backend-check ./backend
docker run --rm passe-backend-check sh -c 'npm run lint && npm run test && npm run build'
```

Frontend: a construção da etapa de build executa a verificação de tipos e gera os arquivos estáticos; depois, execute o lint:

```bash
docker build --target build --tag passe-frontend-check ./frontend
docker run --rm passe-frontend-check npm run lint -- --no-fix
```

As verificações não alteram o banco nem interrompem os serviços. Para execução com Node.js no host, os comandos equivalentes estão nos READMEs do [backend](backend/README.md#validação) e do [frontend](frontend/README.md#validação). A documentação interativa pode ser conferida na [URL do Swagger](http://localhost:3003/docs) após a inicialização.

## Uso de inteligência artificial

Utilizei **OpenAI Codex** como apoio à organização, implementação, revisão e documentação do projeto, incluindo a análise da estrutura do código e sugestões de melhoria. O objetivo foi esclarecer o enunciado, organizar o trabalho por domínio e ajudar nas partes técnicas durante o desenvolvimento.

O fluxo começou pela leitura do enunciado e pela definição de **specs**, com o escopo de cada funcionalidade, as regras de negócio envolvidas, os contratos da API e os critérios de aceite. Essas especificações orientaram a divisão do trabalho em etapas e a implementação dos módulos.

Durante a implementação, foram utilizados **agentes de IA em etapas de revisão** para acompanhar a integridade das regras de negócio no backend e no frontend. No backend, as revisões comparavam cálculos, validações e operações com as specs e o enunciado. No frontend, verificavam o consumo dos contratos, a apresentação dos valores devolvidos pela API e o tratamento das respostas, buscando inconsistências entre as duas aplicações. Os agentes também analisavam a estrutura do código e sugeriam melhorias de organização, legibilidade e manutenção.

Quando surgiam problemas ou divergências, eram criados **arquivos de fixes**, como `backend/urgent-fixes-backend.md`, `frontend/minor-fixes.md` e `docker-fixes.md`, para registrar os achados, organizar as correções e acompanhar as verificações realizadas. Esse ciclo de especificação, implementação, revisão e correção ajudou a manter o trabalho alinhado aos requisitos; as revisões com IA não substituem a avaliação funcional da aplicação.

| Onde                                                               | Como e por que foi utilizado                                                                                                                                            |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Documentação de requisitos e planejamento                          | Leitura do enunciado, organização dos requisitos em guias por domínio e separação das obrigações do backend e do frontend; uso de skills para apoiar esse planejamento. |
| `backend/src/` e `frontend/src/`                                   | Análise da estrutura do código, da divisão de responsabilidades, da legibilidade e de possíveis duplicações, com sugestões de melhoria para facilitar a manutenção.     |
| `backend/src/modules/` e `backend/src/core/`                       | Apoio à implementação e revisão de regras, validações, contratos HTTP e testes unitários, comparando o comportamento com os exemplos e critérios do enunciado.          |
| `frontend/src/modules/`, `frontend/src/shared/` e componentes      | Apoio na construção e revisão de telas, integração HTTP, apresentação de respostas e tratamento de carregamento e erros.                                                |
| Dockerfiles, `docker-compose.yaml`, arquivos de ambiente e READMEs | Revisão das versões, CORS e configuração de execução; redação dos comandos copiáveis e verificação de build e inicialização em ambiente isolado.                        |

**Aceito:** apoio na organização por domínio, implementações e correções presentes na entrega, testes unitários do backend e orientações de execução. **Alterado:** os READMEs e a configuração de ambiente foram ajustados para as versões e portas efetivamente usadas; o frontend apresenta cálculos e classificação recebidos da API.

**Não incorporado ao código final:** os testes E2E do backend e os testes automatizados do frontend foram desenvolvidos com apoio de IA, mas não foram enviados no código final, pois ainda não tenho domínio técnico suficiente para implementá-los e mantê-los sozinho.
