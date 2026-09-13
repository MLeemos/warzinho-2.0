import React, { useState } from 'react';
import { CONTINENTS, TERRITORIES } from '../../data/warMapData';
import { ContinentId, ObjectiveConditionType, PlayerColor, SecretObjective } from '../../types/war';
import { Target, Plus, Trash2, Check, Sparkles, X, Layers, Globe, Shield } from 'lucide-react';

interface ObjectivesBuilderModalProps {
  objectivesDeck: SecretObjective[];
  onAddObjective: (newObj: SecretObjective) => void;
  onRemoveObjective: (objId: string) => void;
  onClose: () => void;
}

export const ObjectivesBuilderModal: React.FC<ObjectivesBuilderModalProps> = ({
  objectivesDeck,
  onAddObjective,
  onRemoveObjective,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  // Form states for creating a new objective
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objType, setObjType] = useState<ObjectiveConditionType>('conquer_continents');

  // Params
  const [selectedContinents, setSelectedContinents] = useState<ContinentId[]>(['south_america', 'africa']);
  const [totalTerritories, setTotalTerritories] = useState<number>(24);
  const [minArmiesPerTerritory, setMinArmiesPerTerritory] = useState<number>(3);
  const [targetColor, setTargetColor] = useState<PlayerColor>('red');
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>(['brasil', 'moscou']);

  // Auto-generate title & description helper
  const handleAutoFillDescription = () => {
    if (objType === 'conquer_continents') {
      const names = selectedContinents.map(c => CONTINENTS[c].name).join(' e ');
      setTitle(`Domínio: ${names}`);
      setDescription(`Conquistar na totalidade os continentes: ${names.toUpperCase()}.`);
    } else if (objType === 'conquer_territories_count') {
      setTitle(`Conquista de ${totalTerritories} Territórios`);
      setDescription(`Conquistar ${totalTerritories} territórios à sua escolha pelo mapa global.`);
    } else if (objType === 'fortified_territories') {
      setTitle(`Guarnições Fortificadas (${totalTerritories})`);
      setDescription(`Conquistar ${totalTerritories} territórios e ocupar cada um deles com no mínimo ${minArmiesPerTerritory} exércitos.`);
    } else if (objType === 'dominate_capitals') {
      const names = selectedTerritories.map(tId => TERRITORIES[tId]?.name || tId).join(', ');
      setTitle(`Bastiões Estratégicos`);
      setDescription(`Controlar simultaneamente os pontos vitais: ${names}, com pelo menos ${minArmiesPerTerritory} tropas em cada.`);
    } else if (objType === 'eliminate_color') {
      setTitle(`Aniquilar Forças ${targetColor.toUpperCase()}`);
      setDescription(`Destruir totalmente os exércitos ${targetColor.toUpperCase()}. Se não estiver no jogo, conquistar 24 territórios.`);
    }
  };

  const toggleContinent = (cId: ContinentId) => {
    if (selectedContinents.includes(cId)) {
      setSelectedContinents(selectedContinents.filter(c => c !== cId));
    } else {
      setSelectedContinents([...selectedContinents, cId]);
    }
  };

  const toggleTerritory = (tId: string) => {
    if (selectedTerritories.includes(tId)) {
      setSelectedTerritories(selectedTerritories.filter(id => id !== tId));
    } else {
      setSelectedTerritories([...selectedTerritories, tId]);
    }
  };

  const handleSave = () => {
    const finalTitle = title.trim() || 'Novo Objetivo Customizado';
    let finalDesc = description.trim();

    if (!finalDesc) {
      if (objType === 'conquer_continents') {
        const names = selectedContinents.map(c => CONTINENTS[c].name).join(' e ');
        finalDesc = `Conquistar na totalidade os continentes: ${names.toUpperCase()}.`;
      } else if (objType === 'conquer_territories_count') {
        finalDesc = `Conquistar ${totalTerritories} territórios à sua escolha pelo mapa global.`;
      } else if (objType === 'fortified_territories') {
        finalDesc = `Conquistar ${totalTerritories} territórios e defender cada um com no mínimo ${minArmiesPerTerritory} exércitos.`;
      } else if (objType === 'dominate_capitals') {
        const names = selectedTerritories.map(tId => TERRITORIES[tId]?.name || tId).join(', ');
        finalDesc = `Controlar simultaneamente: ${names} com no mínimo ${minArmiesPerTerritory} exércitos.`;
      } else {
        finalDesc = `Destruir totalmente os exércitos ${targetColor.toUpperCase()}.`;
      }
    }

    const newObj: SecretObjective = {
      id: `custom_obj_${Date.now()}`,
      title: finalTitle,
      description: finalDesc,
      isCustom: true,
      type: objType,
      params: {
        continents: selectedContinents,
        totalTerritories,
        minArmiesPerTerritory,
        targetColor,
        requiredTerritories: selectedTerritories,
        fallbackTerritoriesCount: 24
      }
    };

    onAddObjective(newObj);
    setTitle('');
    setDescription('');
    setActiveTab('list');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-['Cinzel']">
                Criador de Objetivos Personalizados
              </h2>
              <p className="text-xs text-slate-400">
                Crie e customize novos objetivos estratégicos para o baralho de cartas secretas do WAR
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'create'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Objetivo</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'list'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Baralho Ativo ({objectivesDeck.length} Objetivos)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'create' ? (
            <div className="flex flex-col gap-5">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Tipo de Condição de Vitória:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setObjType('conquer_continents')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                      objType === 'conquer_continents'
                        ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    🌍 Conquistar Continentes
                  </button>

                  <button
                    type="button"
                    onClick={() => setObjType('conquer_territories_count')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                      objType === 'conquer_territories_count'
                        ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    🚩 Quantidade de Territórios
                  </button>

                  <button
                    type="button"
                    onClick={() => setObjType('fortified_territories')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                      objType === 'fortified_territories'
                        ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    🛡️ Territórios Fortificados
                  </button>

                  <button
                    type="button"
                    onClick={() => setObjType('dominate_capitals')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                      objType === 'dominate_capitals'
                        ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    ⭐ Pontos Vitais / Capitais
                  </button>

                  <button
                    type="button"
                    onClick={() => setObjType('eliminate_color')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                      objType === 'eliminate_color'
                        ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    ⚔️ Eliminar Cor Específica
                  </button>
                </div>
              </div>

              {/* Dynamic Parameter Settings based on Type */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-4">
                {objType === 'conquer_continents' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Selecione os Continentes Requeridos:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.values(CONTINENTS).map(c => {
                        const isSelected = selectedContinents.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleContinent(c.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold transition ${
                              isSelected
                                ? 'border-sky-400 bg-sky-950/50 text-white'
                                : 'border-slate-800 bg-slate-900 text-slate-400'
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                            <span className="truncate">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {objType === 'conquer_territories_count' && (
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span>Total de Territórios Necessários:</span>
                      <span className="font-mono text-amber-400 font-bold">{totalTerritories} territórios</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={42}
                      value={totalTerritories}
                      onChange={e => setTotalTerritories(parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>10 (Rápido)</span>
                      <span>24 (Clássico WAR)</span>
                      <span>42 (Dominação Mundial)</span>
                    </div>
                  </div>
                )}

                {objType === 'fortified_territories' && (
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                        <span>Quantidade de Territórios:</span>
                        <span className="font-mono text-amber-400 font-bold">{totalTerritories}</span>
                      </div>
                      <input
                        type="range"
                        min={6}
                        max={30}
                        value={totalTerritories}
                        onChange={e => setTotalTerritories(parseInt(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                        <span>Mínimo de Exércitos em cada um:</span>
                        <span className="font-mono text-amber-400 font-bold">{minArmiesPerTerritory} tropas</span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={6}
                        value={minArmiesPerTerritory}
                        onChange={e => setMinArmiesPerTerritory(parseInt(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {objType === 'dominate_capitals' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Selecione os Territórios Estratégicos:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {Object.values(TERRITORIES).map(t => {
                        const isSelected = selectedTerritories.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleTerritory(t.id)}
                            className={`p-1.5 rounded text-[11px] font-medium truncate transition ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            {t.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {objType === 'eliminate_color' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Cor do Exército Alvo:
                    </label>
                    <div className="flex gap-2">
                      {(['red', 'blue', 'green', 'yellow', 'white', 'black'] as PlayerColor[]).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setTargetColor(c)}
                          className={`flex-1 py-2 rounded-lg border text-xs font-bold uppercase transition ${
                            targetColor === c
                              ? 'border-amber-400 ring-2 ring-amber-400/40 text-white'
                              : 'border-slate-800 text-slate-400'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Auto-generate Button */}
                <button
                  type="button"
                  onClick={handleAutoFillDescription}
                  className="self-start text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gerar título e descrição automaticamente</span>
                </button>
              </div>

              {/* Title & Description Fields */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nome do Objetivo:
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex: Domínio da Eurásia e África"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Descrição Detalhada da Missão:
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descreva a regra exata que o comandante deve cumprir..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-sm tracking-wide transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Salvar e Adicionar ao Baralho de Objetivos</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <span className="text-xs text-slate-400">
                Todos os objetivos abaixo podem ser sorteados para os generais no início do jogo:
              </span>

              <div className="flex flex-col gap-2">
                {objectivesDeck.map((obj, idx) => (
                  <div
                    key={obj.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{obj.title}</span>
                        {obj.isCustom && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40">
                            Customizado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{obj.description}</p>
                    </div>

                    {obj.isCustom && (
                      <button
                        onClick={() => onRemoveObjective(obj.id)}
                        className="p-1.5 rounded text-red-400 hover:bg-red-950/50 hover:text-red-300 transition"
                        title="Excluir objetivo customizado"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
