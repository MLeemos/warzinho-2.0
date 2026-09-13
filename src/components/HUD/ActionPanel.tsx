import React from 'react';
import { ActiveMechanics, Player, TurnPhase } from '../../types/war';
import { 
  ArrowRight, 
  Target, 
  Layers, 
  Zap, 
  Sliders, 
  PlusCircle, 
  ScrollText, 
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

interface ActionPanelProps {
  activePlayer: Player;
  currentPhase: TurnPhase;
  reserveArmies: number;
  objectiveProgressPercent: number;
  activeMechanics: ActiveMechanics;
  onNextPhase: () => void;
  onOpenObjective: () => void;
  onOpenCards: () => void;
  onOpenTacticalCards: () => void;
  onOpenObjectivesBuilder: () => void;
  onOpenMechanicsEditor: () => void;
  onOpenLogs: () => void;
  onRestart: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  activePlayer,
  currentPhase,
  reserveArmies,
  objectiveProgressPercent,
  activeMechanics,
  onNextPhase,
  onOpenObjective,
  onOpenCards,
  onOpenTacticalCards,
  onOpenObjectivesBuilder,
  onOpenMechanicsEditor,
  onOpenLogs,
  onRestart
}) => {
  const getNextPhaseButtonLabel = () => {
    switch (currentPhase) {
      case 'reinforce':
        return reserveArmies > 0 ? `Posicione +${reserveArmies} Tropas` : 'Iniciar Fase de Ataque';
      case 'attack':
        return 'Encerrar Ataques (Remanejamento)';
      case 'maneuver':
        return 'Finalizar Turno & Passar Vez';
      default:
        return 'Próximo';
    }
  };

  const isNextDisabled = currentPhase === 'reinforce' && reserveArmies > 0;

  return (
    <div className="w-full bg-slate-950/95 border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none z-30">
      {/* Left: Strategic Modals Triggers */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Secret Objective Button */}
        <button
          onClick={onOpenObjective}
          className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-amber-950/40 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Target className="w-4 h-4 text-amber-400" />
          <span>Objetivo Secreto</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
            {objectiveProgressPercent}%
          </span>
        </button>

        {/* Territory Cards Button */}
        <button
          onClick={onOpenCards}
          className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-sky-950/40 border border-sky-500/40 hover:border-sky-400 text-sky-300 text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Cartas</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">
            {activePlayer.cards.length}
          </span>
        </button>

        {/* Tactical Actions Button (Mechanic) */}
        {activeMechanics.tacticalCards && (
          <button
            onClick={onOpenTacticalCards}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-purple-950/40 border border-purple-500/40 hover:border-purple-400 text-purple-300 text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Táticas</span>
          </button>
        )}

        {/* Separator */}
        <div className="hidden sm:block h-6 w-[1px] bg-slate-800 mx-1" />

        {/* Custom Mechanics Builder Button */}
        <button
          onClick={onOpenMechanicsEditor}
          className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          title="Personalizar regras e mecânicas de jogo"
        >
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline">Novas Mecânicas</span>
        </button>

        {/* Custom Objectives Builder Button */}
        <button
          onClick={onOpenObjectivesBuilder}
          className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          title="Criar e editar objetivos customizados"
        >
          <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Mais Objetivos</span>
        </button>

        {/* Game Log Drawer */}
        <button
          onClick={onOpenLogs}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          title="Histórico de Acontecimentos"
        >
          <ScrollText className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Primary Phase Progress Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRestart}
          className="p-2 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-800 text-slate-400 hover:text-red-400 transition cursor-pointer"
          title="Reiniciar Partida"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          disabled={isNextDisabled}
          onClick={onNextPhase}
          className={`py-2.5 px-5 rounded-xl font-bold text-xs tracking-wide transition shadow-lg flex items-center gap-2 cursor-pointer ${
            isNextDisabled
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : currentPhase === 'reinforce'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
              : currentPhase === 'attack'
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950'
          }`}
        >
          <span>{getNextPhaseButtonLabel()}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
