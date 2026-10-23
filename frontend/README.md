# Passe — frontend

Interface React 19, TypeScript 6 e Vite 8 para administrar jogadores, clubes, mercado, contratos, histórico financeiro, escalações, partidas e classificação.

Para a avaliação, siga primeiro o [procedimento com Docker na raiz](../README.md#instalar-e-executar). O Compose constrói a interface com a origem da API definida no `.env` distribuído; não é necessário criar `frontend/.env` nesse caminho.

## Pré-requisitos para execução local

- Node.js **22 LTS, 22.22.3 ou superior da série 22.x**, com npm 10. A raiz contém `.nvmrc` para selecionar a série 22.
- API do projeto em **http://localhost:3003**, preparada conforme o [README do backend](../backend/README.md#instalar-e-executar-localmente).
- Porta `3000` disponível para o frontend.

PostgreSQL 17 é utilizado pela API; o frontend não se conecta diretamente ao banco.

## Instalar e executar localmente

Em outro terminal, a partir da raiz:

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev -- --strictPort
```

A interface abre em **http://localhost:3000**. `--strictPort` impede que o Vite troque silenciosamente de porta e deixe a origem incompatível com o CORS da API.

## Variáveis de ambiente

O arquivo [.env.example](.env.example) contém:

| Variável          | Valor                   | Uso                                                                |
| ----------------- | ----------------------- | ------------------------------------------------------------------ |
| `VITE_API_ORIGIN` | `http://localhost:3003` | Origem da API, sem `/api/v1`; o cliente HTTP acrescenta o prefixo. |

Na execução local, o Vite lê `.env` e suas variantes locais e por modo. No Docker, o Compose fornece `VITE_API_ORIGIN` como argumento de build a partir do `.env` da raiz; o Dockerfile não copia os arquivos `.env` locais. A variável é incorporada ao JavaScript durante o build, portanto alterações exigem reconstrução da imagem.

Sem `VITE_API_ORIGIN`, o cliente usa a origem da própria interface. Esse fallback não é utilizado no ambiente distribuído. `import.meta.env.DEV`, fornecida pelo Vite, controla a exibição das ferramentas de desenvolvimento.

O backend precisa autorizar `http://localhost:3000` em `FRONTEND_DOMAIN`, como já ocorre nos exemplos distribuídos.

## Funcionalidades implementadas

- Tela inicial com indicadores da liga e líder; navegação e resumo da última partida na sidebar.
- Mercado de jogadores com paginação, busca, filtros e ordenação solicitados à API; detalhes, cadastro, edição, condição física e exclusão.
- Cadastro e listagem de clubes, com ordenação por nome e por patrimônio crescente ou decrescente.
- Página do clube com caixa, valor do elenco, patrimônio e elenco com contratos, fidelidade e percentual de multa recebidos da API.
- Compra com seleção de clube e fidelidade; venda com confirmação e apresentação dos valores devolvidos pelo backend.
- Histórico financeiro com filtros por tipo e jogador do histórico, totais fornecidos pela API e exportação CSV.
- Escalação nas quatro formações, seleção dos cinco titulares, reservas e salvamento pela API.
- Criação e histórico de partidas, placar e apresentação dos seis duelos e participantes históricos.
- Classificação com posição, pontos, saldo e estatísticas apresentados na ordem recebida da API.

As consultas e mutações usam TanStack Query. O cliente compartilhado usa `fetch`, trata carregamento e erros e apresenta as mensagens da API. Indicadores financeiros, overall, resultado das partidas, classificação e totais são calculados pelo backend. O frontend formata os valores para exibição, sem refazer as regras de domínio.

## Validação

Na pasta `frontend`, depois de instalar as dependências:

```bash
npm run typecheck
npm run build
npm run lint -- --no-fix
```

`typecheck` verifica o TypeScript; `build` também executa essa verificação e gera `dist/`. `lint` verifica o código sem aplicar correções. Prettier também está configurado, mas a verificação global ainda aponta pendências em arquivos existentes e inclui o conteúdo de `dist/` após um build. O diferencial de lint e formatação não é declarado como concluído. O script `format` modifica arquivos.

Para inspecionar o build localmente, com a API em execução, na pasta `frontend`:

```bash
npm run build
npm run preview -- --port 3000 --strictPort
```

## Estrutura de pastas

| Caminho                | Responsabilidade                                                   |
| ---------------------- | ------------------------------------------------------------------ |
| `src/main.tsx`         | Inicialização da aplicação e do roteador.                          |
| `src/routes/`          | Rotas e composição das páginas.                                    |
| `src/routeTree.gen.ts` | Árvore gerada pelo TanStack Router.                                |
| `src/modules/`         | Páginas, componentes, hooks e serviços por funcionalidade.         |
| `src/shared/`          | Tipos, apresentação, cliente HTTP, indicadores e campo de futebol. |
| `src/components/`      | Layout, tabelas, modais e componentes reutilizáveis.               |
| `src/styles.css`       | Estilos globais e tokens do tema.                                  |
| `nginx.conf`           | Serviço estático e fallback para rotas da aplicação no Docker.     |

## Bibliotecas utilizadas

A tabela cobre as dependências diretas declaradas no `package.json`, incluindo ferramentas de desenvolvimento.

| Pacote                                                                      | Motivo de uso                                                           |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `react`, `react-dom`                                                        | Componentes, estado e renderização da interface no navegador.           |
| `vite`, `@vitejs/plugin-react`                                              | Servidor de desenvolvimento e build da aplicação React.                 |
| `typescript`, `@types/react`, `@types/react-dom`, `@types/node`             | Tipagem da aplicação e das ferramentas de build.                        |
| `@tanstack/react-router`, `@tanstack/router-cli`, `@tanstack/router-plugin` | Rotas por arquivos, geração da árvore e divisão de código por rota.     |
| `@tanstack/react-query`                                                     | Consultas, cache, cancelamento e atualização após mutações.             |
| `@tanstack/react-table`                                                     | Modelo das tabelas reutilizáveis.                                       |
| `react-hook-form`                                                           | Estado, envio e validação dos formulários.                              |
| `tailwindcss`, `@tailwindcss/vite`                                          | Estilos utilitários e integração do CSS com o build.                    |
| `shadcn`                                                                    | Ferramenta de incorporação dos componentes em `src/components/ui/`.     |
| `@base-ui/react`                                                            | Primitivas interativas dos componentes de interface.                    |
| `class-variance-authority`, `cn`                                            | Variantes e composição das classes CSS dos componentes.                 |
| `tw-animate-css`                                                            | Animações CSS dos componentes.                                          |
| `lucide-react`                                                              | Ícones.                                                                 |
| `@fontsource-variable/geist`                                                | Fonte Geist disponibilizada pelo pacote, sem serviço de fontes externo. |
| `date-fns`                                                                  | Formatação das datas e localização em português do calendário.          |
| `react-day-picker`                                                          | Calendário para seleção do fim da fidelidade.                           |
| `@tanstack/react-router-devtools`, `@tanstack/devtools-vite`                | Inspeção das rotas e ferramentas do Vite durante o desenvolvimento.     |
| `eslint`, `@tanstack/eslint-config`                                         | Verificação estática e regras de lint.                                  |
| `prettier`                                                                  | Formatação e verificação do estilo dos arquivos.                        |

## Decisões, limitações e uso de IA

As seções [Decisões e premissas](../README.md#decisões-e-premissas), [Funcionalidades não implementadas](../README.md#funcionalidades-não-implementadas) e [Uso de inteligência artificial](../README.md#uso-de-inteligência-artificial) são compartilhadas pelo repositório e estão no README da raiz.
