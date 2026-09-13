import React, { useState } from 'react';
import { PLAYER_COLORS } from '../../data/warMapData';
import { ActiveMechanics, Player, PlayerColor, SecretObjective } from '../../types/war';
import { OnlineRoomSnapshot } from '../../multiplayer/gameClient';
import { Swords, Bot, User, Play, Sparkles, Sliders, Target, Shield, Info, Wifi, Users } from 'lucide-react';

interface GameSetupProps {
  onStartGame: (players: Player[], mechanics: ActiveMechanics) => void;
  onOpenObjectivesBuilder: () => void;
  onOpenMechanicsEditor: () => void;
  onJoinOnlineRoom: (roomCode: string, playerName: string) => Promise<void>;
  onlineRoom: OnlineRoomSnapshot | null;
  onlineStatus: string;
  activeMechanics: ActiveMechanics;
  objectivesDeck: SecretObjective[];
}

export const GameSetup: React.FC<GameSetupProps> = ({
  onStartGame,
  onOpenObjectivesBuilder,
  onOpenMechanicsEditor,
  onJoinOnlineRoom,
  onlineRoom,
  onlineStatus,
  activeMechanics,
  objectivesDeck
}) => {
  const [numPlayers, setNumPlayers] = useState<number>(4);
  const [roomCode, setRoomCode] = useState('');
  const [onlineName, setOnlineName] = useState('');
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [playerConfigs, setPlayerConfigs] = useState<Array<{ name: string; color: PlayerColor; isAI: boolean }>>([
    { name: 'Comandante Humano', color: 'red', isAI: false },
    { name: 'General Áquila (IA)', color: 'blue', isAI: true },
    { name: 'General Barão (IA)', color: 'green', isAI: true },
    { name: 'General Centauro (IA)', color: 'yellow', isAI: true },
    { name: 'General Dragão (IA)', color: 'white', isAI: true },
    { name: 'General Fênix (IA)', color: 'black', isAI: true },
  ]);

  const defaultColors: PlayerColor[] = ['red', 'blue', 'green', 'yellow', 'white', 'black'];

  const handleNumChange = (newCount: number) => {
    setNumPlayers(newCount);
  };

  const toggleAI = (idx: number) => {
    const updated = [...playerConfigs];
    updated[idx].isAI = !updated[idx].isAI;
    if (!updated[idx].isAI && updated[idx].name.includes('(IA)')) {
      updated[idx].name = `Jogador ${idx + 1}`;
    } else if (updated[idx].isAI && !updated[idx].name.includes('(IA)')) {
      updated[idx].name = `General IA ${idx + 1}`;
    }
    setPlayerConfigs(updated);
  };

  const handleNameChange = (idx: number, name: string) => {
    const updated = [...playerConfigs];
    updated[idx].name = name;
    setPlayerConfigs(updated);
  };

  const handleColorChange = (idx: number, color: PlayerColor) => {
    const updated = [...playerConfigs];
    updated[idx].color = color;
    setPlayerConfigs(updated);
  };

  const handleStart = () => {
    // Build actual player objects
    const activeConfigs = playerConfigs.slice(0, numPlayers);
    const assignedPlayers: Player[] = activeConfigs.map((cfg, idx) => ({
      id: `p_${idx + 1}`,
      name: onlineRoom?.players[idx]?.name || cfg.name.trim() || `Jogador ${idx + 1}`,
      color: cfg.color,
      isAI: onlineRoom?.players[idx] ? false : cfg.isAI,
      objectiveId: '',
      cards: [],
      tacticalCards: ['tac_air_strike'],
      eliminated: false,
      stats: {
        territoriesLost: 0,
        territoriesConquered: 0,
        armiesDefeated: 0,
        armiesLost: 0
      }
    }));

    onStartGame(assignedPlayers, activeMechanics);
  };

  const handleJoinRoom = async () => {
    setIsJoiningRoom(true);
    try {
      await onJoinOnlineRoom(roomCode, onlineName);
    } finally {
      setIsJoiningRoom(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
      {/* Background World Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-slate-950 to-black pointer-events-none" />

      <div className="relative w-full max-w-3xl flex flex-col items-center gap-6 z-10 py-6">
        {/* Title Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/50 text-red-400 text-xs font-bold tracking-widest uppercase">
            <Swords className="w-3.5 h-3.5" /> Edição Especial de Guerra & Estratégia
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-widest font-['Cinzel'] text-white drop-shadow-md">
            WAR • GROW
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg font-['Plus_Jakarta_Sans']">
            Jogo de conquista de territórios sobre o mapa clássico oficial de 42 territórios, com criação livre de novas mecânicas e objetivos personalizados.
          </p>
        </div>

        {/* Quick Action Buttons for Builders */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            onClick={onOpenObjectivesBuilder}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-amber-950/60 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-bold transition flex items-center gap-2 shadow cursor-pointer"
          >
            <Target className="w-4 h-4 text-amber-400" />
            <span>Criar / Editar Objetivos ({objectivesDeck.length})</span>
          </button>

          <button
            onClick={onOpenMechanicsEditor}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-sky-950/60 border border-sky-500/40 hover:border-sky-400 text-sky-300 text-xs font-bold transition flex items-center gap-2 shadow cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Oficina de Regras & Novas Mecânicas</span>
          </button>
        </div>

        <div className="w-full rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <Wifi className="h-5 w-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-cyan-200">Partida online</h2>
              <p className="text-xs text-slate-400">Entre na mesma sala com seus amigos pelo celular ou PC.</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input
              value={onlineName}
              onChange={event => setOnlineName(event.target.value)}
              placeholder="Seu nome"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400"
            />
            <input
              value={roomCode}
              onChange={event => setRoomCode(event.target.value.toUpperCase())}
              placeholder="Código da sala"
              maxLength={12}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs uppercase text-slate-100 outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleJoinRoom}
              disabled={isJoiningRoom || roomCode.trim().length < 4 || !onlineName.trim()}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isJoiningRoom ? 'Conectando...' : 'Entrar'}
            </button>
          </div>
          {onlineStatus && <p className="mt-3 text-xs text-amber-300">{onlineStatus}</p>}
          {onlineRoom && (
            <div className="mt-4 space-y-2 text-xs text-cyan-200">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Sala {onlineRoom.code}: {onlineRoom.players.length} jogador(es) conectado(s).</span>
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {onlineRoom.players.map(player => (
                  <span key={player.connectionId} className="rounded bg-slate-950/70 px-2 py-1 text-slate-300">
                    {player.playerId}: {player.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Setup Card */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur flex flex-col gap-6">
          {/* Number of Players Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-widest text-slate-300">
                Número de Generais (2 a 6):
              </span>
              <span className="text-xs font-mono font-black text-sky-400">
                {numPlayers} Jogadores
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumChange(num)}
                  className={`py-2.5 rounded-xl font-mono text-sm font-bold border transition cursor-pointer ${
                    numPlayers === num
                      ? 'bg-sky-600 border-sky-400 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {num} Jogadores
                </button>
              ))}
            </div>
          </div>

          {/* Players Roster */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-300">
              Configuração dos Comandantes:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {playerConfigs.slice(0, numPlayers).map((cfg, idx) => {
                const colorInfo = PLAYER_COLORS[cfg.color];
                return (
                  <div
                    key={`player-cfg-${idx}`}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-5 h-5 rounded-md border shrink-0 shadow-sm"
                          style={{ backgroundColor: colorInfo.hex, borderColor: colorInfo.borderHex }}
                        />
                        <input
                          type="text"
                          value={cfg.name}
                          onChange={e => handleNameChange(idx, e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-sky-400 focus:outline-none text-xs font-bold text-slate-200 w-full"
                        />
                      </div>

                      {/* AI vs Human Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleAI(idx)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition flex items-center gap-1.5 cursor-pointer ${
                          cfg.isAI
                            ? 'bg-purple-950/60 border-purple-700 text-purple-300'
                            : 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                        }`}
                      >
                        {cfg.isAI ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        <span>{cfg.isAI ? 'IA' : 'Humano'}</span>
                      </button>
                    </div>

                    {/* Color picker */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-900">
                      <span className="text-[10px] text-slate-500 mr-1">Cor:</span>
                      {defaultColors.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleColorChange(idx, c)}
                          className={`w-4 h-4 rounded-full border transition cursor-pointer ${
                            cfg.color === c ? 'ring-2 ring-sky-400 scale-110' : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: PLAYER_COLORS[c].hex, borderColor: PLAYER_COLORS[c].borderHex }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Mechanics Summary Badge */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>
                Mecânicas Ativas: 
                <strong className="text-slate-200 ml-1">
                  {[
                    activeMechanics.airStrikes && 'Ataque Aéreo',
                    activeMechanics.fortifications && 'Fortalezas',
                    activeMechanics.globalEvents && 'Eventos Globais',
                    activeMechanics.tacticalCards && 'Cartas Táticas',
                    activeMechanics.fogOfWar && 'Nevoeiro de Guerra'
                  ].filter(Boolean).join(', ') || 'Modo Clássico'}
                </strong>
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenMechanicsEditor}
              className="text-sky-400 hover:text-sky-300 font-semibold underline text-xs"
            >
              Ajustar
            </button>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-base tracking-widest uppercase transition shadow-xl flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Distribuir Territórios & Iniciar Partida</span>
          </button>
        </div>
      </div>
    </div>
  );
};
