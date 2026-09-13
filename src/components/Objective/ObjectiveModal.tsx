import React from 'react';
import { SecretObjective } from '../../types/war';
import { Target, X, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ObjectiveModalProps {
  objective: SecretObjective;
  progress: { completed: boolean; percent: number; statusText: string };
  playerName: string;
  onClose: () => void;
}

export const ObjectiveModal: React.FC<ObjectiveModalProps> = ({
  objective,
  progress,
  playerName,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/40 via-slate-950 to-amber-950/40 border-b border-amber-800/40">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-amber-400" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">
                Missão Confidencial
              </span>
              <h2 className="text-lg font-bold text-slate-100 font-['Cinzel']">
                Objetivo Secreto
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Card Simulation */}
          <div className="relative p-6 rounded-xl border-2 border-amber-500/40 bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/20 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                {objective.title}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/50">
                {objective.isCustom ? 'Mecânica Custom' : 'Oficial WAR'}
              </span>
            </div>

            <p className="text-sm font-medium text-slate-200 leading-relaxed font-['Plus_Jakarta_Sans']">
              "{objective.description}"
            </p>

            {/* Confidential Stamp Watermark */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Atribuído ao: <strong className="text-slate-200">{playerName}</strong></span>
              <span className="font-mono text-amber-500/70 uppercase">TOP SECRET</span>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Progresso da Missão:</span>
              <span className={`font-mono font-bold ${progress.completed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {progress.percent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  progress.completed 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                    : 'bg-gradient-to-r from-amber-600 to-amber-400'
                }`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              {progress.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>{progress.statusText}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Entendido, Comandante
          </button>
        </div>
      </div>
    </div>
  );
};
