import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CONTINENTS, TERRITORIES, SEA_ROUTES } from './data/warMapData';
import { CLASSIC_OBJECTIVES, checkObjectiveProgress } from './data/objectivesData';
import { DEFAULT_MECHANICS, GLOBAL_EVENTS, TACTICAL_CARDS, TacticalCard } from './data/mechanicsData';
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
import { Plane } from 'lucide-react';
import { GameClient, OnlineRoomSnapshot } from './multiplayer/gameClient';

interface OnlineGameState {
  players: Player[];
  activePlayerIndex: number;
  currentRound: number;
  currentPhase: TurnPhase;
  territories: Record<string, TerritoryState>;
  reserveArmies: number;
  cardTradeCount: number;
  conqueredThisTurn: boolean;
  gameLogs: GameLogEntry[];
  activeGlobalEvent: GlobalEvent | null;
}

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
  const [onlineClient, setOnlineClient] = useState<GameClient | null>(null);
  const [onlineRoom, setOnlineRoom] = useState<OnlineRoomSnapshot | null>(null);
  const [onlinePlayerId, setOnlinePlayerId] = useState<string | null>(null);
  const [onlineStatus, setOnlineStatus] = useState('');

  // Tactical Action Mode (e.g. Air strike selection)
  const [tacticalTargetMode, setTacticalTargetMode] = useState<'air_strike' | 'fortify' | null>(null);
  const [airStrikeSetup, setAirStrikeSetup] = useState<{ sourceId: string; armies: number } | null>(null);
  const [airStrikePlan, setAirStrikePlan] = useState<{
    sourceId: string;
    committedArmies: number;
    combatArmies: number;
  } | null>(null);

  const activePlayer = players[activePlayerIndex] || null;
  const isOnlineTurn = !onlinePlayerId || activePlayer?.id === onlinePlayerId;
  const isOnlineHost = Boolean(
    onlineClient && onlineRoom && onlineClient.getConnectionId() === onlineRoom.hostConnectionId
  );

  const applyOnlineGameState = useCallback((rawState: unknown) => {
    if (!rawState || typeof rawState !== 'object') return;
    const state = rawState as Partial<OnlineGameState>;
    if (!state.players || !state.territories || !state.currentPhase) return;

    setPlayers(state.players);
    setActivePlayerIndex(state.activePlayerIndex ?? 0);
    setCurrentRound(state.currentRound ?? 1);
    setCurrentPhase(state.currentPhase);
    setTerritories(state.territories);
    setReserveArmies(state.reserveArmies ?? 0);
    setCardTradeCount(state.cardTradeCount ?? 0);
    setConqueredThisTurn(state.conqueredThisTurn ?? false);
    setGameLogs(state.gameLogs ?? []);
    setActiveGlobalEvent(state.activeGlobalEvent ?? null);
    setInGame(true);
  }, []);

  const handleJoinOnlineRoom = async (roomCode: string, playerName: string) => {
    try {
      const client = onlineClient || new GameClient();
      client.onRoomUpdated(setOnlineRoom);
      client.onGameStateUpdated(applyOnlineGameState);
      const room = await client.joinRoom(roomCode, playerName);
      setOnlineClient(client);
      setOnlineRoom(room);
      const joinedPlayer = room.players.find(player => player.connectionId === client.getConnectionId());
      setOnlinePlayerId(joinedPlayer?.playerId || null);
      if (room.gameState) applyOnlineGameState(room.gameState);
      setOnlineStatus('Conectado à sala. O estado da partida será compartilhado pelo anfitrião.');
    } catch (error) {
      setOnlineStatus(error instanceof Error ? error.message : 'Não foi possível conectar à sala.');
    }
  };

  const handleRollCombat = async () => {
    if (!onlineClient || !onlineRoom || !selectedTerritoryId || !targetTerritoryId) return null;
    try {
      return await onlineClient.rollCombat(onlineRoom.code, selectedTerritoryId, targetTerritoryId);
    } catch (error) {
      setOnlineStatus(error instanceof Error ? error.message : 'Não foi possível rolar o combate no servidor.');
      return null;
    }
  };

  useEffect(() => {
    if (!inGame || !onlineClient || !onlineRoom) return;
    if (onlineClient.getConnectionId() !== onlineRoom.hostConnectionId) return;

    const state: OnlineGameState = {
      players,
      activePlayerIndex,
      currentRound,
      currentPhase,
      territories,
      reserveArmies,
      cardTradeCount,
      conqueredThisTurn,
      gameLogs,
      activeGlobalEvent
    };

    onlineClient.publishGameState(onlineRoom.code, state).catch(error => {
      setOnlineStatus(error instanceof Error ? error.message : 'Falha ao sincronizar a partida.');
    });
  }, [
    inGame,
    onlineClient,
    onlineRoom,
    players,
    activePlayerIndex,
    currentRound,
    currentPhase,
    territories,
    reserveArmies,
    cardTradeCount,
    conqueredThisTurn,
    gameLogs,
    activeGlobalEvent
  ]);

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

    // Tactical air strike mode: the target is selected randomly from the map
    if (tacticalTargetMode === 'air_strike') {
      if (selState.ownerId !== activePlayer.id || selState.armies < 20) return [];
      return (Object.values(territories) as TerritoryState[])
        .filter(target => target.ownerId !== activePlayer.id)
        .map(target => target.id);
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
  const handleSelectTerritory = (territoryId: string, fromServer = false) => {
    if (!activePlayer || activePlayer.isAI || (!fromServer && !isOnlineTurn)) return;
    if (onlineClient && onlineRoom && !tacticalTargetMode && !isOnlineHost && !fromServer) {
      onlineClient.sendGameAction(onlineRoom.code, {
        type: 'select-territory',
        payload: { territoryId }
      }).catch(error => {
        setOnlineStatus(error instanceof Error ? error.message : 'Não foi possível enviar a jogada.');
      });
      if (currentPhase === 'reinforce') return;
    }
    const tState = territories[territoryId];
    if (!tState) return;

    // Tactical target execution
    if (tacticalTargetMode === 'air_strike') {
      if (!selectedTerritoryId) {
        if (tState.ownerId === activePlayer.id && tState.armies >= 20) {
          warAudio.playCard();
          setSelectedTerritoryId(territoryId);
          setAirStrikeSetup({ sourceId: territoryId, armies: 20 });
          addLog(`✈️ Território de lançamento definido: ${TERRITORIES[territoryId].name}. Escolha o efetivo do ataque.`, 'mechanic');
        } else {
          addLog('⚠️ O Ataque Aéreo exige pelo menos 20 tropas no território de lançamento.', 'mechanic');
        }
      }
      return;
    }

    if (tacticalTargetMode === 'fortify') {
      if (tState.ownerId === activePlayer.id) {
        if (onlineClient && onlineRoom) {
          onlineClient.resolveFortification(onlineRoom.code, territoryId).catch(error => {
            setOnlineStatus(error instanceof Error ? error.message : 'Não foi possível construir a Fortaleza.');
          });
          setTacticalTargetMode(null);
          setSelectedTerritoryId(null);
          return;
        }
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
  }, fromServer = false) => {
    if (!selectedTerritoryId || !targetTerritoryId || !activePlayer) return;

    const isAirStrike = airStrikePlan?.sourceId === selectedTerritoryId;
    if (isAirStrike && onlineClient && onlineRoom && result.conquered && !fromServer) {
      onlineClient.resolveAirStrike(onlineRoom.code, result.movedArmies).catch(error => {
        setOnlineStatus(error instanceof Error ? error.message : 'Não foi possível concluir o Ataque Aéreo.');
      });
      setIsCombatModalOpen(false);
      setTargetTerritoryId(null);
      setSelectedTerritoryId(null);
      setAirStrikePlan(null);
      setAirStrikeSetup(null);
      return;
    }

    if (onlineClient && onlineRoom && !isOnlineHost && !fromServer) {
      onlineClient.sendGameAction(onlineRoom.code, {
        type: 'resolve-combat',
        payload: {
          ...result,
          sourceId: selectedTerritoryId,
          targetId: targetTerritoryId
        }
      }).catch(error => {
        setOnlineStatus(error instanceof Error ? error.message : 'Não foi possível enviar o resultado do combate.');
      });
      setIsCombatModalOpen(false);
      setTargetTerritoryId(null);
      return;
    }

    const defenderPlayer = players.find(p => p.id === territories[targetTerritoryId].ownerId);

    const sourceState = territories[selectedTerritoryId];
    const committedAirStrikeArmies = airStrikePlan?.committedArmies || 0;

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
          armies: isAirStrike
            ? Math.max(0, sourceState.armies - committedAirStrikeArmies + result.attackerRemaining - result.movedArmies)
            : result.attackerRemaining
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
          armies: isAirStrike
            ? Math.max(0, sourceState.armies - committedAirStrikeArmies + result.attackerRemaining)
            : result.attackerRemaining
        },
        [targetTerritoryId]: {
          ...prev[targetTerritoryId],
          armies: result.defenderRemaining
        }
      }));
    }

    setIsCombatModalOpen(false);
    setTargetTerritoryId(null);
    if (isAirStrike) {
      setSelectedTerritoryId(null);
      setAirStrikePlan(null);
      setAirStrikeSetup(null);
    }
  };

  // Maneuver Execute
  const handleExecuteManeuver = (armiesToMove: number, fromServer = false) => {
    if (!selectedTerritoryId || !targetTerritoryId) return;

    if (onlineClient && onlineRoom && !isOnlineHost && !fromServer) {
      onlineClient.sendGameAction(onlineRoom.code, {
        type: 'maneuver',
        payload: {
          sourceId: selectedTerritoryId,
          targetId: targetTerritoryId,
          armies: armiesToMove
        }
      }).catch(error => {
        setOnlineStatus(error instanceof Error ? error.message : 'Não foi possível remanejar tropas.');
      });
      return;
    }

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
  const handleNextPhase = useCallback((fromServer = false) => {
    if (onlineClient && onlineRoom && !isOnlineHost && !fromServer) {
      onlineClient.sendGameAction(onlineRoom.code, {
        type: 'next-phase',
        payload: {}
      }).catch(error => {
        setOnlineStatus(error instanceof Error ? error.message : 'Não foi possível avançar a fase.');
      });
      return;
    }

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
    onlineClient,
    onlineRoom,
    isOnlineHost,
    calculateReinforcements,
    checkVictory,
    addLog
  ]);

  useEffect(() => {
    if (!onlineClient || !onlineRoom || !isOnlineHost) return;

    const removeHandler = onlineClient.onGameAction((_, rawAction) => {
      if (!rawAction || typeof rawAction !== 'object') return;
      const action = rawAction as {
        type?: string;
        payload?: {
          territoryId?: string;
          cardId?: string;
          armies?: number;
          attackerRemaining?: number;
          defenderRemaining?: number;
          conquered?: boolean;
          movedArmies?: number;
        }
      };

      if (action.type === 'select-territory' && action.payload?.territoryId) {
        handleSelectTerritory(action.payload.territoryId, true);
      } else if (action.type === 'next-phase') {
        handleNextPhase(true);
      } else if (action.type === 'use-card' && action.payload?.cardId) {
        const card = TACTICAL_CARDS.find(candidate => candidate.id === action.payload?.cardId);
        if (card && activePlayer?.tacticalCards.includes(card.id)) {
          handleUseTacticalAction(card, true);
        }
      } else if (action.type === 'maneuver' && action.payload?.armies) {
        handleExecuteManeuver(action.payload.armies, true);
      } else if (
        action.type === 'resolve-combat'
        && typeof action.payload?.attackerRemaining === 'number'
        && typeof action.payload.defenderRemaining === 'number'
        && typeof action.payload.conquered === 'boolean'
        && typeof action.payload.movedArmies === 'number'
      ) {
        handleResolveCombat({
          attackerRemaining: action.payload.attackerRemaining,
          defenderRemaining: action.payload.defenderRemaining,
          conquered: action.payload.conquered,
          movedArmies: action.payload.movedArmies
        }, true);
      }
    });

    return removeHandler;
  }, [onlineClient, onlineRoom, isOnlineHost, activePlayer, handleNextPhase, handleResolveCombat, handleExecuteManeuver]);

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
  const handleUseTacticalAction = (card: TacticalCard, fromServer = false) => {
    if (!activePlayer || (!fromServer && !isOnlineTurn)) return;
    if (onlineClient && onlineRoom && !isOnlineHost && !fromServer) {
      onlineClient.sendGameAction(onlineRoom.code, {
        type: 'use-card',
        payload: { cardId: card.id }
      }).catch(error => {
        setOnlineStatus(error instanceof Error ? error.message : 'Não foi possível usar a carta.');
      });
      return;
    }

    if (!onlineClient || !onlineRoom) {
      setPlayers(prev => prev.map(player => (
        player.id === activePlayer.id
          ? { ...player, tacticalCards: player.tacticalCards.filter(cardId => cardId !== card.id) }
          : player
      )));
    }

    if (card.effect === 'air_strike') {
      setTacticalTargetMode('air_strike');
      addLog(`✈️ ${card.name} utilizada: selecione um território seu com pelo menos 20 tropas.`, 'mechanic');
    } else if (card.effect === 'fortify') {
      setTacticalTargetMode('fortify');
      addLog(`🛡️ Modo Fortaleza: Clique em um território seu para erguer fortificação (+1 dado de defesa).`, 'mechanic');
    } else if (card.effect === 'spy_objective') {
      setIsObjectiveModalOpen(true);
      addLog(`👁️ Espionagem militar obteve relatórios táticos de inteligência.`, 'mechanic');
    } else if (card.effect === 'emergency_recruits') {
      setReserveArmies(prev => prev + 3);
      warAudio.playTroopPlace();
      addLog(`🪖 Conscrição de Emergência! +3 exércitos adicionados à reserva.`, 'mechanic');
    } else if (card.effect === 'blitzkrieg') {
      warAudio.playDiceRoll();
      addLog(`⚡ Blitzkrieg ativada! Moral das tropas ofensivas no nível máximo.`, 'mechanic');
    }
  };

  const confirmAirStrike = async () => {
    if (!airStrikeSetup || !activePlayer) return;

    const source = territories[airStrikeSetup.sourceId];
    if (!source || source.ownerId !== activePlayer.id) return;

    const committedArmies = Math.min(
      source.armies,
      Math.max(20, Math.floor(airStrikeSetup.armies))
    );

    if (onlineClient && onlineRoom) {
      try {
        const plan = await onlineClient.prepareAirStrike(onlineRoom.code, source.id, committedArmies);
        setAirStrikePlan({
          sourceId: source.id,
          committedArmies: plan.committedArmies,
          combatArmies: plan.combatArmies
        });
        setTargetTerritoryId(plan.targetId);
        setAirStrikeSetup(null);
        setTacticalTargetMode(null);
        setIsCombatModalOpen(true);
        addLog(
          `✈️ Ataque Aéreo preparado pelo servidor: ${plan.committedArmies} tropas (${plan.costArmies} de custo). Alvo: ${TERRITORIES[plan.targetId].name}.`,
          'mechanic'
        );
      } catch (error) {
        setOnlineStatus(error instanceof Error ? error.message : 'Não foi possível preparar o Ataque Aéreo.');
      }
      return;
    }

    const costArmies = Math.floor(committedArmies / 2);
    const combatArmies = committedArmies - costArmies;
    const possibleTargets = (Object.values(territories) as TerritoryState[])
      .filter(target => target.ownerId !== activePlayer.id)
      .map(target => target.id);
    const randomTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];

    if (!randomTarget) {
      addLog('⚠️ Nenhum território inimigo disponível para o Ataque Aéreo.', 'mechanic');
      setAirStrikeSetup(null);
      setTacticalTargetMode(null);
      setSelectedTerritoryId(null);
      return;
    }

    setAirStrikePlan({
      sourceId: source.id,
      committedArmies,
      combatArmies
    });
    setTargetTerritoryId(randomTarget);
    setAirStrikeSetup(null);
    setTacticalTargetMode(null);
    setIsCombatModalOpen(true);
    addLog(
      `✈️ Ataque Aéreo: ${committedArmies} tropas comprometidas (${costArmies} de custo). Alvo sorteado: ${TERRITORIES[randomTarget].name}.`,
      'mechanic'
    );
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
          onJoinOnlineRoom={handleJoinOnlineRoom}
          onlineRoom={onlineRoom}
          onlineStatus={onlineStatus}
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
                  ? '✈️ ATAQUE AÉREO: Selecione um território seu com pelo menos 20 tropas. O alvo inimigo será sorteado!'
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
      {airStrikeSetup && activePlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-sky-500/40 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <Plane className="h-6 w-6 text-sky-400" />
              <div>
                <h2 className="text-lg font-bold text-slate-100">Ataque Aéreo Estratégico</h2>
                <p className="text-xs text-slate-400">Escolha quantas tropas serão comprometidas.</p>
              </div>
            </div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-400" htmlFor="air-strike-armies">
              Tropas do ataque
            </label>
            <input
              id="air-strike-armies"
              type="number"
              min={20}
              max={airStrikeSetup.sourceId ? territories[airStrikeSetup.sourceId].armies : 20}
              value={airStrikeSetup.armies}
              onChange={event => setAirStrikeSetup(prev => prev ? { ...prev, armies: Number(event.target.value) } : prev)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-sky-400"
            />
            <p className="mt-2 text-xs text-slate-400">Metade das tropas escolhidas será o custo da operação. O restante participa da batalha.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setAirStrikeSetup(null);
                  setTacticalTargetMode(null);
                  setSelectedTerritoryId(null);
                }}
                className="rounded-lg px-3 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAirStrike}
                disabled={airStrikeSetup.armies < 20 || airStrikeSetup.armies > territories[airStrikeSetup.sourceId].armies}
                className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sortear alvo e atacar
              </button>
            </div>
          </div>
        </div>
      )}

      {isCombatModalOpen && selectedTerritoryId && targetTerritoryId && (
        <CombatModal
          attackerPlayer={activePlayer}
          defenderPlayer={players.find(p => p.id === territories[targetTerritoryId].ownerId) || players[0]}
          attackerTerritoryState={airStrikePlan ? {
            ...territories[selectedTerritoryId],
            armies: airStrikePlan.combatArmies
          } : territories[selectedTerritoryId]}
          defenderTerritoryState={territories[targetTerritoryId]}
          activeMechanics={activeMechanics}
          onResolveCombat={handleResolveCombat}
          onRollCombat={onlineClient && onlineRoom ? handleRollCombat : undefined}
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
