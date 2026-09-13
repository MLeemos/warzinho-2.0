import React, { useState } from 'react';
import { CARD_TRADE_TABLE, CONTINENTS, TERRITORIES } from '../../data/warMapData';
import { CardSymbol, Player, TerritoryState } from '../../types/war';
import { warAudio } from '../../sound/audio';
import { Layers, CheckCircle, Sparkles, X } from 'lucide-react';

interface CardsModalProps {
  player: Player;
  tradeCount: number;
  territories: Record<string, TerritoryState>;
  onTradeCards: (cardIds: string[], bonusArmies: number) => void;
  onClose: () => void;
}

export const CardsModal: React.FC<CardsModalProps> = ({
  player,
  tradeCount,
  territories,
  onTradeCards,
  onClose
}) => {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  const nextTradeBonus = tradeCount < CARD_TRADE_TABLE.length 
    ? CARD_TRADE_TABLE[tradeCount] 
    : CARD_TRADE_TABLE[CARD_TRADE_TABLE.length - 1] + (tradeCount - CARD_TRADE_TABLE.length + 1) * 5;

  const toggleSelectCard = (cardId: string) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter(id => id !== cardId));
    } else {
      if (selectedCards.length < 3) {
        setSelectedCards([...selectedCards, cardId]);
      }
    }
  };

  // Check valid trio
  // In WAR: valid combination is 3 cards with either:
  // 1. All 3 same symbol (e.g. 3 squares, 3 circles, 3 triangles)
  // 2. 1 of each symbol (1 square + 1 circle + 1 triangle)
  // 3. Any joker can substitute any symbol!
  const isValidCombination = () => {
    if (selectedCards.length !== 3) return false;

    const symbols = selectedCards.map(cId => {
      if (cId.startsWith('joker')) return 'joker';
      return TERRITORIES[cId]?.cardSymbol || 'square';
    });

    const jokers = symbols.filter(s => s === 'joker').length;
    if (jokers >= 2) return true; // 2 jokers + anything is valid

    const nonJokers = symbols.filter(s => s !== 'joker');

    // If 1 joker + 2 same => valid (acts as 3rd same).
    // If 1 joker + 2 different => valid (acts as 3rd different).
    // So 1 joker always completes any 2 cards!
    if (jokers === 1) return true;

    // No jokers: check 3 same
    if (nonJokers[0] === nonJokers[1] && nonJokers[1] === nonJokers[2]) {
      return true;
    }

    // Check 3 different
    const unique = new Set(nonJokers);
    return unique.size === 3;
  };

  const handleTrade = () => {
    if (!isValidCombination()) return;

    // Check if any traded card corresponds to a territory currently owned by the player (+2 armies per territory owned)
    let territoryMatchBonus = 0;
    selectedCards.forEach(cId => {
      if (territories[cId]?.ownerId === player.id) {
        territoryMatchBonus += 2;
      }
    });

    const totalArmies = nextTradeBonus + territoryMatchBonus;
    warAudio.playCard();
    onTradeCards(selectedCards, totalArmies);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-sky-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-['Cinzel']">
                Cartas de Território
              </h2>
              <span className="text-xs text-slate-400">
                Próxima troca de cartas rende <strong className="text-sky-400 font-mono text-sm">+{nextTradeBonus}</strong> exércitos
              </span>
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
        <div className="p-6">
          {player.cards.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
              <Layers className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">Você ainda não possui cartas de território.</p>
              <p className="text-xs text-slate-600 mt-1">Conquiste pelo menos um território em seu turno para receber uma carta!</p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-300 mb-3">
                Selecione <strong className="text-white">3 cartas</strong> válidas (3 símbolos iguais OU 1 de cada tipo):
              </p>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                {player.cards.map((cardId, index) => {
                  const isJoker = cardId.startsWith('joker');
                  const terr = TERRITORIES[cardId];
                  const continent = terr ? CONTINENTS[terr.continent] : null;
                  const isSelected = selectedCards.includes(cardId);
                  const isOwned = territories[cardId]?.ownerId === player.id;

                  return (
                    <div
                      key={`${cardId}-${index}`}
                      onClick={() => toggleSelectCard(cardId)}
                      className={`relative flex flex-col items-center justify-between p-3 rounded-xl border-2 transition cursor-pointer ${
                        isSelected 
                          ? 'border-sky-400 bg-sky-950/40 shadow-md scale-102' 
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Symbol */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/80 mb-1">
                        {isJoker ? (
                          <Sparkles className="w-5 h-5 text-amber-400" />
                        ) : terr?.cardSymbol === 'square' ? (
                          <div className="w-4 h-4 rounded-sm bg-sky-400" />
                        ) : terr?.cardSymbol === 'circle' ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-400" />
                        ) : (
                          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-rose-400" />
                        )}
                      </div>

                      {/* Card Title */}
                      <span className="text-xs font-bold text-center text-slate-200 truncate w-full">
                        {isJoker ? 'CORINGA' : terr?.name}
                      </span>

                      {/* Sub-label */}
                      <span className="text-[10px] text-slate-400 mt-1 truncate w-full text-center">
                        {isJoker ? 'Universal' : continent?.name}
                      </span>

                      {/* Territorial bonus badge */}
                      {isOwned && (
                        <span className="mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-600/60 text-emerald-400">
                          +2 no local
                        </span>
                      )}

                      {/* Checkmark */}
                      {isSelected && (
                        <CheckCircle className="absolute top-1 right-1 w-4 h-4 text-sky-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Selecionadas: <strong className="text-slate-200">{selectedCards.length}/3</strong>
          </span>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Fechar
            </button>
            <button
              disabled={!isValidCombination()}
              onClick={handleTrade}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs tracking-wide transition shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Trocar por Tropas (+{nextTradeBonus})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
