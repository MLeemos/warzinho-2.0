import React from 'react';
import { GameLogEntry } from '../../types/war';
import { ScrollText, X, Swords, Shield, Sparkles, Trophy } from 'lucide-react';

interface GameLogModalProps {
  logs: GameLogEntry[];
  onClose: () => void;
}

export const GameLogModal: React.FC<GameLogModalProps> = ({ logs, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <ScrollText className="w-6 h-6 text-sky-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-['Cinzel']">
                Diário de Bordo & Histórico de Batalhas
              </h2>
              <p className="text-xs text-slate-400">
                Registro cronológico de combates, conquistas e eventos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logs list */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-2">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">Nenhum evento registrado ainda.</p>
          ) : (
            logs.slice().reverse().map(log => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3 text-xs"
              >
                <div className="p-1.5 rounded-lg bg-slate-900 shrink-0 mt-0.5 text-slate-400">
                  {log.type === 'attack' || log.type === 'conquest' ? (
                    <Swords className="w-3.5 h-3.5 text-red-400" />
                  ) : log.type === 'event' || log.type === 'mechanic' ? (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  ) : log.type === 'elimination' ? (
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>Rodada {log.turn}</span>
                    <span className="font-mono">{log.timestamp}</span>
                  </div>
                  <span className="text-slate-200 font-medium leading-relaxed">{log.text}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
