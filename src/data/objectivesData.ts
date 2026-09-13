import { ContinentId, Player, PlayerColor, SecretObjective, TerritoryState } from '../types/war';
import { CONTINENTS } from './warMapData';

export const CLASSIC_OBJECTIVES: SecretObjective[] = [
  {
    id: 'obj_eur_oce_choice',
    title: 'Europa, Oceania + 1 Continente',
    description: 'Conquistar na totalidade a EUROPA, a OCEANIA e mais um terceiro continente à sua escolha.',
    type: 'conquer_continents_plus_choice',
    params: {
      continents: ['europe', 'oceania'],
      extraTerritories: 1
    }
  },
  {
    id: 'obj_asia_sa',
    title: 'Ásia e América do Sul',
    description: 'Conquistar na totalidade a ÁSIA e a AMÉRICA DO SUL.',
    type: 'conquer_continents',
    params: {
      continents: ['asia', 'south_america']
    }
  },
  {
    id: 'obj_asia_afr',
    title: 'Ásia e África',
    description: 'Conquistar na totalidade a ÁSIA e a ÁFRICA.',
    type: 'conquer_continents',
    params: {
      continents: ['asia', 'africa']
    }
  },
  {
    id: 'obj_na_afr',
    title: 'América do Norte e África',
    description: 'Conquistar na totalidade a AMÉRICA DO NORTE e a ÁFRICA.',
    type: 'conquer_continents',
    params: {
      continents: ['north_america', 'africa']
    }
  },
  {
    id: 'obj_na_oce',
    title: 'América do Norte e Oceania',
    description: 'Conquistar na totalidade a AMÉRICA DO NORTE e a OCEANIA.',
    type: 'conquer_continents',
    params: {
      continents: ['north_america', 'oceania']
    }
  },
  {
    id: 'obj_eur_sa_choice',
    title: 'Europa, América do Sul + 1 Continente',
    description: 'Conquistar na totalidade a EUROPA, a AMÉRICA DO SUL e mais um terceiro continente à sua escolha.',
    type: 'conquer_continents_plus_choice',
    params: {
      continents: ['europe', 'south_america'],
      extraTerritories: 1
    }
  },
  {
    id: 'obj_24_territories',
    title: '24 Territórios Livres',
    description: 'Conquistar 24 territórios à sua escolha.',
    type: 'conquer_territories_count',
    params: {
      totalTerritories: 24
    }
  },
  {
    id: 'obj_18_with_2',
    title: '18 Territórios Fortificados',
    description: 'Conquistar 18 territórios e ocupar cada um deles com pelo menos 2 exércitos.',
    type: 'fortified_territories',
    params: {
      totalTerritories: 18,
      minArmiesPerTerritory: 2
    }
  },
  {
    id: 'obj_destroy_yellow',
    title: 'Destruir Exércitos Amarelos',
    description: 'Destruir totalmente os exércitos AMARELOS. Se você for o Amarelo ou se ele não estiver no jogo, seu objetivo é conquistar 24 territórios.',
    type: 'eliminate_color',
    params: {
      targetColor: 'yellow',
      fallbackTerritoriesCount: 24
    }
  },
  {
    id: 'obj_destroy_blue',
    title: 'Destruir Exércitos Azuis',
    description: 'Destruir totalmente os exércitos AZUIS. Se você for o Azul ou se ele não estiver no jogo, seu objetivo é conquistar 24 territórios.',
    type: 'eliminate_color',
    params: {
      targetColor: 'blue',
      fallbackTerritoriesCount: 24
    }
  },
  {
    id: 'obj_destroy_white',
    title: 'Destruir Exércitos Brancos',
    description: 'Destruir totalmente os exércitos BRANCOS. Se você for o Branco ou se ele não estiver no jogo, seu objetivo é conquistar 24 territórios.',
    type: 'eliminate_color',
    params: {
      targetColor: 'white',
      fallbackTerritoriesCount: 24
    }
  },
  {
    id: 'obj_destroy_black',
    title: 'Destruir Exércitos Pretos',
    description: 'Destruir totalmente os exércitos PRETOS. Se você for o Preto ou se ele não estiver no jogo, seu objetivo é conquistar 24 territórios.',
    type: 'eliminate_color',
    params: {
      targetColor: 'black',
      fallbackTerritoriesCount: 24
    }
  },
  {
    id: 'obj_destroy_red',
    title: 'Destruir Exércitos Vermelhos',
    description: 'Destruir totalmente os exércitos VERMELHOS. Se você for o Vermelho ou se ele não estiver no jogo, seu objetivo é conquistar 24 territórios.',
    type: 'eliminate_color',
    params: {
      targetColor: 'red',
      fallbackTerritoriesCount: 24
    }
  },
  {
    id: 'obj_destroy_green',
    title: 'Destruir Exércitos Verdes',
    description: 'Destruir totalmente os exércitos VERDES. Se você for o Verde ou se ele não estiver no jogo, seu objetivo é conquistar 24 territórios.',
    type: 'eliminate_color',
    params: {
      targetColor: 'green',
      fallbackTerritoriesCount: 24
    }
  },

  // OBJETIVOS EXPANDIDOS / NOVAS MECÂNICAS PRE-SET
  {
    id: 'obj_island_bastion',
    title: 'Domínio Insular e Marítimo',
    description: 'Conquistar e controlar todos os territórios insulares: Islândia, Inglaterra, Madagascar, Japão, Sumatra, Bornéu, Nova Guiné e Austrália.',
    type: 'island_blockade',
    isCustom: true,
    params: {
      requiredTerritories: ['islandia', 'inglaterra', 'madagascar', 'japao', 'sumatra', 'borneu', 'nova_guine', 'australia']
    }
  },
  {
    id: 'obj_triad_empires',
    title: 'Tríade das Grandes Capitais',
    description: 'Conquistar e manter sob seu controle o Brasil, Moscou e a China, cada um com no mínimo 4 exércitos, além de outros 12 territórios.',
    type: 'dominate_capitals',
    isCustom: true,
    params: {
      requiredTerritories: ['brasil', 'moscou', 'china'],
      minArmiesPerTerritory: 4,
      totalTerritories: 15
    }
  },
  {
    id: 'obj_fortress_12',
    title: 'Muralha Continental',
    description: 'Conquistar pelo menos 14 territórios e defender cada um com no mínimo 3 exércitos.',
    type: 'fortified_territories',
    isCustom: true,
    params: {
      totalTerritories: 14,
      minArmiesPerTerritory: 3
    }
  }
];

export function checkObjectiveProgress(
  objective: SecretObjective,
  player: Player,
  players: Player[],
  territories: Record<string, TerritoryState>
): { completed: boolean; percent: number; statusText: string } {
  const playerTerritories = Object.values(territories).filter(t => t.ownerId === player.id);
  const count = playerTerritories.length;

  switch (objective.type) {
    case 'conquer_territories_count': {
      const target = objective.params.totalTerritories || 24;
      const percent = Math.min(100, Math.round((count / target) * 100));
      return {
        completed: count >= target,
        percent,
        statusText: `${count} de ${target} territórios conquistados`
      };
    }

    case 'fortified_territories': {
      const minArmies = objective.params.minArmiesPerTerritory || 2;
      const target = objective.params.totalTerritories || 18;
      const fortifiedCount = playerTerritories.filter(t => t.armies >= minArmies).length;
      const percent = Math.min(100, Math.round((fortifiedCount / target) * 100));
      return {
        completed: fortifiedCount >= target,
        percent,
        statusText: `${fortifiedCount} de ${target} territórios com ${minArmies}+ exércitos`
      };
    }

    case 'conquer_continents': {
      const reqContinents = objective.params.continents || [];
      let completedContinents = 0;

      for (const contId of reqContinents) {
        const contDef = CONTINENTS[contId];
        const hasAll = contDef.territoryIds.every(tId => territories[tId]?.ownerId === player.id);
        if (hasAll) completedContinents++;
      }

      const percent = Math.round((completedContinents / reqContinents.length) * 100);
      const names = reqContinents.map(c => CONTINENTS[c].name).join(' e ');
      return {
        completed: completedContinents === reqContinents.length,
        percent,
        statusText: `${completedContinents} de ${reqContinents.length} continentes (${names})`
      };
    }

    case 'conquer_continents_plus_choice': {
      const reqContinents = objective.params.continents || [];
      let baseComplete = true;
      let continentsOwned = 0;

      for (const contId of reqContinents) {
        const contDef = CONTINENTS[contId];
        const hasAll = contDef.territoryIds.every(tId => territories[tId]?.ownerId === player.id);
        if (!hasAll) {
          baseComplete = false;
        } else {
          continentsOwned++;
        }
      }

      // Check if player owns any OTHER continent
      let hasThirdContinent = false;
      const otherContinents = (Object.keys(CONTINENTS) as ContinentId[]).filter(c => !reqContinents.includes(c));
      for (const c of otherContinents) {
        if (CONTINENTS[c].territoryIds.every(tId => territories[tId]?.ownerId === player.id)) {
          hasThirdContinent = true;
          continentsOwned++;
          break;
        }
      }

      const totalReq = reqContinents.length + 1;
      const percent = Math.min(100, Math.round((continentsOwned / totalReq) * 100));

      return {
        completed: baseComplete && hasThirdContinent,
        percent,
        statusText: `${continentsOwned} de ${totalReq} continentes dominados`
      };
    }

    case 'eliminate_color': {
      const targetColor = objective.params.targetColor;
      const targetPlayer = players.find(p => p.color === targetColor);

      // Se o jogador é ele mesmo ou a cor alvo não existe na partida: fallback para 24 territórios
      if (!targetPlayer || targetPlayer.id === player.id) {
        const target = objective.params.fallbackTerritoriesCount || 24;
        const percent = Math.min(100, Math.round((count / target) * 100));
        return {
          completed: count >= target,
          percent,
          statusText: `Alvo não existe: objetivo alternativo de ${count}/${target} territórios`
        };
      }

      const targetTerritories = Object.values(territories).filter(t => t.ownerId === targetPlayer.id);
      const isEliminated = targetPlayer.eliminated || targetTerritories.length === 0;

      return {
        completed: isEliminated,
        percent: isEliminated ? 100 : Math.max(10, Math.round(((42 - targetTerritories.length) / 42) * 100)),
        statusText: isEliminated 
          ? `Exércitos ${targetPlayer.name} eliminados!` 
          : `Restam ${targetTerritories.length} territórios do jogador ${targetPlayer.name}`
      };
    }

    case 'island_blockade': {
      const required = objective.params.requiredTerritories || [];
      const owned = required.filter(tId => territories[tId]?.ownerId === player.id).length;
      const percent = Math.round((owned / required.length) * 100);
      return {
        completed: owned === required.length,
        percent,
        statusText: `${owned} de ${required.length} ilhas e bastiões sob seu controle`
      };
    }

    case 'dominate_capitals': {
      const req = objective.params.requiredTerritories || [];
      const minArmies = objective.params.minArmiesPerTerritory || 3;
      const targetTotal = objective.params.totalTerritories || 12;

      const capitalsHeld = req.filter(tId => {
        const t = territories[tId];
        return t && t.ownerId === player.id && t.armies >= minArmies;
      }).length;

      const completed = capitalsHeld === req.length && count >= targetTotal;
      const progressScore = (capitalsHeld / req.length) * 50 + Math.min(50, (count / targetTotal) * 50);

      return {
        completed,
        percent: Math.min(100, Math.round(progressScore)),
        statusText: `${capitalsHeld}/${req.length} capitais com ${minArmies}+ tropas & ${count}/${targetTotal} territórios`
      };
    }

    default:
      return { completed: false, percent: 0, statusText: 'Objetivo em andamento' };
  }
}
