using System.Text.Json;

namespace Warzinho.Server.Models;

public sealed class RoomState
{
    public string Code { get; init; } = string.Empty;
    public string HostConnectionId { get; set; } = string.Empty;
    public Dictionary<string, RoomPlayer> Players { get; } = new();
    public JsonElement? GameState { get; set; }
    public CombatSession? ActiveCombat { get; set; }
    public TacticalSession? ActiveTacticalAction { get; set; }

    public RoomSnapshot Snapshot() => new(
        Code,
        HostConnectionId,
        Players.Values.OrderBy(player => player.JoinedAt).ToArray(),
        GameState);
}

public sealed record RoomPlayer(
    string PlayerId,
    string ConnectionId,
    string Name,
    DateTimeOffset JoinedAt);

public sealed record RoomSnapshot(
    string Code,
    string HostConnectionId,
    IReadOnlyCollection<RoomPlayer> Players,
    JsonElement? GameState);

public sealed record GameAction(
    string Type,
    JsonElement Payload);

public sealed record CombatSession(
    string PlayerId,
    string SourceId,
    string TargetId,
    int AttackerRemaining,
    int DefenderRemaining,
    bool Conquered);

public sealed class TacticalSession
{
    public string PlayerId { get; init; } = string.Empty;
    public string CardId { get; init; } = string.Empty;
    public string? SourceId { get; set; }
    public string? TargetId { get; set; }
    public int CommittedArmies { get; set; }
    public int CombatArmies { get; set; }
}
