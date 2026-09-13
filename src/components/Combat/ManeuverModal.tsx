import React, { useState } from 'react';
import { TERRITORIES } from '../../data/warMapData';
import { TerritoryState } from '../../types/war';
import { warAudio } from '../../sound/audio';
import { Move, ArrowRight, X } from 'lucide-react';

interface ManeuverModalProps {
  fromTerritory: TerritoryState;
  toTerritory: TerritoryState;
  onExecuteManeuver: (armiesToMove: number) => void;
  onClose: () => void;
}

export const ManeuverModal: React.FC<ManeuverModalProps> = ({
  fromTerritory,
  toTerritory,
  onExecuteManeuver,
  onClose
}) => {
  // Can move from 1 up to (armies - 1), must leave at least 1 army behind
  const maxMove = Math.max(1, fromTerritory.armies - 1);
  const [moveCount, setMoveCount] = useState(1);

  const fromName = TERRITORIES[fromTerritory.id]?.name || 'Origem';
  const toName = TERRITORIES[toTerritory.id]?.name || 'Destino';

  const handleConfirm = () => {
    warAudio.playTroopPlace();
    onExecuteManeuver(moveCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Move className="w-6 h-6 text-sky-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-['Cinzel']">
                Remanejar Exércitos
              </h2>
              <p className="text-xs text-slate-400">
                Movimentação estratégica entre seus territórios
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

        {/* Content */}
        <div className="p-6 flex flex-col items-center gap-5">
          {/* Visual Route */}
          <div className="flex items-center justify-between w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="flex flex-col items-center">
              <span className="text-[11px] text-slate-400">Origem</span>
              <span className="text-sm font-bold text-slate-100">{fromName}</span>
              <span className="font-mono text-xs text-sky-400 mt-0.5">{fromTerritory.armies} tropas</span>
            </div>

            <ArrowRight className="w-5 h-5 text-sky-400" />

            <div className="flex flex-col items-center">
              <span className="text-[11px] text-slate-400">Destino</span>
              <span className="text-sm font-bold text-slate-100">{toName}</span>
              <span className="font-mono text-xs text-emerald-400 mt-0.5">{toTerritory.armies} tropas</span>
            </div>
          </div>

          {/* Slider */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Mover:</span>
              <span className="font-mono font-bold text-sky-400 text-base">{moveCount} exércitos</span>
            </div>

            <input
              type="range"
              min={1}
              max={maxMove}
              value={moveCount}
              onChange={e => setMoveCount(parseInt(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1</span>
              <span>Deixa {fromTerritory.armies - moveCount} na origem</span>
              <span>{maxMove}</span>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full py-3 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs tracking-wide transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Move className="w-4 h-4" />
            <span>Confirmar Deslocamento de Tropas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
