import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel
} from '@microsoft/signalr';

export interface OnlineRoomPlayer {
  playerId: string;
  connectionId: string;
  name: string;
  joinedAt: string;
}

export interface OnlineRoomSnapshot {
  code: string;
  hostConnectionId: string;
  players: OnlineRoomPlayer[];
  gameState: unknown | null;
}

export interface CombatRollResult {
  attackerDice: number[];
  defenderDice: number[];
  attackerLosses: number;
  defenderLosses: number;
  attackerRemaining: number;
  defenderRemaining: number;
  conquered: boolean;
}

export class GameClient {
  private readonly connection: HubConnection;

  constructor(serverUrl = import.meta.env.VITE_GAME_SERVER_URL || 'http://localhost:5000') {
    this.connection = new HubConnectionBuilder()
      .withUrl(`${serverUrl.replace(/\/$/, '')}/hubs/game`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
  }

  async connect(): Promise<void> {
    if (this.connection.state === 'Disconnected') {
      await this.connection.start();
    }
  }

  async joinRoom(roomCode: string, playerName: string): Promise<OnlineRoomSnapshot> {
    await this.connect();
    return this.connection.invoke<OnlineRoomSnapshot>('JoinRoom', roomCode, playerName);
  }

  getConnectionId(): string | null {
    return this.connection.connectionId;
  }

  onRoomUpdated(handler: (room: OnlineRoomSnapshot) => void): void {
    this.connection.on('RoomUpdated', handler);
  }

  onGameAction(handler: (connectionId: string, action: unknown) => void): () => void {
    this.connection.on('GameActionReceived', handler);
    return () => this.connection.off('GameActionReceived', handler);
  }

  onGameStateUpdated(handler: (state: unknown) => void): void {
    this.connection.on('GameStateUpdated', handler);
  }

  async sendGameAction(roomCode: string, action: unknown): Promise<void> {
    await this.connection.invoke('SendGameAction', roomCode, action);
  }

  async publishGameState(roomCode: string, state: unknown): Promise<void> {
    await this.connection.invoke('PublishGameState', roomCode, state);
  }

  async rollCombat(roomCode: string, sourceId: string, targetId: string): Promise<CombatRollResult> {
    return this.connection.invoke<CombatRollResult>('RollCombat', roomCode, sourceId, targetId);
  }

  async resolveFortification(roomCode: string, territoryId: string): Promise<unknown> {
    return this.connection.invoke('ResolveFortification', roomCode, territoryId);
  }

  async disconnect(): Promise<void> {
    await this.connection.stop();
  }
}
