# Warzinho 2.0

Warzinho 2.0 é um jogo digital de estratégia e conquista territorial inspirado no WAR Grow. A aplicação oferece um mapa global interativo, combate com dados, objetivos secretos, cartas de território, cartas táticas, eventos globais e ferramentas para criar novas regras.

## O que existe no jogo

### Preparação da partida

- Partidas com 2 a 6 generais.
- Jogadores humanos ou IA.
- Escolha de nome e cor de cada jogador.
- Distribuição aleatória dos territórios.
- Sorteio de objetivos secretos.
- Cartas táticas iniciais para cada jogador.
- Editor de objetivos personalizados antes da partida.
- Oficina para ativar ou desativar mecânicas.

### Tabuleiro e mapa

- Mapa SVG interativo com 42 territórios.
- Seis continentes: América do Norte, América do Sul, Europa, África, Ásia e Oceania.
- Conexões terrestres e rotas marítimas.
- Bônus de exércitos por continente controlado.
- Cores próprias para territórios, continentes e jogadores.
- Nevoeiro de guerra opcional.
- Indicação visual de território selecionado, alvo e rota de ataque.

### Fases do turno

1. **Distribuição:** posiciona os exércitos da reserva nos próprios territórios.
2. **Ataque:** seleciona um território próprio com pelo menos 2 tropas e ataca um inimigo válido.
3. **Remanejamento:** move tropas entre territórios próprios conectados, mantendo pelo menos 1 na origem.
4. **Fim do turno:** pode receber carta por conquista, verifica vitória, troca o jogador e inicia eventos da nova rodada.

### Combate

- O atacante e o defensor rolam dados de 1 a 6.
- O atacante pode usar até 3 dados, sem deixar a origem sem tropas.
- O defensor pode usar até 3 dados.
- Os dados são comparados em ordem decrescente.
- Por padrão, o defensor vence empates.
- Fortalezas podem adicionar +1 aos dados defensivos.
- Se o defensor for derrotado, o atacante escolhe quantos sobreviventes avançam.
- Se o atacante perder, as baixas são aplicadas sem conquistar o território.
- A eliminação de um jogador transfere suas cartas ao vencedor.

### Cartas de território

- O jogador recebe uma carta ao conquistar pelo menos um território no turno.
- Trocas exigem 3 cartas em combinação válida: símbolos iguais, um de cada símbolo ou coringas.
- A tabela de troca é progressiva: 4, 6, 8, 10, 12, 15, 20 e depois progressão de 5.
- Cartas correspondentes a territórios ocupados concedem bônus adicional de exércitos.

### Cartas táticas

- **Ataque Aéreo Estratégico:** exige pelo menos 20 soldados na origem, permite escolher o efetivo, consome metade como custo, sorteia qualquer território inimigo, usa combate normal e ocupa o alvo com sobreviventes em caso de vitória. A carta é consumida ao ser usada.
- **Construir Fortaleza:** fortifica um território próprio e concede bônus defensivo.
- **Espionagem Militar:** abre informações do objetivo e inteligência do adversário.
- **Conscrição de Emergência:** adiciona 3 exércitos à reserva.
- **Guerra Relâmpago:** ativa bônus temporário para ataques.
- **Pacto de Não-Agressão:** representa uma trégua temporária com uma fronteira rival.

### Objetivos e vitória

- Conquistar continentes específicos.
- Conquistar uma quantidade de territórios.
- Controlar territórios com um mínimo de exércitos.
- Eliminar a cor de um adversário.
- Dominar territórios estratégicos.
- Controlar territórios insulares e rotas marítimas.
- Criar objetivos personalizados por continente, quantidade, cor e territórios obrigatórios.
- Ao cumprir o objetivo, a partida mostra a vitória, duração e número de conquistas.

### Mecânicas configuráveis

- Nevoeiro de guerra.
- Ataques aéreos.
- Fortificações.
- Eventos globais.
- Cartas táticas.
- Vitória do defensor em empates.
- Trocas progressivas de cartas.
- Modo capitais.
- Remanejamento ilimitado.
- Pactos de aliança.
- Quantidade mínima de tropas por rodada.

### Eventos globais

- Inverno Siberiano Severo.
- Crise no Canal de Suez.
- Remessa Aliada de Armamentos.
- Insurreição Popular.
- Monções Tropicais no Sudeste Asiático.

### Interface e feedback

- Cabeçalho com jogador ativo, cor, rodada, fase e tropas disponíveis.
- Painel de ações para objetivos, cartas, táticas, regras, objetivos e histórico.
- Diário de bordo com combates, conquistas, reforços, eventos e eliminações.
- Sons procedurais para dados, combate, conquista, tropas, cartas, cliques e vitória.
- Tela de vitória com objetivo cumprido, estatísticas e confetes.

## Multiplayer online e servidor C#

O projeto agora possui a base de um servidor multiplayer em C# com ASP.NET Core 8 e SignalR. O React continua sendo o cliente para navegador, celular e PC; o servidor será responsável por salas, jogadores conectados, ações e estado compartilhado da partida.

### Servidor

- Projeto: `server/Warzinho.Server/Warzinho.Server.csproj`
- Health check: `GET /health`
- Hub em tempo real: `/hubs/game`
- Entrada em salas por código.
- Lista de jogadores conectados.
- Assentos individuais de `p_1` a `p_6` para as conexões da sala.
- Uso dos nomes conectados ao iniciar a partida online.
- Transferência de ações para todos os participantes.
- Publicação do estado da partida pelo anfitrião.
- Recebimento de jogadores e estado completo pelo cliente React.
- Sincronização de territórios, jogadores, rodada, fase, reserva, cartas, eventos e diário.
- Bloqueio de ações locais quando não é o turno do jogador conectado.
- Validação no hub para aceitar apenas ações conhecidas e do jogador ativo.
- Seleção de territórios e avanço de fase dos jogadores remotos encaminhados ao anfitrião.
- Uso de cartas táticas remotas encaminhado ao anfitrião antes da aplicação.
- Remanejamento remoto com escolha da quantidade de tropas encaminhado ao anfitrião.
- Combate remoto com resultado de dados, baixas, conquista e avanço encaminhado ao anfitrião.
- Validação server-side de origem, alvo, fase, baixas, conquista e tropas avançadas.
- Rolagem completa de combate executada no servidor C# quando a partida está online.
- Sessão de combate persistida no servidor até a escolha do avanço.
- Sessões táticas no servidor para validar cartas disponíveis, origem e alvo.

Para executar o servidor localmente:

```powershell
& "C:\Program Files\dotnet\dotnet.exe" run --project server/Warzinho.Server
```

O servidor C# compilado é a primeira etapa da migração para partidas entre pessoas em casas diferentes. A próxima etapa é conectar o `src/App.tsx` ao hub e mover a autoridade dos turnos, combates e validações para o servidor.

## Estrutura do código

| Caminho | Responsabilidade |
| --- | --- |
| `src/App.tsx` | Estado da partida, turnos, ataques, conquistas, cartas e integração dos componentes. |
| `src/main.tsx` | Inicialização React e montagem da aplicação. |
| `src/types/war.ts` | Tipos de jogadores, territórios, objetivos, mecânicas, eventos e logs. |
| `src/data/warMapData.ts` | Continentes, territórios, vizinhanças, rotas marítimas, cores e tabela de cartas. |
| `src/data/mechanicsData.ts` | Mecânicas padrão, cartas táticas e eventos globais. |
| `src/data/objectivesData.ts` | Objetivos clássicos, objetivos expandidos e cálculo de progresso. |
| `src/components/Setup/GameSetup.tsx` | Configuração de jogadores, IA, cores e início da partida. |
| `src/components/Map/WarBoard.tsx` | Renderização e interação com o mapa SVG. |
| `src/components/Combat/CombatModal.tsx` | Dados, perdas, combate automático e avanço após conquista. |
| `src/components/Combat/ManeuverModal.tsx` | Escolha da quantidade de tropas para remanejamento. |
| `src/components/Cards/CardsModal.tsx` | Cartas de território e trocas por reforços. |
| `src/components/Modals/TacticalCardsModal.tsx` | Lista e execução das cartas táticas disponíveis. |
| `src/components/Modals/MechanicsEditorModal.tsx` | Ativação e personalização das mecânicas. |
| `src/components/Modals/ObjectivesBuilderModal.tsx` | Criação e gerenciamento de objetivos personalizados. |
| `src/components/Modals/GameLogModal.tsx` | Histórico visual da partida. |
| `src/components/Modals/VictoryModal.tsx` | Resultado e estatísticas da vitória. |
| `src/components/HUD/ActionPanel.tsx` | Ações principais do jogador durante a partida. |
| `src/components/HUD/GameHeader.tsx` | Informações da rodada e da fase atual. |
| `src/components/Objective/ObjectiveModal.tsx` | Objetivo secreto e progresso atual. |
| `src/sound/audio.ts` | Motor de áudio procedural com Web Audio API. |
| `src/index.css` | Estilos globais e utilitários visuais. |
| `server/Warzinho.Server/Program.cs` | Inicialização da API ASP.NET Core e do SignalR. |
| `server/Warzinho.Server/Services/GameHub.cs` | Operações em tempo real das salas multiplayer. |
| `server/Warzinho.Server/Services/RoomStore.cs` | Armazenamento das salas ativas em memória. |
| `server/Warzinho.Server/Models/RoomModels.cs` | Modelos de salas, jogadores e ações. |

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Motion
- Canvas Confetti
- Microsoft SignalR JavaScript Client
- Google Gemini API

## Como executar

**Pré-requisito:** Node.js

```bash
npm install
npm run dev
```

O aplicativo fica disponível em `http://localhost:3000`.

Para gerar a versão de produção:

```bash
npm run build
```

Para verificar os tipos:

```bash
npm run lint
```

Configure `GEMINI_API_KEY` em `.env.local` usando [.env.example](.env.example) como referência. Arquivos `.env` reais não devem ser enviados ao GitHub.

## Testar a sala online localmente

1. Em um terminal, inicie o servidor C#:

	```powershell
	& "C:\Program Files\dotnet\dotnet.exe" run --project server/Warzinho.Server
	```

2. Em outro terminal, inicie o cliente React:

	```bash
	npm run dev
	```

3. Abra `http://localhost:3000` em duas janelas ou dispositivos da mesma rede e use o mesmo código de sala.

O cliente já conecta os jogadores ao hub SignalR, atribui assentos, exibe a quantidade de participantes, recebe o estado completo publicado pelo anfitrião e bloqueia ações fora do turno. Seleções de território, avanço de fase, uso de cartas táticas, remanejamentos e resultados de combate remotos passam pelo servidor e são aplicados pelo anfitrião antes da sincronização. O servidor rejeita ações desconhecidas, jogadores que não pertencem à sala, ações fora do turno, resultados de combate impossíveis e cartas táticas que não estejam disponíveis ou não atendam aos requisitos. Em partidas online, a rolagem completa, as perdas, a sessão de combate até o avanço e a validação inicial das cartas já são controladas pelo servidor; a próxima etapa é mover os efeitos detalhados das cartas para essa autoridade.

## Atualizações recentes

As novidades devem ser adicionadas aqui, sempre com a mais nova primeiro. A atualização atual é o **Ataque Aéreo Estratégico**, documentado na seção de cartas táticas e implementado em `src/App.tsx`, `src/data/mechanicsData.ts` e `src/components/Modals/TacticalCardsModal.tsx`.

## Fluxo de sincronização

O código local fica em `C:\Users\mleem\Downloads\war-estratégia-global` e o repositório público está em [MLeemos/warzinho-2.0](https://github.com/MLeemos/warzinho-2.0), no branch [`local-project-import`](https://github.com/MLeemos/warzinho-2.0/tree/local-project-import).

Quando uma alteração for feita neste projeto, o fluxo deste trabalho é: atualizar o código, atualizar este README com a novidade, validar com typecheck/build, criar commit e enviar ao GitHub. O GitHub não atualiza arquivos locais automaticamente; a sincronização precisa acontecer por commit e push.
