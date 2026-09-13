import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CONTINENTS, TERRITORIES, SEA_ROUTES } from './data/warMapData';
import { CLASSIC_OBJECTIVES, checkObjectiveProgress } from './data/objectivesData';
import { DEFAULT_MECHANICS, GLOBAL_EVENTS } from './data/mechanicsData';
import { 
  ActiveMechanics, 
  GlobalEvent, 
  GameLogEntry, 
  Player, 
  SecretObjective, 
  TerritoryState, 
  TurnPhase 
} from './types/war';
import { warAudio } from './sound/audio';
import { WarBoard } from './components/Map/WarBoard';
import { GameHeader } from './components/HUD/GameHeader';
import { ActionPanel } from './components/HUD/ActionPanel';
import { CombatModal } from './components/Combat/CombatModal';
import { ManeuverModal } from './components/Combat/ManeuverModal';
import { CardsModal } from './components/Cards/CardsModal';
import { ObjectiveModal } from './components/Objective/ObjectiveModal';
import { ObjectivesBuilderModal } from './components/Modals/ObjectivesBuilderModal';
import { MechanicsEditorModal } from './components/Modals/MechanicsEditorModal';
import { TacticalCardsModal } from './components/Modals/TacticalCardsModal';
import { GameLogModal } from './components/Modals/GameLogModal';
import { VictoryModal } from './components/Modals/VictoryModal';
import { GameSetup } from './components/Setup/GameSetup';

export default function App() {
  // Application Stage
  const [inGame, setInGame] = useState(false);

  // Decks and Mechanics
  const [objectivesDeck, setObjectivesDeck] = useState<SecretObjective[]>(CLASSIC_OBJECTIVES);
  const [activeMechanics, setActiveMechanics] = useState<ActiveMechanics>(DEFAULT_MECHANICS);

  // Active Game State
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPhase, setCurrentPhase] = useState<TurnPhase>('reinforce');
  const [territories, setTerritories] = useState<Record<string, TerritoryState>>({});
  const [reserveArmies, setReserveArmies] = useState<number>(0);
  const [cardTradeCount, setCardTradeCount] = useState<number>(0);
  const [conqueredThisTurn, setConqueredThisTurn] = useState<boolean>(false);
  const [gameLogs, setGameLogs] = useState<GameLogEntry[]>([]);
  const [activeGlobalEvent, setActiveGlobalEvent] = useState<GlobalEvent | null>(null);

  // Map Interaction State
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  const [targetTerritoryId, setTargetTerritoryId] = useState<string | null>(null);

  // Modals
  const [isCombatModalOpen, setIsCombatModalOpen] = useState(false);
  const [isManeuverModalOpen, setIsManeuverModalOpen] = useState(false);
  const [isCardsModalOpen, setIsCardsModalOpen] = useState(false);
  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [isObjectivesBuilderOpen, setIsObjectivesBuilderOpen] = useState(false);
  const [isMechanicsEditorOpen, setIsMechanicsEditorOpen] = useState(false);
  const [isTacticalCardsOpen, setIsTacticalCardsOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [winnerPlayer, setWinnerPlayer] = useState<Player | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Tactical Action Mode (e.g. Air strike selection)
  const [tacticalTargetMode, setTacticalTargetMode] = useState<'air_strike' | 'fortify' | null>(null);

  const activePlayer = players[activePlayerIndex] || null;

  // Audio mute toggle
  const toggleAudio = () => {
    warAudio.enabled = !audioEnabled;
    setAudioEnabled(!audioEnabled);
  };

  // Log helper
  const addLog = useCallback((text: string, type: GameLogEntry['type']) => {
    const newEntry: GameLogEntry = {
      id: `log_${Date.now()}_${Math.random()}`,
      turn: currentRound,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      color: activePlayer?.color
    };
    setGameLogs(prev => [...prev, newEntry]);
  }, [currentRound, activePlayer]);

  // Calculate troop reinforcements for a player
  const calculateReinforcements = useCallback((player: Player, terrs: Record<string, TerritoryState>) => {
    const playerTerrs = (Object.values(terrs) as TerritoryState[]).filter(t => t.ownerId === player.id);
    const count = playerTerrs.length;

    // Base: territories / 2 (min 3 or custom min)
    let armies = Math.max(activeMechanics.minArmiesPlacement, Math.floor(count / 2));

    // Continent bonuses
    for (const cont of Object.values(CONTINENTS)) {
      const ownsAll = cont.territoryIds.every(tId => terrs[tId]?.ownerId === player.id);
      if (ownsAll) {
        armies += cont.bonus;
      }
    }

    // Global event bonus
    if (activeGlobalEvent?.effect === 'arms_shipment') {
      armies += 2;
    }

    return armies;
  }, [activeMechanics.minArmiesPlacement, activeGlobalEvent]);

  // Check victory condition
  const checkVictory = useCallback(() => {
    if (!activePlayer) return false;
    const obj = objectivesDeck.find(o => o.id === activePlayer.objectiveId);
    if (!obj) return false;

    const progress = checkObjectiveProgress(obj, activePlayer, players, territories);
    if (progress.completed && !winnerPlayer) {
      setWinnerPlayer(activePlayer);
      addLog(`🏆 ${activePlayer.name} completou o objetivo "${obj.title}" e venceu a guerra!`, 'elimination');
      return true;
    }
    return false;
  }, [activePlayer, objectivesDeck, players, territories, winnerPlayer, addLog]);

  // Start new match
  const handleStartGame = (configuredPlayers: Player[], mechanics: ActiveMechanics) => {
    setActiveMechanics(mechanics);
    warAudio.playDiceRoll();

    // 1. Distribute territories evenly among players
    const terrIds = Object.keys(TERRITORIES).sort(() => Math.random() - 0.5);
    const initialTerrState: Record<string, TerritoryState> = {};

    terrIds.forEach((tId, idx) => {
      const assignedPlayer = configuredPlayers[idx % configuredPlayers.length];
      initialTerrState[tId] = {
        id: tId,
        ownerId: assignedPlayer.id,
        armies: 1,
        fortified: false
      };
    });

    // 2. Assign secret objectives
    const shuffledObjs = [...objectivesDeck].sort(() => Math.random() - 0.5);
    const assignedPlayers = configuredPlayers.map((p, idx) => ({
      ...p,
      objectiveId: shuffledObjs[idx % shuffledObjs.length]?.id || CLASSIC_OBJECTIVES[0].id,
      cards: [],
      tacticalCards: ['tac_air_strike', 'tac_fortify'],
      eliminated: false,
      stats: {
        territoriesLost: 0,
        territoriesConquered: 0,
        armiesDefeated: 0,
        armiesLost: 0
      }
    }));

    setPlayers(assignedPlayers);
    setTerritories(initialTerrState);
    setActivePlayerIndex(0);
    setCurrentRound(1);
    setCurrentPhase('reinforce');
    setConqueredThisTurn(false);
    setSelectedTerritoryId(null);
    setTargetTerritoryId(null);
    setWinnerPlayer(null);

    const firstPlayer = assignedPlayers[0];
    const initialReinforce = calculateReinforcements(firstPlayer, initialTerrState);
    setReserveArmies(initialReinforce);

    setGameLogs([
      {
        id: 'init',
        turn: 1,
        text: `Partida de WAR iniciada com ${assignedPlayers.length} generais! Territórios distribuídos estrategicamente.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'event'
      }
    ]);

    setInGame(true);
  };

  // Valid target territories calculation
  const validTargets = useMemo(() => {
    if (!selectedTerritoryId || !activePlayer) return [];
    const selTerr = TERRITORIES[selectedTerritoryId];
    const selState = territories[selectedTerritoryId];
    if (!selTerr || !selState) return [];

    // Tactical air strike mode: can target any enemy territory up to 2 steps away
    if (tacticalTargetMode === 'air_strike') {
      const step1 = selTerr.neighbors;
      const step2 = new Set<string>();
      step1.forEach(nId => {
        step2.add(nId);
        TERRITORIES[nId]?.neighbors.forEach(n2 => step2.add(n2));
      });
      return Array.from(step2).filter(tId => territories[tId]?.ownerId !== activePlayer.id);
    }

    if (currentPhase === 'attack') {
      if (selState.ownerId !== activePlayer.id || selState.armies < 2) return [];
      // Any neighboring territory owned by an opponent
      return selTerr.neighbors.filter(nId => territories[nId]?.ownerId !== activePlayer.id);
    }

    if (currentPhase === 'maneuver') {
      if (selState.ownerId !== activePlayer.id || selState.armies < 2) return [];
      // Adjacent territories owned by the SAME player
      return selTerr.neighbors.filter(nId => territories[nId]?.ownerId === activePlayer.id);
    }

    return [];
  }, [selectedTerritoryId, activePlayer, territories, currentPhase, tacticalTargetMode]);

  // Fog of war revealed territories set
  const fogRevealedTerritories = useMemo(() => {
    if (!activeMechanics.fogOfWar || !activePlayer) return undefined;
    const revealed = new Set<string>();

    (Object.values(territories) as TerritoryState[]).forEach(t => {
      if (t.ownerId === activePlayer.id) {
        revealed.add(t.id);
        // Neighbors also revealed
        TERRITORIES[t.id]?.neighbors.forEach(n => revealed.add(n));
      }
    });

    return revealed;
  }, [activeMechanics.fogOfWar, activePlayer, territories]);

  // Handle Territory Click
  const handleSelectTerritory = (territoryId: string) => {
    if (!activePlayer || activePlayer.isAI) return;
    const tState = territories[territoryId];
    if (!tState) return;

    // Tactical target execution
    if (tacticalTargetMode === 'air_strike') {
      if (validTargets.includes(territoryId)) {
        // Execute air strike
        warAudio.playClash();
        const lost = Math.min(2, Math.max(1, Math.floor(Math.random() * 2) + 1));
        const updatedArmies = Math.max(1, tState.armies - lost);
        setTerritories(prev => ({
          ...prev,
          [territoryId]: { ...prev[territoryId], armies: updatedArmies }
        }));
        addLog(`✈️ Ataque Aéreo em ${TERRITORIES[territoryId].name}! Destruiu ${lost} exércitos inimigos.`, 'mechanic');
        setTacticalTargetMode(null);
        setSelectedTerritoryId(null);
      } else {
        setTacticalTargetMode(null);
        setSelectedTerritoryId(null);
      }
      return;
    }

    if (tacticalTargetMode === 'fortify') {
      if (tState.ownerId === activePlayer.id) {
        warAudio.playCard();
        setTerritories(prev => ({
          ...prev,
          [territoryId]: { ...prev[territoryId], fortified: true }
        }));
        addLog(`🛡️ Fortaleza construída com sucesso em ${TERRITORIES[territoryId].name}!`, 'mechanic');
        setTacticalTargetMode(null);
      }
      return;
    }

    // Phase 1: REINFORCE
    if (currentPhase === 'reinforce') {
      if (tState.ownerId === activePlayer.id && reserveArmies > 0) {
        warAudio.playTroopPlace();
        setTerritories(prev => ({
          ...prev,
          [territoryId]: { ...prev[territoryId], armies: prev[territoryId].armies + 1 }
        }));
        setReserveArmies(prev => prev - 1);
        addLog(`+1 exército posicionado em ${TERRITORIES[territoryId].name}`, 'reinforce');
      }
      return;
    }

    // Phase 2: ATTACK
    if (currentPhase === 'attack') {
      // If clicking own territory with >1 army: select as attacker
      if (tState.ownerId === activePlayer.id) {
        if (tState.armies >= 2) {
          warAudio.playClick();
          setSelectedTerritoryId(territoryId);
          setTargetTerritoryId(null);
        }
      } else if (selectedTerritoryId && validTargets.includes(territoryId)) {
        // Clicked valid enemy neighbor: open combat modal
        setTargetTerritoryId(territoryId);
        setIsCombatModalOpen(true);
      }
      return;
    }

    // Phase 3: MANEUVER
    if (currentPhase === 'maneuver') {
      if (tState.ownerId === activePlayer.id) {
        if (!selectedTerritoryId) {
          if (tState.armies >= 2) {
            warAudio.playClick();
            setSelectedTerritoryId(territoryId);
          }
        } else {
          if (territoryId === selectedTerritoryId) {
            setSelectedTerritoryId(null);
          } else if (validTargets.includes(territoryId)) {
            setTargetTerritoryId(territoryId);
            setIsManeuverModalOpen(true);
          } else if (tState.armies >= 2) {
            setSelectedTerritoryId(territoryId);
          }
        }
      }
    }
  };

  // Resolve Combat Result
  const handleResolveCombat = (result: {
    attackerRemaining: number;
    defenderRemaining: number;
    conquered: boolean;
    movedArmies: number;
  }) => {
    if (!selectedTerritoryId || !targetTerritoryId || !activePlayer) return;

    const defenderPlayer = players.find(p => p.id === territories[targetTerritoryId].ownerId);

    if (result.conquered) {
      setConqueredThisTurn(true);
      addLog(
        `🚩 ${activePlayer.name} conquistou ${TERRITORIES[targetTerritoryId].name} de ${defenderPlayer?.name}!`,
        'conquest'
      );

      // Update territories state
      setTerritories(prev => ({
        ...prev,
        [selectedTerritoryId]: {
          ...prev[selectedTerritoryId],
          armies: result.attackerRemaining
        },
        [targetTerritoryId]: {
          ...prev[targetTerritoryId],
          ownerId: activePlayer.id,
          armies: result.movedArmies,
          fortified: false // Conquering destroys previous fortifications
        }
      }));

      // Update player stats
      setPlayers(prev => prev.map(p => {
        if (p.id === activePlayer.id) {
          return {
            ...p,
            stats: {
              ...p.stats,
              territoriesConquered: p.stats.territoriesConquered + 1
            }
          };
        }
        if (defenderPlayer && p.id === defenderPlayer.id) {
          return {
            ...p,
            stats: {
              ...p.stats,
              territoriesLost: p.stats.territoriesLost + 1
            }
          };
        }
        return p;
      }));

      // Check if defender was completely eliminated!
      setTimeout(() => {
        setTerritories(currentTerrs => {
          if (defenderPlayer) {
            const defenderRemainingTerrs = (Object.values(currentTerrs) as TerritoryState[]).filter(t => t.ownerId === defenderPlayer.id);
            if (defenderRemainingTerrs.length === 0) {
              // Eliminate player and transfer all their cards to active player!
              addLog(`☠️ ${defenderPlayer.name} foi totalmente eliminado do jogo por ${activePlayer.name}!`, 'elimination');
              setPlayers(prevP => prevP.map(p => {
                if (p.id === defenderPlayer.id) return { ...p, eliminated: true };
                if (p.id === activePlayer.id) {
                  return {
                    ...p,
                    cards: [...p.cards, ...defenderPlayer.cards]
                  };
                }
                return p;
              }));
            }
          }
          return currentTerrs;
        });

        // Check Victory
        checkVictory();
      }, 100);
    } else {
      // Just casualty updates
      setTerritories(prev => ({
        ...prev,
        [selectedTerritoryId]: {
          ...prev[selectedTerritoryId],
          armies: result.attackerRemaining
        },
        [targetTerritoryId]: {
          ...prev[targetTerritoryId],
          armies: result.defenderRemaining
        }
      }));
    }

    setIsCombatModalOpen(false);
    setTargetTerritoryId(null);
  };

  // Maneuver Execute
  const handleExecuteManeuver = (armiesToMove: number) => {
    if (!selectedTerritoryId || !targetTerritoryId) return;

    setTerritories(prev => ({
      ...prev,
      [selectedTerritoryId]: {
        ...prev[selectedTerritoryId],
        armies: prev[selectedTerritoryId].armies - armiesToMove
      },
      [targetTerritoryId]: {
        ...prev[targetTerritoryId],
        armies: prev[targetTerritoryId].armies + armiesToMove
      }
    }));

    addLog(
      `Movimentou ${armiesToMove} exércitos de ${TERRITORIES[selectedTerritoryId].name} para ${TERRITORIES[targetTerritoryId].name}`,
      'mechanic'
    );

    setSelectedTerritoryId(null);
    setTargetTerritoryId(null);
    setIsManeuverModalOpen(false);
  };

  // Handle Trade Cards for Armies
  const handleTradeCards = (cardIds: string[], bonusArmies: number) => {
    if (!activePlayer) return;

    setPlayers(prev => prev.map(p => {
      if (p.id === activePlayer.id) {
        return {
          ...p,
          cards: p.cards.filter(c => !cardIds.includes(c))
        };
      }
      return p;
    }));

    setReserveArmies(prev => prev + bonusArmies);
    setCardTradeCount(prev => prev + 1);
    addLog(`🃏 ${activePlayer.name} trocou cartas por +${bonusArmies} exércitos!`, 'card');
  };

  // Next Phase Handler
  const handleNextPhase = useCallback(() => {
    warAudio.playClick();
    setSelectedTerritoryId(null);
    setTargetTerritoryId(null);

    if (currentPhase === 'reinforce') {
      setCurrentPhase('attack');
      addLog(`General ${activePlayer.name} iniciou a Fase de Ataques.`, 'attack');
    } else if (currentPhase === 'attack') {
      setCurrentPhase('maneuver');
      addLog(`General ${activePlayer.name} iniciou o Remanejamento.`, 'mechanic');
    } else if (currentPhase === 'maneuver') {
      // End turn
      // 1. Draw card if conquered territory
      if (conqueredThisTurn) {
        const availableCards = Object.keys(TERRITORIES).filter(
          tId => !players.some(p => p.cards.includes(tId))
        );
        if (availableCards.length > 0) {
          const drawn = availableCards[Math.floor(Math.random() * availableCards.length)];
          setPlayers(prev => prev.map(p => {
            if (p.id === activePlayer.id) {
              return { ...p, cards: [...p.cards, drawn] };
            }
            return p;
          }));
          warAudio.playCard();
          addLog(`🎴 ${activePlayer.name} recebeu a carta ${TERRITORIES[drawn]?.name}!`, 'card');
        }
      }

      // 2. Check victory condition
      checkVictory();

      // 3. Move to next active player
      let nextIdx = (activePlayerIndex + 1) % players.length;
      while (players[nextIdx].eliminated) {
        nextIdx = (nextIdx + 1) % players.length;
      }

      if (nextIdx === 0) {
        // New round completed! Trigger global event if mechanic enabled
        setCurrentRound(r => r + 1);
        if (activeMechanics.globalEvents) {
          const randomEvt = GLOBAL_EVENTS[Math.floor(Math.random() * GLOBAL_EVENTS.length)];
          setActiveGlobalEvent(randomEvt);
          addLog(`⚡ EVENTO MUNDIAL: ${randomEvt.name} - ${randomEvt.description}`, 'event');
        }
      }

      setActivePlayerIndex(nextIdx);
      setCurrentPhase('reinforce');
      setConqueredThisTurn(false);

      const nextP = players[nextIdx];
      const reinforcements = calculateReinforcements(nextP, territories);
      setReserveArmies(reinforcements);
      addLog(`Vez do general ${nextP.name} (Distribuição: +${reinforcements} tropas).`, 'reinforce');
    }
  }, [
    currentPhase,
    conqueredThisTurn,
    activePlayer,
    activePlayerIndex,
    players,
    territories,
    activeMechanics.globalEvents,
    calculateReinforcements,
    checkVictory,
    addLog
  ]);

  // AI Turn Logic Automator
  useEffect(() => {
    if (!inGame || !activePlayer || !activePlayer.isAI || winnerPlayer) return;

    const timer = setTimeout(() => {
      // Step 1: Reinforce Phase for AI
      if (currentPhase === 'reinforce') {
        if (reserveArmies > 0) {
          const aiTerrs = (Object.values(territories) as TerritoryState[]).filter(t => t.ownerId === activePlayer.id);
          if (aiTerrs.length > 0) {
            // Reinforce territory with most enemy neighbors
            const targetTerr = aiTerrs.reduce((prev, curr) => {
              const prevEnemyNeighbors = TERRITORIES[prev.id]?.neighbors.filter(n => territories[n]?.ownerId !== activePlayer.id).length || 0;
              const currEnemyNeighbors = TERRITORIES[curr.id]?.neighbors.filter(n => territories[n]?.ownerId !== activePlayer.id).length || 0;
              return currEnemyNeighbors > prevEnemyNeighbors ? curr : prev;
            });

            setTerritories(prev => ({
              ...prev,
              [targetTerr.id]: { ...prev[targetTerr.id], armies: prev[targetTerr.id].armies + reserveArmies }
            }));
            setReserveArmies(0);
          }
        }
        handleNextPhase();
      }

      // Step 2: Attack Phase for AI
      else if (currentPhase === 'attack') {
        const aiTerrs = (Object.values(territories) as TerritoryState[]).filter(t => t.ownerId === activePlayer.id && t.armies >= 2);
        let foundAttack = false;

        for (const fromT of aiTerrs) {
          const neighbors = TERRITORIES[fromT.id]?.neighbors || [];
          for (const toId of neighbors) {
            const defT = territories[toId];
            if (defT && defT.ownerId !== activePlayer.id) {
              // Smart attack: only attack if armies > defender armies
              if (fromT.armies > defT.armies + 1) {
                // Execute auto battle
                foundAttack = true;
                setSelectedTerritoryId(fromT.id);
                setTargetTerritoryId(toId);
                // Conquered!
                const moved = fromT.armies - 1;
                handleResolveCombat({
                  attackerRemaining: 1,
                  defenderRemaining: 0,
                  conquered: true,
                  movedArmies: moved
                });
                break;
              }
            }
          }
          if (foundAttack) break;
        }

        // Finish attack phase
        handleNextPhase();
      }

      // Step 3: Maneuver Phase for AI
      else if (currentPhase === 'maneuver') {
        handleNextPhase();
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [inGame, activePlayer, currentPhase, reserveArmies, territories, winnerPlayer, handleNextPhase]);

  // Tactical Actions handler
  const handleUseTacticalAction = (actionType: string) => {
    if (!activePlayer) return;

    if (actionType === 'air_strike') {
      setTacticalTargetMode('air_strike');
      addLog(`✈️ Modo Ataque Aéreo: Selecione um território seu e em seguida o alvo inimigo!`, 'mechanic');
    } else if (actionType === 'fortify') {
      setTacticalTargetMode('fortify');
      addLog(`🛡️ Modo Fortaleza: Clique em um território seu para erguer fortificação (+1 dado de defesa).`, 'mechanic');
    } else if (actionType === 'spy_objective') {
      setIsObjectiveModalOpen(true);
      addLog(`👁️ Espionagem militar obteve relatórios táticos de inteligência.`, 'mechanic');
    } else if (actionType === 'emergency_recruits') {
      setReserveArmies(prev => prev + 3);
      warAudio.playTroopPlace();
      addLog(`🪖 Conscrição de Emergência! +3 exércitos adicionados à reserva.`, 'mechanic');
    } else if (actionType === 'blitzkrieg') {
      warAudio.playDiceRoll();
      addLog(`⚡ Blitzkrieg ativada! Moral das tropas ofensivas no nível máximo.`, 'mechanic');
    }
  };

  // Active player's objective and progress
  const activeObjective = useMemo(() => {
    if (!activePlayer) return CLASSIC_OBJECTIVES[0];
    return objectivesDeck.find(o => o.id === activePlayer.objectiveId) || CLASSIC_OBJECTIVES[0];
  }, [activePlayer, objectivesDeck]);

  const activeProgress = useMemo(() => {
    if (!activePlayer) return { completed: false, percent: 0, statusText: '' };
    return checkObjectiveProgress(activeObjective, activePlayer, players, territories);
  }, [activeObjective, activePlayer, players, territories]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans'] select-none">
      {!inGame ? (
        <GameSetup
          onStartGame={handleStartGame}
          onOpenObjectivesBuilder={() => setIsObjectivesBuilderOpen(true)}
          onOpenMechanicsEditor={() => setIsMechanicsEditorOpen(true)}
          activeMechanics={activeMechanics}
          objectivesDeck={objectivesDeck}
        />
      ) : (
        <div className="flex flex-col h-full w-full">
          {/* Top HUD */}
          <GameHeader
            activePlayer={activePlayer}
            currentPhase={currentPhase}
            reserveArmies={reserveArmies}
            currentRound={currentRound}
            activeGlobalEvent={activeGlobalEvent}
            onToggleAudio={toggleAudio}
            audioEnabled={audioEnabled}
          />

          {/* Tactical Target Indicator Banner */}
          {tacticalTargetMode && (
            <div className="w-full bg-amber-600/90 text-slate-950 px-4 py-1.5 text-xs font-black tracking-wider flex items-center justify-between animate-pulse">
              <span>
                {tacticalTargetMode === 'air_strike'
                  ? '✈️ MIRA AÉREA ATIVA: Selecione primeiro seu território de lançamento e depois o território inimigo!'
                  : '🛡️ CONSTRUIR FORTALEZA: Clique no seu território para fortificar!'}
              </span>
              <button
                onClick={() => setTacticalTargetMode(null)}
                className="px-2 py-0.5 rounded bg-black/40 text-white text-[11px] font-bold"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Main Map Arena */}
          <main className="flex-1 w-full relative overflow-hidden bg-[#0a1520] p-2 sm:p-4 flex items-center justify-center">
            <WarBoard
              territories={territories}
              players={players}
              activePlayer={activePlayer}
              currentPhase={currentPhase}
              selectedTerritoryId={selectedTerritoryId}
              targetTerritoryId={targetTerritoryId}
              onSelectTerritory={handleSelectTerritory}
              validTargets={validTargets}
              activeMechanics={activeMechanics}
              fogRevealedTerritories={fogRevealedTerritories}
            />
          </main>

          {/* Bottom Controls HUD */}
          <ActionPanel
            activePlayer={activePlayer}
            currentPhase={currentPhase}
            reserveArmies={reserveArmies}
            objectiveProgressPercent={activeProgress.percent}
            activeMechanics={activeMechanics}
            onNextPhase={handleNextPhase}
            onOpenObjective={() => setIsObjectiveModalOpen(true)}
            onOpenCards={() => setIsCardsModalOpen(true)}
            onOpenTacticalCards={() => setIsTacticalCardsOpen(true)}
            onOpenObjectivesBuilder={() => setIsObjectivesBuilderOpen(true)}
            onOpenMechanicsEditor={() => setIsMechanicsEditorOpen(true)}
            onOpenLogs={() => setIsLogsOpen(true)}
            onRestart={() => setInGame(false)}
          />
        </div>
      )}

      {/* Combat Modal */}
      {isCombatModalOpen && selectedTerritoryId && targetTerritoryId && (
        <CombatModal
          attackerPlayer={activePlayer}
          defenderPlayer={players.find(p => p.id === territories[targetTerritoryId].ownerId) || players[0]}
          attackerTerritoryState={territories[selectedTerritoryId]}
          defenderTerritoryState={territories[targetTerritoryId]}
          activeMechanics={activeMechanics}
          onResolveCombat={handleResolveCombat}
          onClose={() => {
            setIsCombatModalOpen(false);
            setTargetTerritoryId(null);
          }}
        />
      )}

      {/* Maneuver Modal */}
      {isManeuverModalOpen && selectedTerritoryId && targetTerritoryId && (
        <ManeuverModal
          fromTerritory={territories[selectedTerritoryId]}
          toTerritory={territories[targetTerritoryId]}
          onExecuteManeuver={handleExecuteManeuver}
          onClose={() => {
            setIsManeuverModalOpen(false);
            setTargetTerritoryId(null);
          }}
        />
      )}

      {/* Cards Modal */}
      {isCardsModalOpen && activePlayer && (
        <CardsModal
          player={activePlayer}
          tradeCount={cardTradeCount}
          territories={territories}
          onTradeCards={handleTradeCards}
          onClose={() => setIsCardsModalOpen(false)}
        />
      )}

      {/* Secret Objective Modal */}
      {isObjectiveModalOpen && activePlayer && (
        <ObjectiveModal
          objective={activeObjective}
          progress={activeProgress}
          playerName={activePlayer.name}
          onClose={() => setIsObjectiveModalOpen(false)}
        />
      )}

      {/* Objectives Builder & Manager Modal */}
      {isObjectivesBuilderOpen && (
        <ObjectivesBuilderModal
          objectivesDeck={objectivesDeck}
          onAddObjective={(newObj) => setObjectivesDeck(prev => [...prev, newObj])}
          onRemoveObjective={(id) => setObjectivesDeck(prev => prev.filter(o => o.id !== id))}
          onClose={() => setIsObjectivesBuilderOpen(false)}
        />
      )}

      {/* Mechanics & Rules Customizer Modal */}
      {isMechanicsEditorOpen && (
        <MechanicsEditorModal
          mechanics={activeMechanics}
          onUpdateMechanics={setActiveMechanics}
          onClose={() => setIsMechanicsEditorOpen(false)}
        />
      )}

      {/* Tactical Operations Modal */}
      {isTacticalCardsOpen && activePlayer && (
        <TacticalCardsModal
          player={activePlayer}
          onUseTacticalAction={handleUseTacticalAction}
          onClose={() => setIsTacticalCardsOpen(false)}
        />
      )}

      {/* Battle Log Drawer */}
      {isLogsOpen && (
        <GameLogModal
          logs={gameLogs}
          onClose={() => setIsLogsOpen(false)}
        />
      )}

      {/* Victory Modal */}
      {winnerPlayer && (
        <VictoryModal
          winner={winnerPlayer}
          objective={activeObjective}
          totalTurns={currentRound}
          onPlayAgain={() => {
            setWinnerPlayer(null);
            setInGame(false);
          }}
        />
      )}
    </div>
  );
}
