import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player, SecretObjective } from '../../types/war';
import { PLAYER_COLORS } from '../../data/warMapData';
import { warAudio } from '../../sound/audio';
import { Trophy, Award, RotateCcw, CheckCircle } from 'lucide-react';

interface VictoryModalProps {
  winner: Player;
  objective: SecretObjective;
  totalTurns: number;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  objective,
  totalTurns,
  onPlayAgain
}) => {
  const colorInfo = PLAYER_COLORS[winner.color];

  useEffect(() => {
    warAudio.playVictory();
    // Confetti burst
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in zoom-in-95 duration-300">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center">
        {/* Top Trophy Icon */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-xl mb-4 animate-bounce">
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-yellow-400" />
          </div>
        </div>

        <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 mb-1 font-mono">
          VITÓRIA ABSOLUTA
        </span>

        <h1 className="text-3xl font-black text-white font-['Cinzel'] tracking-wide mb-2">
          {winner.name} Venceu o Jogo!
        </h1>

        <div
          className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
          style={{ backgroundColor: `${colorInfo.hex}30`, color: colorInfo.hex, border: `1px solid ${colorInfo.borderHex}` }}
        >
          Exércitos {colorInfo.name} Dominaram o Mundo
        </div>

        {/* Objective Card Accomplished */}
        <div className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2 mb-6 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Objetivo Secreto Cumprido: {objective.title}</span>
          </div>
          <p className="text-xs text-slate-300 italic pl-6">
            "{objective.description}"
          </p>
        </div>

        {/* Match Statistics */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Duração da Guerra</span>
            <span className="font-mono text-base font-black text-slate-100">{totalTurns} Rodadas</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Conquistas</span>
            <span className="font-mono text-base font-black text-emerald-400">
              {winner.stats.territoriesConquered} Territórios
            </span>
          </div>
        </div>

        {/* Play Again Button */}
        <button
          onClick={onPlayAgain}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm tracking-wide uppercase transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Jogar Nova Partida de WAR</span>
        </button>
      </div>
    </div>
  );
};
