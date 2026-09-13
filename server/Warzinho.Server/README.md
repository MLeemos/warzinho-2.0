# Servidor multiplayer do Warzinho 2.0

Servidor ASP.NET Core 8 com SignalR para conectar jogadores em salas online.

## Executar

Na raiz do projeto:

```powershell
& "C:\Program Files\dotnet\dotnet.exe" run --project server/Warzinho.Server
```

Endpoints iniciais:

- `GET /health`: verifica se o servidor está funcionando.
- ` /hubs/game`: conexão SignalR para salas e ações da partida.

## Fluxo atual

1. O cliente entra em uma sala com `JoinRoom`.
2. O servidor transmite `RoomUpdated` para todos os jogadores.
3. Clientes enviam ações por `SendGameAction`.
4. O anfitrião pode publicar o estado por `PublishGameState`.
5. O servidor retransmite `GameStateUpdated` para a sala.

A próxima etapa é conectar o `App.tsx` a este hub e mover a autoridade das regras de jogo para o servidor.
