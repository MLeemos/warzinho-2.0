import React from 'react';
import { ActiveMechanics } from '../../types/war';
import { 
  Sliders, 
  Shield, 
  CloudFog, 
  Plane, 
  Sparkles, 
  Zap, 
  Swords, 
  Layers, 
  Star, 
  Share2, 
  X, 
  Check, 
  RotateCcw 
} from 'lucide-react';

interface MechanicsEditorModalProps {
  mechanics: ActiveMechanics;
  onUpdateMechanics: (updated: ActiveMechanics) => void;
  onClose: () => void;
}

export const MechanicsEditorModal: React.FC<MechanicsEditorModalProps> = ({
  mechanics,
  onUpdateMechanics,
  onClose
}) => {
  const toggle = (key: keyof ActiveMechanics) => {
    if (typeof mechanics[key] === 'boolean') {
      onUpdateMechanics({
        ...mechanics,
        [key]: !mechanics[key]
      });
    }
  };

  const handleMinArmiesChange = (val: number) => {
    onUpdateMechanics({
      ...mechanics,
      minArmiesPlacement: val
    });
  };

  const handleResetDefaults = () => {
    onUpdateMechanics({
      fogOfWar: false,
      airStrikes: true,
      fortifications: true,
      globalEvents: true,
      tacticalCards: true,
      defenderWinsTies: true,
      progressiveCardTrades: true,
      capitalsMode: false,
      unlimitedManeuvers: false,
      alliancePacts: true,
      minArmiesPlacement: 3
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Sliders className="w-6 h-6 text-sky-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-['Cinzel']">
                Oficina de Regras & Novas Mecânicas
              </h2>
              <p className="text-xs text-slate-400">
                Ative ou personalize mecânicas avançadas para transformar sua partida de WAR
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

        {/* Mechanics Toggles List */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Fortificações */}
            <div
              onClick={() => toggle('fortifications')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start justify-between gap-3 ${
                mechanics.fortifications 
                  ? 'border-sky-500 bg-sky-950/20' 
                  : 'border-slate-800 bg-slate-950/60 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Fortalezas Defensivas</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Permite construir muralhas nos territórios (+1 no dado de defesa contra invasores).
                  </p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${mechanics.fortifications ? 'bg-sky-500 border-sky-400 text-slate-950' : 'border-slate-700'}`}>
                {mechanics.fortifications && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            {/* Bombardeio Aéreo */}
            <div
              onClick={() => toggle('airStrikes')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start justify-between gap-3 ${
                mechanics.airStrikes 
                  ? 'border-sky-500 bg-sky-950/20' 
                  : 'border-slate-800 bg-slate-950/60 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <Plane className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Ataque Aéreo / Míssil</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Ataque contra um território inimigo aleatório em qualquer lugar do mapa, usando combate normal.
                  </p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${mechanics.airStrikes ? 'bg-sky-500 border-sky-400 text-slate-950' : 'border-slate-700'}`}>
                {mechanics.airStrikes && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            {/* Nevoeiro de Guerra */}
            <div
              onClick={() => toggle('fogOfWar')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start justify-between gap-3 ${
                mechanics.fogOfWar 
                  ? 'border-sky-500 bg-sky-950/20' 
                  : 'border-slate-800 bg-slate-950/60 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <CloudFog className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Nevoeiro de Guerra (Fog of War)</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Oculta a quantidade de exércitos de territórios distantes. Veja apenas suas fronteiras diretas.
                  </p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${mechanics.fogOfWar ? 'bg-sky-500 border-sky-400 text-slate-950' : 'border-slate-700'}`}>
                {mechanics.fogOfWar && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            {/* Eventos Globais Aleatórios */}
            <div
              onClick={() => toggle('globalEvents')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start justify-between gap-3 ${
                mechanics.globalEvents 
                  ? 'border-sky-500 bg-sky-950/20' 
                  : 'border-slate-800 bg-slate-950/60 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Eventos Globais por Rodada</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Clima extremo (Inverno na Sibéria, Monções), crises marítimas no Suez e comboios de armas.
                  </p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${mechanics.globalEvents ? 'bg-sky-500 border-sky-400 text-slate-950' : 'border-slate-700'}`}>
                {mechanics.globalEvents && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            {/* Cartas Táticas */}
            <div
              onClick={() => toggle('tacticalCards')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start justify-between gap-3 ${
                mechanics.tacticalCards 
                  ? 'border-sky-500 bg-sky-950/20' 
                  : 'border-slate-800 bg-slate-950/60 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Ações Táticas Especiais</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Comande Espionagem Secreta, Guerra Relâmpago (Blitz) e Conscrição de Emergência.
                  </p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${mechanics.tacticalCards ? 'bg-sky-500 border-sky-400 text-slate-950' : 'border-slate-700'}`}>
                {mechanics.tacticalCards && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            {/* Modo Capitais */}
            <div
              onClick={() => toggle('capitalsMode')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start justify-between gap-3 ${
                mechanics.capitalsMode 
                  ? 'border-sky-500 bg-sky-950/20' 
                  : 'border-slate-800 bg-slate-950/60 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Modo Capitais de Guerra</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Cada general escolhe uma capital. Conquistar a capital inimiga anexa todas as tropas dele!
                  </p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${mechanics.capitalsMode ? 'bg-sky-500 border-sky-400 text-slate-950' : 'border-slate-700'}`}>
                {mechanics.capitalsMode && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* Regras Avançadas de Combate e Equilíbrio */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Equilíbrio & Regras do Tabuleiro
            </h4>

            {/* Regra de Empate nos Dados */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200">Resolução de Empate nos Dados:</span>
                <p className="text-[11px] text-slate-400">
                  {mechanics.defenderWinsTies ? 'Oficial Grow: O Defensor sempre vence empates.' : 'Alternativo: O Atacante vence empates.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggle('defenderWinsTies')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
              >
                {mechanics.defenderWinsTies ? '🛡️ Defensor Vence (Grow)' : '⚔️ Atacante Vence'}
              </button>
            </div>

            {/* Mínimo de Exércitos por Rodada */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <div>
                <span className="text-xs font-bold text-slate-200">Reforço Mínimo por Rodada:</span>
                <p className="text-[11px] text-slate-400">
                  Tropas mínimas concedidas mesmo que o jogador tenha poucos territórios.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleMinArmiesChange(n)}
                    className={`w-8 h-8 rounded-lg font-mono text-xs font-bold border transition ${
                      mechanics.minArmiesPlacement === n
                        ? 'bg-sky-500 border-sky-400 text-slate-950'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Remanejamento Ilimitado */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <div>
                <span className="text-xs font-bold text-slate-200">Movimentação Estratégica (Remanejamento):</span>
                <p className="text-[11px] text-slate-400">
                  {mechanics.unlimitedManeuvers ? 'Rede Conectada: Pode mover tropas por toda a cadeia contínua.' : 'Oficial Grow: Apenas entre territórios vizinhos imediatos.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggle('unlimitedManeuvers')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
              >
                {mechanics.unlimitedManeuvers ? 'Rede Contínua' : 'Apenas Vizinhos (Grow)'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Regras Clássicas Grow</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs tracking-wide transition shadow-lg"
          >
            Aplicar ao Jogo
          </button>
        </div>
      </div>
    </div>
  );
};
