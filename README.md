# War 2.0

War 2.0 é uma experiência digital de estratégia inspirada em jogos de conquista territorial. O projeto reúne mapa de guerra, objetivos, combate, cartas táticas, manobras e ferramentas para configurar e acompanhar uma partida.

## Recursos

- Tabuleiro estratégico com territórios e conexões
- Configuração de jogadores e objetivos
- Sistema de combate e manobras
- Cartas táticas
- Editor de mecânicas e construtor de objetivos
- Registro de eventos da partida
- Interface responsiva para desktop

## Atualizações recentes

As novidades mais recentes ficam nesta seção, sempre com a alteração mais nova primeiro.

### Ataque Aéreo Estratégico

- Exige pelo menos 20 soldados no território de origem.
- Permite escolher quantos soldados serão comprometidos no ataque.
- Metade do efetivo escolhido é consumida como custo da operação.
- Sorteia um território inimigo em qualquer lugar do mapa.
- Usa o combate normal, incluindo dados e defesa do território.
- O defensor pode vencer e causar as baixas normalmente.
- Em caso de vitória, o território é conquistado e os sobreviventes avançam para ocupá-lo.
- A carta é consumida quando utilizada.

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Motion
- Google Gemini API

## Como executar

**Pré-requisitos:** Node.js

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure a chave da API Gemini no arquivo `.env.local` usando [.env.example](.env.example) como referência:

   ```env
   GEMINI_API_KEY=sua-chave-aqui
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

O aplicativo estará disponível em `http://localhost:3000`.

## Build de produção

```bash
npm run build
```

## Repositório

O projeto está publicado como repositório público em [MLeemos/warzinho-2.0](https://github.com/MLeemos/warzinho-2.0). A versão atual dos arquivos está no branch [`local-project-import`](https://github.com/MLeemos/warzinho-2.0/tree/local-project-import).
