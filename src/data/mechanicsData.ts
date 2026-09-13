import { ActiveMechanics, GlobalEvent } from '../types/war';

export const DEFAULT_MECHANICS: ActiveMechanics = {
  fogOfWar: false,
  airStrikes: true,
  fortifications: true,
  globalEvents: true,
  tacticalCards: true,
  defenderWinsTies: true, // Clássico WAR Grow
  progressiveCardTrades: true, // 4, 6, 8, 10, 12, 15, 20...
  capitalsMode: false,
  unlimitedManeuvers: false,
  alliancePacts: true,
  minArmiesPlacement: 3
};

export interface TacticalCard {
  id: string;
  name: string;
  description: string;
  costArmies: number;
  icon: string;
  effect: 'air_strike';
}

export const TACTICAL_CARDS: TacticalCard[] = [
  {
    id: 'tac_air_strike',
    name: 'Ataque Aéreo Estratégico',
    description: 'Exige pelo menos 20 tropas no território de lançamento. Seleciona um território inimigo aleatório em qualquer lugar do mapa e inicia um combate; se vencer, os sobreviventes ocupam a área atacada.',
    costArmies: 1,
    icon: 'Plane',
    effect: 'air_strike'
  },
];

export const GLOBAL_EVENTS: GlobalEvent[] = [
  {
    id: 'evt_blizzard',
    name: 'Inverno Siberiano Severo',
    description: 'A Sibéria e Dudinka congelaram! Tropas na região não podem atacar nem remanejar nesta rodada.',
    icon: 'Snowflake',
    effect: 'freeze_siberia',
    affectedContinent: 'asia',
    durationTurns: 1
  },
  {
    id: 'evt_suez_blockade',
    name: 'Crise no Canal de Suez',
    description: 'A passagem marítima entre o Egito e o Oriente Médio está interditada por bloqueio naval.',
    icon: 'Anchor',
    effect: 'panama_blocked',
    affectedContinent: 'africa',
    durationTurns: 1
  },
  {
    id: 'evt_arms_shipment',
    name: 'Remessa Aliada de Armamentos',
    description: 'Navios cargueiros entregaram suprimentos! Todos os generais recebem +2 exércitos bônus na distribuição.',
    icon: 'Package',
    effect: 'arms_shipment',
    durationTurns: 1
  },
  {
    id: 'evt_popular_uprising',
    name: 'Insurreição Popular',
    description: 'Um levante popular em território neutro/instável acrescentou +2 tropas de guerrilha para defesa!',
    icon: 'Flame',
    effect: 'peoples_rebellion',
    durationTurns: 1
  },
  {
    id: 'evt_monsoon',
    name: 'Monções Tropicais no Sudeste Asiático',
    description: 'Tempestades torrenciais dificultam a travessia de Vietnã e Índia para a Oceania.',
    icon: 'CloudRain',
    effect: 'monsoon_india',
    affectedContinent: 'asia',
    durationTurns: 1
  }
];
