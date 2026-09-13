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

    public CombatRollResult RollCombat(string roomCode, string sourceId, string targetId)
    {
        var room = RequireRoom(roomCode);
        var player = room.Players.GetValueOrDefault(Context.ConnectionId)
            ?? throw new HubException("Você não está conectado a esta sala.");

        if (!room.GameState.HasValue)
        {
            throw new HubException("A partida ainda não foi iniciada.");
        }

        var gameState = room.GameState.Value;
        ValidateActiveTurn(gameState, player);
        ValidateCombatTarget(player, gameState, sourceId, targetId, out var source, out var target);

        var attackerArmies = source.GetPropertyOrDefault("armies", 0);
        var defenderArmies = target.GetPropertyOrDefault("armies", 0);
        var attackerDice = new List<int>();
        var defenderDice = new List<int>();
        var attackerLosses = 0;
        var defenderLosses = 0;

        while (attackerArmies > 1 && defenderArmies > 0)
        {
            var attackerRoll = Enumerable.Range(0, Math.Min(3, attackerArmies - 1))
                .Select(_ => Random.Shared.Next(1, 7))
                .OrderByDescending(value => value)
                .ToArray();
            var defenderRoll = Enumerable.Range(0, Math.Min(3, defenderArmies))
                .Select(_ => Random.Shared.Next(1, 7))
                .OrderByDescending(value => value)
                .ToArray();

            attackerDice = attackerRoll.ToList();
            defenderDice = defenderRoll.ToList();

            for (var index = 0; index < Math.Min(attackerRoll.Length, defenderRoll.Length); index++)
            {
                if (attackerRoll[index] > defenderRoll[index])
                {
                    defenderArmies--;
                    defenderLosses++;
                }
                else
                {
                    attackerArmies--;
                    attackerLosses++;
                }
            }
        }

        return new CombatRollResult(
            attackerDice,
            defenderDice,
            attackerLosses,
            defenderLosses,
            attackerArmies,
            defenderArmies,
            defenderArmies == 0);
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

        if (action.Type == "resolve-combat")
        {
            ValidateCombatResult(player, gameState, action.Payload);
        }
    }

    private static void ValidateCombatResult(RoomPlayer player, JsonElement gameState, JsonElement payload)
    {
        var sourceId = payload.GetPropertyOrNull("sourceId");
        var targetId = payload.GetPropertyOrNull("targetId");
        if (string.IsNullOrWhiteSpace(sourceId) || string.IsNullOrWhiteSpace(targetId))
        {
            throw new HubException("O combate precisa informar origem e alvo.");
        }

        if (!gameState.TryGetProperty("currentPhase", out var phaseProperty)
            || !string.Equals(phaseProperty.GetString(), "attack", StringComparison.Ordinal))
        {
            throw new HubException("Combates só podem acontecer na fase de ataque.");
        }

        ValidateCombatTarget(player, gameState, sourceId, targetId, out var source, out var target);
        var sourceOwner = source.GetPropertyOrNull("ownerId");
        var targetOwner = target.GetPropertyOrNull("ownerId");
        var sourceArmies = source.GetPropertyOrDefault("armies", 0);
        var targetArmies = target.GetPropertyOrDefault("armies", 0);
        var attackerRemaining = payload.GetPropertyOrDefault("attackerRemaining", -1);
        var defenderRemaining = payload.GetPropertyOrDefault("defenderRemaining", -1);
        var movedArmies = payload.GetPropertyOrDefault("movedArmies", 0);
        var conquered = payload.GetPropertyOrDefault("conquered", false);

        if (!string.Equals(sourceOwner, player.PlayerId, StringComparison.Ordinal)
            || string.Equals(targetOwner, player.PlayerId, StringComparison.Ordinal))
        {
            throw new HubException("O combate usa territórios inválidos para este jogador.");
        }

        if (sourceArmies < 2 || attackerRemaining < 1 || attackerRemaining + movedArmies > sourceArmies)
        {
            throw new HubException("Quantidade de tropas atacantes inválida.");
        }

        if (defenderRemaining < 0 || defenderRemaining > targetArmies)
        {
            throw new HubException("Quantidade de tropas defensoras inválida.");
        }

        if (conquered != (defenderRemaining == 0))
        {
            throw new HubException("O resultado de conquista não corresponde às tropas defensoras.");
        }

        if (!conquered && movedArmies != 0)
        {
            throw new HubException("Não é possível avançar tropas sem conquistar o território.");
        }

        if (conquered && (movedArmies < 1 || movedArmies >= sourceArmies))
        {
            throw new HubException("A conquista precisa deixar tropas na origem e avançar sobreviventes.");
        }
    }

    private static void ValidateActiveTurn(JsonElement gameState, RoomPlayer player)
    {
        var activePlayerId = GetActivePlayerId(gameState);
        if (!string.Equals(activePlayerId, player.PlayerId, StringComparison.Ordinal))
        {
            throw new HubException("Aguarde o seu turno para realizar esta ação.");
        }
    }

    private static string? GetActivePlayerId(JsonElement gameState)
    {
        if (!gameState.TryGetProperty("activePlayerIndex", out var activeIndexProperty)
            || !activeIndexProperty.TryGetInt32(out var activePlayerIndex)
            || !gameState.TryGetProperty("players", out var playersProperty)
            || playersProperty.ValueKind != JsonValueKind.Array)
        {
            throw new HubException("O estado da partida está incompleto.");
        }

        return playersProperty.EnumerateArray()
            .ElementAtOrDefault(activePlayerIndex)
            .GetPropertyOrNull("id");
    }

    private static void ValidateCombatTarget(
        RoomPlayer player,
        JsonElement gameState,
        string sourceId,
        string targetId,
        out JsonElement source,
        out JsonElement target)
    {
        if (!gameState.TryGetProperty("territories", out var territories)
            || territories.ValueKind != JsonValueKind.Object
            || !territories.TryGetProperty(sourceId, out source)
            || !territories.TryGetProperty(targetId, out target))
        {
            throw new HubException("Origem ou alvo do combate não existe.");
        }

        var sourceOwner = source.GetPropertyOrNull("ownerId");
        var targetOwner = target.GetPropertyOrNull("ownerId");
        if (!string.Equals(sourceOwner, player.PlayerId, StringComparison.Ordinal)
            || string.Equals(targetOwner, player.PlayerId, StringComparison.Ordinal))
        {
            throw new HubException("O combate usa territórios inválidos para este jogador.");
        }

        if (source.GetPropertyOrDefault("armies", 0) < 2 || target.GetPropertyOrDefault("armies", 0) < 1)
        {
            throw new HubException("Os territórios não têm tropas suficientes para combater.");
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

public sealed record CombatRollResult(
    IReadOnlyCollection<int> AttackerDice,
    IReadOnlyCollection<int> DefenderDice,
    int AttackerLosses,
    int DefenderLosses,
    int AttackerRemaining,
    int DefenderRemaining,
    bool Conquered);

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

    public static int GetPropertyOrDefault(this JsonElement element, string propertyName, int fallback)
    {
        return element.ValueKind == JsonValueKind.Object
            && element.TryGetProperty(propertyName, out var property)
            && property.TryGetInt32(out var value)
            ? value
            : fallback;
    }

    public static bool GetPropertyOrDefault(this JsonElement element, string propertyName, bool fallback)
    {
        return element.ValueKind == JsonValueKind.Object
            && element.TryGetProperty(propertyName, out var property)
            && property.ValueKind is JsonValueKind.True or JsonValueKind.False
            ? property.GetBoolean()
            : fallback;
    }
}
