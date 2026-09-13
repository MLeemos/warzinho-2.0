using Microsoft.AspNetCore.SignalR;
using Warzinho.Server.Models;

namespace Warzinho.Server.Services;

public sealed class GameHub(RoomStore rooms) : Hub
{
    public async Task<RoomSnapshot> JoinRoom(string roomCode, string playerName)
    {
        var code = NormalizeRoomCode(roomCode);
        var name = string.IsNullOrWhiteSpace(playerName) ? "Jogador" : playerName.Trim()[..Math.Min(24, playerName.Trim().Length)];
        var room = rooms.GetOrCreate(code, Context.ConnectionId);

        if (room.Players.Values.All(player => player.ConnectionId != Context.ConnectionId))
        {
            room.Players[Context.ConnectionId] = new RoomPlayer(
                Context.ConnectionId,
                name,
                DateTimeOffset.UtcNow);
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, code);
        await Clients.Group(code).SendAsync("RoomUpdated", room.Snapshot());
        return room.Snapshot();
    }

    public async Task SendGameAction(string roomCode, GameAction action)
    {
        var room = RequireRoom(roomCode);
        await Clients.Group(room.Code).SendAsync("GameActionReceived", Context.ConnectionId, action);
    }

    public async Task PublishGameState(string roomCode, System.Text.Json.JsonElement gameState)
    {
        var room = RequireRoom(roomCode);
        if (room.HostConnectionId != Context.ConnectionId)
        {
            throw new HubException("Apenas o anfitrião pode publicar o estado da partida.");
        }

        room.GameState = gameState;
        await Clients.Group(room.Code).SendAsync("GameStateUpdated", gameState);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var room = rooms.RemovePlayer(Context.ConnectionId);
        if (room is not null)
        {
            await Clients.Group(room.Code).SendAsync("RoomUpdated", room.Snapshot());
        }

        await base.OnDisconnectedAsync(exception);
    }

    private RoomState RequireRoom(string roomCode)
    {
        var code = NormalizeRoomCode(roomCode);
        return rooms.Find(code) ?? throw new HubException("Sala não encontrada.");
    }

    private static string NormalizeRoomCode(string roomCode)
    {
        var code = new string((roomCode ?? string.Empty)
            .Where(char.IsLetterOrDigit)
            .ToArray())
            .ToUpperInvariant();

        if (code.Length is < 4 or > 12)
        {
            throw new HubException("O código da sala deve ter entre 4 e 12 caracteres.");
        }

        return code;
    }
}
