using System.Text.Json;
using System.Text.Json.Nodes;
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
        if (action.Type == "resolve-combat")
        {
            room.ActiveCombat = null;
        }

        if (action.Type == "select-territory" && room.ActiveTacticalAction?.TargetId is not null)
        {
            room.ActiveTacticalAction = null;
        }

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

        room.ActiveCombat = new CombatSession(
            player.PlayerId,
            sourceId,
            targetId,
            attackerArmies,
            defenderArmies,
            defenderArmies == 0);

        return new CombatRollResult(
            attackerDice,
            defenderDice,
            attackerLosses,
            defenderLosses,
            attackerArmies,
            defenderArmies,
            defenderArmies == 0);
    }

    public async Task<JsonElement> ResolveFortification(string roomCode, string territoryId)
    {
        var room = RequireRoom(roomCode);
        var player = room.Players.GetValueOrDefault(Context.ConnectionId)
            ?? throw new HubException("Você não está conectado a esta sala.");
        var session = room.ActiveTacticalAction;

        if (session is null || session.CardId != "tac_fortify" || session.PlayerId != player.PlayerId)
        {
            throw new HubException("Nenhuma Fortaleza está aguardando um território.");
        }

        if (!room.GameState.HasValue)
        {
            throw new HubException("A partida ainda não foi iniciada.");
        }

        var root = JsonNode.Parse(room.GameState.Value.GetRawText())?.AsObject()
            ?? throw new HubException("O estado da partida está inválido.");
        var territories = root["territories"]?.AsObject()
            ?? throw new HubException("Os territórios não foram encontrados.");
        var territory = territories[territoryId]?.AsObject()
            ?? throw new HubException("Território não encontrado.");

        if (!string.Equals(territory["ownerId"]?.GetValue<string>(), player.PlayerId, StringComparison.Ordinal))
        {
            throw new HubException("A Fortaleza só pode ser construída em território próprio.");
        }

        territory["fortified"] = true;
        RemoveTacticalCard(root, player.PlayerId, "tac_fortify");
        room.GameState = JsonSerializer.Deserialize<JsonElement>(root.ToJsonString());
        room.ActiveTacticalAction = null;
        await Clients.Group(room.Code).SendAsync("GameStateUpdated", room.GameState.Value);
        return room.GameState.Value;
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

    private void ValidateAction(RoomState room, RoomPlayer player, GameAction action)
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
            ValidateCombatResult(room, player, gameState, action.Payload);
        }

        if (action.Type == "use-card")
        {
            ValidateTacticalCard(room, player, gameState, action.Payload);
        }

        if (action.Type == "select-territory")
        {
            ValidateTacticalSelection(room, player, gameState, action.Payload);
        }
    }

    private static void ValidateTacticalCard(RoomState room, RoomPlayer player, JsonElement gameState, JsonElement payload)
    {
        var cardId = payload.GetPropertyOrNull("cardId");
        var tacticalCards = GetActivePlayer(gameState).GetPropertyOrDefault("tacticalCards", Array.Empty<string>());
        if (string.IsNullOrWhiteSpace(cardId) || !tacticalCards.Contains(cardId, StringComparer.Ordinal))
        {
            throw new HubException("Esta carta tática não está disponível para o jogador.");
        }

        var supportedCards = new[]
        {
            "tac_air_strike",
            "tac_fortify",
            "tac_spy",
            "tac_emergency_recruits",
            "tac_blitzkrieg",
            "tac_peace"
        };
        if (!supportedCards.Contains(cardId, StringComparer.Ordinal))
        {
            throw new HubException("Carta tática desconhecida.");
        }

        room.ActiveTacticalAction = cardId is "tac_air_strike" or "tac_fortify"
            ? new TacticalSession
            {
                PlayerId = player.PlayerId,
                CardId = cardId
            }
            : null;
    }

    private static void ValidateTacticalSelection(RoomState room, RoomPlayer player, JsonElement gameState, JsonElement payload)
    {
        var session = room.ActiveTacticalAction;
        if (session is null || session.PlayerId != player.PlayerId) return;

        var territoryId = payload.GetPropertyOrNull("territoryId");
        if (string.IsNullOrWhiteSpace(territoryId)
            || !gameState.TryGetProperty("territories", out var territories)
            || !territories.TryGetProperty(territoryId, out var territory))
        {
            throw new HubException("Território inválido para a carta tática.");
        }

        var ownerId = territory.GetPropertyOrNull("ownerId");
        var armies = territory.GetPropertyOrDefault("armies", 0);

        if (session.CardId == "tac_air_strike")
        {
            if (session.SourceId is null)
            {
                if (ownerId != player.PlayerId || armies < 20)
                {
                    throw new HubException("O Ataque Aéreo exige um território próprio com pelo menos 20 tropas.");
                }

                session.SourceId = territoryId;
            }
            else if (ownerId == player.PlayerId)
            {
                throw new HubException("O alvo do Ataque Aéreo precisa ser inimigo.");
            }
            else
            {
                session.TargetId = territoryId;
            }
        }
        else if (session.CardId == "tac_fortify" && ownerId != player.PlayerId)
        {
            throw new HubException("A Fortaleza só pode ser construída em território próprio.");
        }
        else if (session.CardId == "tac_fortify")
        {
            session.TargetId = territoryId;
        }
    }

    private static void RemoveTacticalCard(JsonObject root, string playerId, string cardId)
    {
        if (root["players"] is not JsonArray players) return;

        foreach (var playerNode in players.OfType<JsonObject>())
        {
            if (!string.Equals(playerNode["id"]?.GetValue<string>(), playerId, StringComparison.Ordinal)) continue;
            if (playerNode["tacticalCards"] is not JsonArray cards) return;

            for (var index = cards.Count - 1; index >= 0; index--)
            {
                if (string.Equals(cards[index]?.GetValue<string>(), cardId, StringComparison.Ordinal))
                {
                    cards.RemoveAt(index);
                    return;
                }
            }
        }
    }

    private static void ValidateCombatResult(RoomState room, RoomPlayer player, JsonElement gameState, JsonElement payload)
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

        var combat = room.ActiveCombat;
        if (combat is null
            || !string.Equals(combat.PlayerId, player.PlayerId, StringComparison.Ordinal)
            || !string.Equals(combat.SourceId, sourceId, StringComparison.Ordinal)
            || !string.Equals(combat.TargetId, targetId, StringComparison.Ordinal))
        {
            throw new HubException("A sessão de combate não está ativa ou não corresponde a este jogador.");
        }

        if (conquered != combat.Conquered || defenderRemaining != combat.DefenderRemaining)
        {
            throw new HubException("O resultado não corresponde à rolagem realizada pelo servidor.");
        }

        if (attackerRemaining + movedArmies != combat.AttackerRemaining)
        {
            throw new HubException("As tropas sobreviventes não correspondem ao resultado do combate.");
        }

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

        if (conquered && (movedArmies < 1 || movedArmies >= combat.AttackerRemaining))
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
        return GetActivePlayer(gameState).GetPropertyOrNull("id");
    }

    private static JsonElement GetActivePlayer(JsonElement gameState)
    {
        if (!gameState.TryGetProperty("activePlayerIndex", out var activeIndexProperty)
            || !activeIndexProperty.TryGetInt32(out var activePlayerIndex)
            || !gameState.TryGetProperty("players", out var playersProperty)
            || playersProperty.ValueKind != JsonValueKind.Array)
        {
            throw new HubException("O estado da partida está incompleto.");
        }

        var activePlayer = playersProperty.EnumerateArray().ElementAtOrDefault(activePlayerIndex);
        if (activePlayer.ValueKind != JsonValueKind.Object)
        {
            throw new HubException("O jogador ativo não foi encontrado.");
        }

        return activePlayer;
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

    public static string[] GetPropertyOrDefault(this JsonElement element, string propertyName, string[] fallback)
    {
        if (element.ValueKind != JsonValueKind.Object
            || !element.TryGetProperty(propertyName, out var property)
            || property.ValueKind != JsonValueKind.Array)
        {
            return fallback;
        }

        return property.EnumerateArray()
            .Where(item => item.ValueKind == JsonValueKind.String)
            .Select(item => item.GetString()!)
            .ToArray();
    }
}
