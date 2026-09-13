using System.Text.Json;
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
                GetNextPlayerId(room),
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
        var player = room.Players.GetValueOrDefault(Context.ConnectionId)
            ?? throw new HubException("Você não está conectado a esta sala.");

        ValidateAction(room, player, action);
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

    private static void ValidateAction(RoomState room, RoomPlayer player, GameAction action)
    {
        var allowedActions = new[]
        {
            "select-territory",
            "place-army",
            "attack",
            "resolve-combat",
            "maneuver",
            "use-card",
            "next-phase"
        };

        if (!allowedActions.Contains(action.Type, StringComparer.Ordinal))
        {
            throw new HubException("Ação de jogo desconhecida.");
        }

        if (!room.GameState.HasValue || room.GameState.Value.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined)
        {
            throw new HubException("A partida ainda não foi iniciada.");
        }

        var gameState = room.GameState.Value;
        if (!gameState.TryGetProperty("activePlayerIndex", out var activeIndexProperty)
            || !activeIndexProperty.TryGetInt32(out var activePlayerIndex)
            || !gameState.TryGetProperty("players", out var playersProperty)
            || playersProperty.ValueKind != JsonValueKind.Array)
        {
            throw new HubException("O estado da partida está incompleto.");
        }

        var activePlayerId = playersProperty.EnumerateArray()
            .ElementAtOrDefault(activePlayerIndex)
            .GetPropertyOrNull("id");

        if (!string.Equals(activePlayerId, player.PlayerId, StringComparison.Ordinal))
        {
            throw new HubException("Aguarde o seu turno para realizar esta ação.");
        }
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

    private static string GetNextPlayerId(RoomState room)
    {
        var usedIds = room.Players.Values
            .Select(player => player.PlayerId)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        for (var index = 1; index <= 6; index++)
        {
            var candidate = $"p_{index}";
            if (!usedIds.Contains(candidate)) return candidate;
        }

        throw new HubException("A sala já atingiu o limite de 6 jogadores.");
    }
}

internal static class JsonElementExtensions
{
    public static string? GetPropertyOrNull(this JsonElement element, string propertyName)
    {
        return element.ValueKind == JsonValueKind.Object
            && element.TryGetProperty(propertyName, out var property)
            && property.ValueKind == JsonValueKind.String
            ? property.GetString()
            : null;
    }
}
