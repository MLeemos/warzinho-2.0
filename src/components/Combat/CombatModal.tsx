import React, { useState, useEffect } from 'react';
import { TERRITORIES, PLAYER_COLORS } from '../../data/warMapData';
import { ActiveMechanics, Player, TerritoryState } from '../../types/war';
import { warAudio } from '../../sound/audio';
import { Swords, Shield, Skull, ArrowRight, CheckCircle, RotateCcw, Zap } from 'lucide-react';

interface CombatModalProps {
  attackerPlayer: Player;
  defenderPlayer: Player;
  attackerTerritoryState: TerritoryState;
  defenderTerritoryState: TerritoryState;
  activeMechanics: ActiveMechanics;
  onResolveCombat: (result: {
    attackerRemaining: number;
    defenderRemaining: number;
    conquered: boolean;
    movedArmies: number;
  }) => void;
  onClose: void | (() => void);
}

export const CombatModal: React.FC<CombatModalProps> = ({
  attackerPlayer,
  defenderPlayer,
  attackerTerritoryState,
  defenderTerritoryState,
  activeMechanics,
  onResolveCombat,
  onClose
}) => {
  const [attArmies, setAttArmies] = useState(attackerTerritoryState.armies);
  const [defArmies, setDefArmies] = useState(defenderTerritoryState.armies);
  const [attDice, setAttDice] = useState<number[]>([]);
  const [defDice, setDefDice] = useState<number[]>([]);
  const [lastAttLosses, setLastAttLosses] = useState(0);
  const [lastDefLosses, setLastDefLosses] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [conquered, setConquered] = useState(false);
  const [minAdvance, setMinAdvance] = useState(1);
  const [advanceCount, setAdvanceCount] = useState(1);

  const attTerrDef = TERRITORIES[attackerTerritoryState.id];
  const defTerrDef = TERRITORIES[defenderTerritoryState.id];

  const attColor = PLAYER_COLORS[attackerPlayer.color];
  const defColor = PLAYER_COLORS[defenderPlayer.color];

  // Number of dice allowed
  const maxAttDice = Math.min(3, Math.max(1, attArmies - 1));
  const maxDefDice = Math.min(3, Math.max(1, defArmies));

  const [selectedAttDiceCount, setSelectedAttDiceCount] = useState(maxAttDice);
  const [selectedDefDiceCount, setSelectedDefDiceCount] = useState(maxDefDice);

  useEffect(() => {
    setSelectedAttDiceCount(Math.min(3, Math.max(1, attArmies - 1)));
  }, [attArmies]);

  useEffect(() => {
    setSelectedDefDiceCount(Math.min(3, Math.max(1, defArmies)));
  }, [defArmies]);

  const rollDice = () => {
    if (isRolling || conquered || attArmies <= 1 || defArmies <= 0) return;

    setIsRolling(true);
    warAudio.playDiceRoll();

    setTimeout(() => {
      // Roll random 1-6
      const rolledAtt: number[] = [];
      for (let i = 0; i < selectedAttDiceCount; i++) {
        rolledAtt.push(Math.floor(Math.random() * 6) + 1);
      }
      rolledAtt.sort((a, b) => b - a);

      const rolledDef: number[] = [];
      for (let i = 0; i < selectedDefDiceCount; i++) {
        let val = Math.floor(Math.random() * 6) + 1;
        // If defender has fortress mechanic enabled, bonus +1
        if (defenderTerritoryState.fortified && activeMechanics.fortifications) {
          val = Math.min(6, val + 1);
        }
        rolledDef.push(val);
      }
      rolledDef.sort((a, b) => b - a);

      setAttDice(rolledAtt);
      setDefDice(rolledDef);

      // Compare pairs
      const comparisons = Math.min(rolledAtt.length, rolledDef.length);
      let attLost = 0;
      let defLost = 0;

      for (let i = 0; i < comparisons; i++) {
        if (activeMechanics.defenderWinsTies) {
          // Classic WAR Grow: defender wins ties!
          if (rolledAtt[i] > rolledDef[i]) {
            defLost++;
          } else {
            attLost++;
          }
        } else {
          // Alternate mechanic: attacker wins ties
          if (rolledAtt[i] >= rolledDef[i]) {
            defLost++;
          } else {
            attLost++;
          }
        }
      }

      setLastAttLosses(attLost);
      setLastDefLosses(defLost);

      const nextAtt = Math.max(1, attArmies - attLost);
      const nextDef = Math.max(0, defArmies - defLost);

      setAttArmies(nextAtt);
      setDefArmies(nextDef);

      if (attLost > 0 || defLost > 0) {
        warAudio.playClash();
      }

      // Check conquest
      if (nextDef === 0) {
        setConquered(true);
        warAudio.playConquest();
        const minToAdvance = Math.min(selectedAttDiceCount, nextAtt - 1);
        setMinAdvance(Math.max(1, minToAdvance));
        setAdvanceCount(Math.max(1, minToAdvance));
      }

      setIsRolling(false);
    }, 450);
  };

  const handleAutoResolve = () => {
    if (isRolling || conquered) return;

    let currentAtt = attArmies;
    let currentDef = defArmies;

    while (currentAtt > 1 && currentDef > 0) {
      const numAtt = Math.min(3, currentAtt - 1);
      const numDef = Math.min(3, currentDef);

      const attR = Array.from({ length: numAtt }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);
      const defR = Array.from({ length: numDef }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);

      const pairs = Math.min(numAtt, numDef);
      for (let i = 0; i < pairs; i++) {
        if (activeMechanics.defenderWinsTies) {
          if (attR[i] > defR[i]) currentDef--;
          else currentAtt--;
        } else {
          if (attR[i] >= defR[i]) currentDef--;
          else currentAtt--;
        }
      }
    }

    setAttArmies(currentAtt);
    setDefArmies(currentDef);

    if (currentDef === 0) {
      setConquered(true);
      warAudio.playConquest();
      const minAdv = Math.min(3, currentAtt - 1);
      setMinAdvance(Math.max(1, minAdv));
      setAdvanceCount(Math.max(1, minAdv));
    } else {
      warAudio.playClash();
    }
  };

  const handleFinishConquest = () => {
    onResolveCombat({
      attackerRemaining: attArmies - advanceCount,
      defenderRemaining: 0,
      conquered: true,
      movedArmies: advanceCount
    });
  };

  const handleRetreat = () => {
    onResolveCombat({
      attackerRemaining: attArmies,
      defenderRemaining: defArmies,
      conquered: false,
      movedArmies: 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Title */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Swords className="w-6 h-6 text-red-500 animate-pulse" />
            <h2 className="text-xl font-bold tracking-wide font-['Cinzel'] text-slate-100">
              Combate Territorial
            </h2>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {activeMechanics.defenderWinsTies ? 'Empate: Defensor Vence' : 'Empate: Atacante Vence'}
          </div>
        </div>

        {/* Territory Clash Banners */}
        <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-b from-slate-900 to-slate-950">
          {/* Attacker Box */}
          <div className="flex flex-col items-center p-4 rounded-xl border border-red-500/30 bg-red-950/20">
            <span className="text-xs uppercase font-bold tracking-widest text-red-400 mb-1">
              Atacante ({attackerPlayer.name})
            </span>
            <span className="text-lg font-bold text-slate-100 mb-2">
              {attTerrDef?.name || 'Origem'}
            </span>
            <div
              className="w-16 h-14 rounded-xl flex items-center justify-center font-mono text-2xl font-black text-white shadow-lg border-2"
              style={{ backgroundColor: attColor.hex, borderColor: attColor.borderHex }}
            >
              {attArmies}
            </div>
            <span className="text-xs text-slate-400 mt-2">
              {attArmies > 1 ? `${attArmies - 1} disponíveis para ataque` : 'Ataque esgotado!'}
            </span>
          </div>

          {/* Defender Box */}
          <div className="flex flex-col items-center p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-1">
              Defensor ({defenderPlayer.name})
            </span>
            <span className="text-lg font-bold text-slate-100 mb-2">
              {defTerrDef?.name || 'Destino'}
            </span>
            <div
              className="w-16 h-14 rounded-xl flex items-center justify-center font-mono text-2xl font-black text-white shadow-lg border-2"
              style={{ backgroundColor: defColor.hex, borderColor: defColor.borderHex }}
            >
              {defArmies}
            </div>
            <span className="text-xs text-slate-400 mt-2">
              {defenderTerritoryState.fortified ? '🛡️ Território Fortificado (+1 Defesa)' : 'Defesa Padrão'}
            </span>
          </div>
        </div>

        {/* Dice Arena */}
        <div className="px-6 py-5 bg-slate-950/80 border-y border-slate-800/80 flex flex-col items-center">
          <div className="grid grid-cols-2 gap-8 w-full max-w-md">
            {/* Attacker Dice (Red) */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-red-400">Dados do Atacante (Vermelhos)</span>
              <div className="flex items-center gap-2 h-16">
                {attDice.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">Aguardando rolagem</span>
                ) : (
                  attDice.map((val, i) => (
                    <div
                      key={`att-die-${i}`}
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white font-black font-mono text-2xl flex items-center justify-center shadow-lg border border-red-300 transform transition-transform hover:scale-105"
                    >
                      {val}
                    </div>
                  ))
                )}
              </div>
              {lastAttLosses > 0 && (
                <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                  <Skull className="w-3.5 h-3.5" /> -{lastAttLosses} {lastAttLosses === 1 ? 'exército' : 'exércitos'}
                </span>
              )}
            </div>

            {/* Defender Dice (Yellow) */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-amber-400">Dados do Defensor (Amarelos)</span>
              <div className="flex items-center gap-2 h-16">
                {defDice.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">Aguardando rolagem</span>
                ) : (
                  defDice.map((val, i) => (
                    <div
                      key={`def-die-${i}`}
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black font-mono text-2xl flex items-center justify-center shadow-lg border border-amber-200 transform transition-transform hover:scale-105"
                    >
                      {val}
                    </div>
                  ))
                )}
              </div>
              {lastDefLosses > 0 && (
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Skull className="w-3.5 h-3.5" /> -{lastDefLosses} {lastDefLosses === 1 ? 'exército' : 'exércitos'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Conquest Advance Section or Battle Controls */}
        <div className="p-6 bg-slate-900">
          {conquered ? (
            <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                <CheckCircle className="w-6 h-6" />
                <span>Território Conquistado com Sucesso!</span>
              </div>
              <p className="text-xs text-slate-300 text-center max-w-md">
                Quantas tropas vitoriosas você deseja avançar de <strong className="text-white">{attTerrDef?.name}</strong> para <strong className="text-white">{defTerrDef?.name}</strong>?
                (Mínimo: {minAdvance}, Máximo: {attArmies - 1})
              </p>

              {/* Troop Slider */}
              <div className="flex items-center gap-4 w-full max-w-sm">
                <span className="text-sm font-bold text-slate-400">{minAdvance}</span>
                <input
                  type="range"
                  min={minAdvance}
                  max={Math.max(minAdvance, attArmies - 1)}
                  value={advanceCount}
                  onChange={(e) => setAdvanceCount(parseInt(e.target.value))}
                  className="flex-1 accent-emerald-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                />
                <span className="text-sm font-bold text-slate-400">{Math.max(minAdvance, attArmies - 1)}</span>
                <span className="font-mono text-xl font-black text-emerald-400 w-8 text-center">{advanceCount}</span>
              </div>

              <button
                onClick={handleFinishConquest}
                className="w-full max-w-md py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Confirmar Ocupação e Avançar Tropas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={isRolling || attArmies <= 1}
                  onClick={rollDice}
                  className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm tracking-wide transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Swords className="w-4 h-4" />
                  <span>{isRolling ? 'Rolando Dados...' : 'Rolar Dados (Ataque)'}</span>
                </button>

                <button
                  disabled={isRolling || attArmies <= 1}
                  onClick={handleAutoResolve}
                  className="py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm tracking-wide transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Combate Rápido (Auto)</span>
                </button>
              </div>

              <button
                disabled={isRolling}
                onClick={handleRetreat}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs tracking-wide transition border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cessar Ataque / Recuar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
