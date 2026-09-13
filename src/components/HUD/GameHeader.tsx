import React from 'react';
import { CONTINENTS, PLAYER_COLORS } from '../../data/warMapData';
import { GlobalEvent, Player, TurnPhase } from '../../types/war';
import { warAudio } from '../../sound/audio';
import { Volume2, VolumeX, Shield, Swords, Move, Sparkles, AlertCircle } from 'lucide-react';

interface GameHeaderProps {
  activePlayer: Player;
  currentPhase: TurnPhase;
  reserveArmies: number;
  currentRound: number;
  activeGlobalEvent: GlobalEvent | null;
  onToggleAudio: () => void;
  audioEnabled: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  activePlayer,
  currentPhase,
  reserveArmies,
  currentRound,
  activeGlobalEvent,
  onToggleAudio,
  audioEnabled
}) => {
  const colorInfo = PLAYER_COLORS[activePlayer.color];

  const getPhaseInfo = () => {
    switch (currentPhase) {
      case 'reinforce':
        return {
          title: 'Distribuição de Exércitos',
          desc: `Clique em seus territórios para posicionar as tropas (${reserveArmies} restantes)`,
          icon: <Shield className="w-4 h-4 text-emerald-400" />,
          colorClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40'
        };
      case 'attack':
        return {
          title: 'Fase de Ataque',
          desc: 'Selecione um território seu (com 2+ tropas) e em seguida um inimigo adjacente para atacar',
          icon: <Swords className="w-4 h-4 text-red-400" />,
          colorClass: 'text-red-400 border-red-500/40 bg-red-950/40'
        };
      case 'maneuver':
        return {
          title: 'Remanejamento de Tropas',
          desc: 'Transfira exércitos entre territórios seus conectados antes de passar a vez',
          icon: <Move className="w-4 h-4 text-sky-400" />,
          colorClass: 'text-sky-400 border-sky-500/40 bg-sky-950/40'
        };
      default:
        return {
          title: 'Turno Concluído',
          desc: 'Aguarde o próximo general...',
          icon: null,
          colorClass: 'text-slate-400 border-slate-700 bg-slate-900'
        };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <header className="w-full bg-slate-950/95 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 select-none z-30">
      {/* Active Player Profile Banner */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg border-2"
          style={{ backgroundColor: colorInfo.hex, borderColor: colorInfo.borderHex }}
        >
          {activePlayer.name.charAt(0)}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-100 font-['Cinzel'] tracking-wide">
              {activePlayer.name}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ backgroundColor: `${colorInfo.hex}25`, color: colorInfo.hex }}>
              {colorInfo.name}
            </span>
            {activePlayer.isAI && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                IA
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            Rodada <strong className="text-slate-200">{currentRound}</strong>
          </span>
        </div>
      </div>

      {/* Phase Indicator Pill */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border max-w-md" style={{ borderColor: 'rgba(51, 65, 85, 0.8)' }}>
        <div className={`p-1 rounded-lg border ${phaseInfo.colorClass}`}>
          {phaseInfo.icon}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-200">
            {phaseInfo.title}
          </span>
          <span className="text-[10px] text-slate-400 truncate max-w-xs">
            {phaseInfo.desc}
          </span>
        </div>
        {currentPhase === 'reinforce' && (
          <div className="ml-2 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono text-xs font-black shrink-0 animate-pulse">
            +{reserveArmies}
          </div>
        )}
      </div>

      {/* Global Event ticker & Audio control */}
      <div className="flex items-center gap-3">
        {activeGlobalEvent && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="truncate max-w-[180px] font-semibold">{activeGlobalEvent.name}</span>
          </div>
        )}

        <button
          onClick={onToggleAudio}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          title={audioEnabled ? 'Mutar Efeitos Sonoros' : 'Ativar Efeitos Sonoros'}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </div>
    </header>
  );
};
