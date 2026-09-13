import React from 'react';
import { TACTICAL_CARDS, TacticalCard } from '../../data/mechanicsData';
import { Player, TerritoryState } from '../../types/war';
import { warAudio } from '../../sound/audio';
import { Zap, Plane, Shield, Eye, Users, Handshake, X, Check } from 'lucide-react';

interface TacticalCardsModalProps {
  player: Player;
  onUseTacticalAction: (actionType: TacticalCard['effect']) => void;
  onClose: () => void;
}

export const TacticalCardsModal: React.FC<TacticalCardsModalProps> = ({
  player,
  onUseTacticalAction,
  onClose
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Plane': return <Plane className="w-6 h-6 text-sky-400" />;
      case 'Shield': return <Shield className="w-6 h-6 text-emerald-400" />;
      case 'Eye': return <Eye className="w-6 h-6 text-amber-400" />;
      case 'Users': return <Users className="w-6 h-6 text-purple-400" />;
      case 'Zap': return <Zap className="w-6 h-6 text-red-400" />;
      default: return <Handshake className="w-6 h-6 text-blue-400" />;
    }
  };

  const handleAction = (card: TacticalCard) => {
    warAudio.playCard();
    onUseTacticalAction(card.effect);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-['Cinzel']">
                Operações & Táticas Especiais
              </h2>
              <p className="text-xs text-slate-400">
                Execute ações estratégicas da nova mecânica de guerra
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

        {/* List */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          {TACTICAL_CARDS.map((card) => (
            <div
              key={card.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 transition flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                  {getIcon(card.icon)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition">
                    {card.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {card.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleAction(card)}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Executar Tática</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
