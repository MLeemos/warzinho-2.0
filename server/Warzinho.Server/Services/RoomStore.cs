using Warzinho.Server.Models;

namespace Warzinho.Server.Services;

public sealed class RoomStore
{
    private readonly object sync = new();
    private readonly Dictionary<string, RoomState> rooms = new(StringComparer.OrdinalIgnoreCase);

    public RoomState GetOrCreate(string code, string connectionId)
    {
        lock (sync)
        {
            if (!rooms.TryGetValue(code, out var room))
            {
                room = new RoomState
                {
                    Code = code,
                    HostConnectionId = connectionId
                };
                rooms[code] = room;
            }

            return room;
        }
    }

    public RoomState? Find(string code)
    {
        lock (sync)
        {
            rooms.TryGetValue(code, out var room);
            return room;
        }
    }

    public RoomState? RemovePlayer(string connectionId)
    {
        lock (sync)
        {
            foreach (var room in rooms.Values.ToArray())
            {
                if (!room.Players.Remove(connectionId))
                {
                    continue;
                }

                if (room.HostConnectionId == connectionId)
                {
                    room.HostConnectionId = room.Players.Values
                        .OrderBy(player => player.JoinedAt)
                        .Select(player => player.ConnectionId)
                        .FirstOrDefault() ?? string.Empty;
                }

                if (room.Players.Count == 0)
                {
                    rooms.Remove(room.Code);
                }

                return room;
            }

            return null;
        }
    }
}
