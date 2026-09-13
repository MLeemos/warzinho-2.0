export type ContinentId = 
  | 'north_america'
  | 'south_america'
  | 'europe'
  | 'africa'
  | 'asia'
  | 'oceania';

export type CardSymbol = 'circle' | 'triangle' | 'square' | 'joker';

export interface TerritoryDef {
  id: string;
  name: string;
  continent: ContinentId;
  neighbors: string[];
  x: number; // center percentage on SVG viewBox (0-1000)
  y: number; // center percentage on SVG viewBox (0-650)
  labelOffset?: { x: number; y: number };
  pathData?: string; // custom SVG path polygon
  cardSymbol: CardSymbol;
}

export interface ContinentDef {
  id: ContinentId;
  name: string;
  bonus: number;
  color: string;
  borderColor: string;
  territoryIds: string[];
}

export type PlayerColor = 
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'white'
  | 'black';

export interface PlayerColorInfo {
  id: PlayerColor;
  name: string;
  hex: string;
  accentHex: string;
  borderHex: string;
  badgeHex: string;
  textHex: string;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  isAI: boolean;
  aiDifficulty?: 'easy' | 'normal' | 'hard';
  objectiveId: string;
  cards: string[]; // territory ids or 'joker_1', 'joker_2'
  tacticalCards: string[];
  eliminated: boolean;
  stats: {
    territoriesLost: number;
    territoriesConquered: number;
    armiesDefeated: number;
    armiesLost: number;
  };
}

export interface TerritoryState {
  id: string;
  ownerId: string;
  armies: number;
  fortified?: boolean; // Mechanic: fortress (+1 defense die)
  isCapital?: boolean; // Mechanic: capital
  underBlockade?: boolean; // Mechanic: sea blockade
}

export type TurnPhase = 
  | 'reinforce' // Colocar tropas
  | 'attack'    // Atacar territórios
  | 'maneuver'  // Remanejar tropas
  | 'ended';    // Rodada terminada

export interface CombatState {
  fromTerritoryId: string;
  toTerritoryId: string;
  attackerDice: number[];
  defenderDice: number[];
  attackerLosses: number;
  defenderLosses: number;
  conquered: boolean;
  isActive: boolean;
}

export type ObjectiveConditionType =
  | 'conquer_continents'
  | 'conquer_territories_count'
  | 'conquer_continents_plus_choice'
  | 'eliminate_color'
  | 'fortified_territories'
  | 'dominate_capitals'
  | 'island_blockade';

export interface SecretObjective {
  id: string;
  title: string;
  description: string;
  isCustom?: boolean;
  type: ObjectiveConditionType;
  params: {
    continents?: ContinentId[];
    extraTerritories?: number;
    totalTerritories?: number;
    minArmiesPerTerritory?: number;
    targetColor?: PlayerColor;
    fallbackTerritoriesCount?: number;
    requiredTerritories?: string[];
  };
}

export interface ActiveMechanics {
  // Built-in toggles and customizable rules
  fogOfWar: boolean;           // Nevoeiro de guerra
  airStrikes: boolean;         // Bombardeio aéreo (atacar a distância sem mover)
  fortifications: boolean;     // Construir fortalezas defensivas
  globalEvents: boolean;       // Eventos climáticos/diplomáticos por rodada
  tacticalCards: boolean;      // Cartas táticas de ação (espionagem, reforço relâmpago)
  defenderWinsTies: boolean;   // Regra clássica de empate (true = defensor vence)
  progressiveCardTrades: boolean; // Tabela progressiva 4,6,8,10,12,15,20...
  capitalsMode: boolean;       // Modo capitais (conquistar capitais inimigas)
  unlimitedManeuvers: boolean; // Remanejamento livre vs apenas entre 2 vizinhos
  alliancePacts: boolean;      // Pactos de não-agressão temporários
  minArmiesPlacement: number;  // Tropas mínimas por rodada (padrão 3)
}

export interface GlobalEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: 'freeze_siberia' | 'panama_blocked' | 'monsoon_india' | 'arms_shipment' | 'peoples_rebellion' | 'peace_accord';
  affectedContinent?: ContinentId;
  durationTurns: number;
}

export interface GameLogEntry {
  id: string;
  turn: number;
  text: string;
  timestamp: string;
  type: 'attack' | 'conquest' | 'card' | 'reinforce' | 'elimination' | 'event' | 'mechanic';
  color?: PlayerColor;
}
