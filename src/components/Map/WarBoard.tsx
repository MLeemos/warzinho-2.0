import React, { useMemo } from 'react';
import { CONTINENTS, PLAYER_COLORS, SEA_ROUTES, TERRITORIES } from '../../data/warMapData';
import { ActiveMechanics, Player, TerritoryDef, TerritoryState, TurnPhase } from '../../types/war';
import { Shield, Crosshair, Star, AlertTriangle } from 'lucide-react';

interface WarBoardProps {
  territories: Record<string, TerritoryState>;
  players: Player[];
  activePlayer: Player;
  currentPhase: TurnPhase;
  selectedTerritoryId: string | null;
  targetTerritoryId: string | null;
  onSelectTerritory: (territoryId: string) => void;
  validTargets: string[];
  activeMechanics: ActiveMechanics;
  fogRevealedTerritories?: Set<string>;
}

export const WarBoard: React.FC<WarBoardProps> = ({
  territories,
  players,
  activePlayer,
  currentPhase,
  selectedTerritoryId,
  targetTerritoryId,
  onSelectTerritory,
  validTargets,
  activeMechanics,
  fogRevealedTerritories
}) => {
  const playersMap = useMemo(() => {
    return new Map(players.map(p => [p.id, p]));
  }, [players]);

  // Selected territory object
  const selectedTerritory = selectedTerritoryId ? TERRITORIES[selectedTerritoryId] : null;

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded-xl border border-slate-700/60 shadow-2xl bg-[#112436]">
      {/* SVG Canvas Map */}
      <svg
        viewBox="0 0 1000 700"
        className="w-full h-full object-contain"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle ocean grid pattern */}
          <pattern id="oceanGrid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.04" />
          </pattern>

          {/* Compass rose glow */}
          <radialGradient id="compassGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>

          {/* Player badge shadow */}
          <filter id="badgeShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.7" />
          </filter>

          <filter id="glowTarget" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ocean Background & Coordinate grid */}
        <rect width="1000" height="700" fill="#14283b" />
        <rect width="1000" height="700" fill="url(#oceanGrid)" />

        {/* Vintage ocean texture & ambient lighting */}
        <circle cx="200" cy="500" r="300" fill="url(#compassGlow)" />
        <circle cx="800" cy="200" r="350" fill="url(#compassGlow)" />

        {/* Ocean Names styling matching Grow board */}
        <text x="120" y="480" fill="#64748b" opacity="0.35" fontSize="13" fontWeight="800" letterSpacing="4" fontFamily="Cinzel, serif">
          OCEANO PACÍFICO
        </text>
        <text x="440" y="660" fill="#64748b" opacity="0.35" fontSize="13" fontWeight="800" letterSpacing="4" fontFamily="Cinzel, serif">
          OCEANO ATLÂNTICO
        </text>
        <text x="680" y="530" fill="#64748b" opacity="0.35" fontSize="13" fontWeight="800" letterSpacing="4" fontFamily="Cinzel, serif">
          OCEANO ÍNDICO
        </text>
        <text x="920" y="490" fill="#64748b" opacity="0.35" fontSize="13" fontWeight="800" letterSpacing="4" fontFamily="Cinzel, serif">
          OCEANO PACÍFICO
        </text>

        {/* Continents Labels Background Watermarks */}
        <text x="210" y="90" fill="#ea580c" opacity="0.35" fontSize="14" fontWeight="800" letterSpacing="2" fontFamily="Cinzel, serif">
          América do Norte
        </text>
        <text x="290" y="605" fill="#16a34a" opacity="0.35" fontSize="13" fontWeight="800" letterSpacing="2" fontFamily="Cinzel, serif">
          América do Sul
        </text>
        <text x="480" y="145" fill="#0284c7" opacity="0.35" fontSize="14" fontWeight="800" letterSpacing="2" fontFamily="Cinzel, serif">
          Europa
        </text>
        <text x="470" y="520" fill="#db2777" opacity="0.35" fontSize="14" fontWeight="800" letterSpacing="2" fontFamily="Cinzel, serif">
          África
        </text>
        <text x="680" y="115" fill="#eab308" opacity="0.35" fontSize="15" fontWeight="800" letterSpacing="3" fontFamily="Cinzel, serif">
          Ásia
        </text>
        <text x="760" y="665" fill="#b45309" opacity="0.35" fontSize="13" fontWeight="800" letterSpacing="2" fontFamily="Cinzel, serif">
          Oceania
        </text>

        {/* Sea connection routes (Curved dashed lanes) */}
        {SEA_ROUTES.map((route, idx) => {
          const t1 = TERRITORIES[route.from];
          const t2 = TERRITORIES[route.to];
          if (!t1 || !t2) return null;

          // Special case: Alasca to Vladivostok wraps across borders
          if (route.from === 'alasca' && route.to === 'vladivostok') {
            return (
              <g key={`route-wrap-${idx}`} opacity="0.6">
                <path
                  d={`M ${t1.x} ${t1.y} C 30 110, 0 120, 0 130`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <path
                  d={`M 1000 210 C 970 210, 930 215, ${t2.x} ${t2.y}`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <text x="5" y="125" fill="#38bdf8" fontSize="9" fontWeight="bold">Ao Japão/Vlad.</text>
                <text x="930" y="205" fill="#38bdf8" fontSize="9" fontWeight="bold">Ao Alasca</text>
              </g>
            );
          }

          const midX = (t1.x + t2.x) / 2;
          const midY = (t1.y + t2.y) / 2 + (route.curveOffset || 0);

          return (
            <g key={`route-${idx}`} opacity="0.55">
              <path
                d={`M ${t1.x} ${t1.y} Q ${midX} ${midY}, ${t2.x} ${t2.y}`}
                fill="none"
                stroke="#67e8f9"
                strokeWidth="1.8"
                strokeDasharray="3 4"
              />
            </g>
          );
        })}

        {/* Regular land neighbor connection lines */}
        {Object.values(TERRITORIES).map((t) => {
          return t.neighbors.map((nId) => {
            if (t.id > nId) return null; // Avoid duplicate lines
            const n = TERRITORIES[nId];
            if (!n) return null;

            // If it's a sea route, we already drew it nicely
            const isSea = SEA_ROUTES.some(
              r => (r.from === t.id && r.to === nId) || (r.from === nId && r.to === t.id)
            );
            if (isSea) return null;

            return (
              <line
                key={`conn-${t.id}-${nId}`}
                x1={t.x}
                y1={t.y}
                x2={n.x}
                y2={n.y}
                stroke="#334155"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                opacity="0.45"
              />
            );
          });
        })}

        {/* Active Attack Target Line */}
        {selectedTerritory && targetTerritoryId && (
          <g>
            <line
              x1={selectedTerritory.x}
              y1={selectedTerritory.y}
              x2={TERRITORIES[targetTerritoryId].x}
              y2={TERRITORIES[targetTerritoryId].y}
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeDasharray="5 3"
              className="animate-pulse"
            />
          </g>
        )}

        {/* Territory interactive nodes and regions */}
        {Object.values(TERRITORIES).map((territoryDef: TerritoryDef) => {
          const tState = territories[territoryDef.id] || {
            id: territoryDef.id,
            ownerId: '',
            armies: 1
          };
          const owner = playersMap.get(tState.ownerId);
          const ownerColor = owner ? PLAYER_COLORS[owner.color] : PLAYER_COLORS.white;
          const continent = CONTINENTS[territoryDef.continent];

          const isSelected = selectedTerritoryId === territoryDef.id;
          const isTarget = targetTerritoryId === territoryDef.id;
          const isValidTarget = validTargets.includes(territoryDef.id);
          const isOwn = tState.ownerId === activePlayer.id;

          // Fog of war check
          const isHiddenByFog = activeMechanics.fogOfWar && fogRevealedTerritories && !fogRevealedTerritories.has(territoryDef.id);

          return (
            <g
              key={territoryDef.id}
              id={`territory-${territoryDef.id}`}
              className="cursor-pointer transition-transform duration-150"
              onClick={() => onSelectTerritory(territoryDef.id)}
            >
              {/* Territory halo / continent area base */}
              <circle
                cx={territoryDef.x}
                cy={territoryDef.y}
                r={24}
                fill={continent.color}
                fillOpacity={isSelected ? 0.45 : isTarget ? 0.5 : 0.22}
                stroke={isSelected ? '#38bdf8' : isValidTarget ? '#ef4444' : continent.borderColor}
                strokeWidth={isSelected ? 3.5 : isValidTarget ? 2.5 : 1.2}
                strokeDasharray={isValidTarget ? '4 2' : undefined}
                className={isValidTarget ? 'animate-pulse' : ''}
              />

              {/* Fog overlay if mechanic enabled */}
              {isHiddenByFog && (
                <circle
                  cx={territoryDef.x}
                  cy={territoryDef.y}
                  r={26}
                  fill="#0f172a"
                  fillOpacity="0.85"
                />
              )}

              {/* Territory Name Label */}
              <text
                x={territoryDef.x}
                y={territoryDef.y - 19}
                textAnchor="middle"
                fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                fontSize="9.5"
                fontWeight="700"
                fontFamily="Plus Jakarta Sans, sans-serif"
                style={{
                  textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 2px #000',
                  pointerEvents: 'none'
                }}
              >
                {territoryDef.name}
              </text>

              {/* Main Army Badge */}
              <g transform={`translate(${territoryDef.x - 14}, ${territoryDef.y - 12})`} filter="url(#badgeShadow)">
                {/* Badge Background with Player Color */}
                <rect
                  x="0"
                  y="0"
                  width="28"
                  height="24"
                  rx="6"
                  fill={ownerColor.hex}
                  stroke={isSelected ? '#ffffff' : ownerColor.borderHex}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />

                {/* Troop count */}
                <text
                  x="14"
                  y="16"
                  textAnchor="middle"
                  fill={ownerColor.textHex}
                  fontSize="12.5"
                  fontWeight="900"
                  fontFamily="JetBrains Mono, monospace"
                  style={{ pointerEvents: 'none' }}
                >
                  {isHiddenByFog ? '?' : tState.armies}
                </text>

                {/* Fortification icon badge */}
                {tState.fortified && (
                  <g transform="translate(18, -4)">
                    <circle cx="4" cy="4" r="5" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
                    <text x="4" y="6.5" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="bold">⛊</text>
                  </g>
                )}

                {/* Capital icon badge */}
                {tState.isCapital && (
                  <g transform="translate(-4, -4)">
                    <circle cx="4" cy="4" r="5" fill="#eab308" stroke="#ffffff" strokeWidth="1" />
                    <text x="4" y="6.5" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="bold">★</text>
                  </g>
                )}
              </g>

              {/* Card Symbol small indicator */}
              <g transform={`translate(${territoryDef.x - 4}, ${territoryDef.y + 15})`} opacity="0.65">
                {territoryDef.cardSymbol === 'square' && (
                  <rect x="0" y="0" width="7" height="7" fill="#cbd5e1" rx="1" />
                )}
                {territoryDef.cardSymbol === 'circle' && (
                  <circle cx="3.5" cy="3.5" r="3.5" fill="#cbd5e1" />
                )}
                {territoryDef.cardSymbol === 'triangle' && (
                  <polygon points="3.5,0 7,6 0,6" fill="#cbd5e1" />
                )}
              </g>

              {/* Target Reticle Indicator */}
              {isValidTarget && (
                <g transform={`translate(${territoryDef.x}, ${territoryDef.y})`}>
                  <circle r="18" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" className="animate-spin" style={{ animationDuration: '4s' }} />
                </g>
              )}
            </g>
          );
        })}

        {/* Tabela I: Continents Bonus Box (Top-Left) */}
        <g transform="translate(15, 15)">
          <rect width="135" height="100" rx="8" fill="#0f172a" fillOpacity="0.88" stroke="#334155" strokeWidth="1" />
          <text x="67" y="16" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontWeight="800" fontFamily="Cinzel, serif">
            EXÉRCITOS • TABELA I
          </text>
          <line x1="8" y1="21" x2="127" y2="21" stroke="#334155" strokeWidth="0.8" />
          
          <g transform="translate(10, 34)" fontSize="9" fontWeight="700">
            <circle cx="4" cy="0" r="4" fill="#ea580c" />
            <text x="14" y="3" fill="#cbd5e1">América do Norte:</text>
            <text x="110" y="3" fill="#ea580c" fontWeight="800">+5</text>
          </g>
          <g transform="translate(10, 47)" fontSize="9" fontWeight="700">
            <circle cx="4" cy="0" r="4" fill="#16a34a" />
            <text x="14" y="3" fill="#cbd5e1">América do Sul:</text>
            <text x="110" y="3" fill="#16a34a" fontWeight="800">+2</text>
          </g>
          <g transform="translate(10, 60)" fontSize="9" fontWeight="700">
            <circle cx="4" cy="0" r="4" fill="#0284c7" />
            <text x="14" y="3" fill="#cbd5e1">Europa:</text>
            <text x="110" y="3" fill="#0284c7" fontWeight="800">+5</text>
          </g>
          <g transform="translate(10, 73)" fontSize="9" fontWeight="700">
            <circle cx="4" cy="0" r="4" fill="#db2777" />
            <text x="14" y="3" fill="#cbd5e1">África:</text>
            <text x="110" y="3" fill="#db2777" fontWeight="800">+3</text>
          </g>
          <g transform="translate(10, 86)" fontSize="9" fontWeight="700">
            <circle cx="4" cy="0" r="4" fill="#eab308" />
            <text x="14" y="3" fill="#cbd5e1">Ásia:</text>
            <text x="110" y="3" fill="#eab308" fontWeight="800">+7</text>
          </g>
          <g transform="translate(10, 99)" fontSize="9" fontWeight="700">
            <circle cx="4" cy="0" r="4" fill="#b45309" />
            <text x="14" y="3" fill="#cbd5e1">Oceania:</text>
            <text x="110" y="3" fill="#b45309" fontWeight="800">+2</text>
          </g>
        </g>

        {/* Tabela II: Trocas de Cartas (Bottom-Left) */}
        <g transform="translate(15, 615)">
          <rect width="180" height="70" rx="8" fill="#0f172a" fillOpacity="0.88" stroke="#334155" strokeWidth="1" />
          <text x="90" y="16" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="800" fontFamily="Cinzel, serif">
            TABELA II • TROCAS DE CARTAS
          </text>
          <line x1="8" y1="22" x2="172" y2="22" stroke="#334155" strokeWidth="0.8" />
          <text x="10" y="38" fill="#94a3b8" fontSize="8.5">
            1ª: <tspan fill="#38bdf8" fontWeight="bold">+4</tspan> | 2ª: <tspan fill="#38bdf8" fontWeight="bold">+6</tspan> | 3ª: <tspan fill="#38bdf8" fontWeight="bold">+8</tspan> | 4ª: <tspan fill="#38bdf8" fontWeight="bold">+10</tspan>
          </text>
          <text x="10" y="52" fill="#94a3b8" fontSize="8.5">
            5ª: <tspan fill="#38bdf8" fontWeight="bold">+12</tspan> | 6ª: <tspan fill="#38bdf8" fontWeight="bold">+15</tspan> | 7ª: <tspan fill="#38bdf8" fontWeight="bold">+20</tspan> | +5 cada...
          </text>
        </g>

        {/* Logo Title Center Bottom matching Grow board */}
        <g transform="translate(420, 640)">
          <rect x="-30" y="-15" width="200" height="42" rx="6" fill="#09121d" fillOpacity="0.85" stroke="#475569" strokeWidth="1" />
          <text x="70" y="10" textAnchor="middle" fill="#f8fafc" fontSize="24" fontWeight="900" letterSpacing="6" fontFamily="Cinzel, serif" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>
            WAR
          </text>
          <rect x="25" y="15" width="90" height="10" rx="3" fill="#dc2626" />
          <text x="70" y="23" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="bold" letterSpacing="1">
            EDIÇÃO ESPECIAL
          </text>
        </g>
      </svg>
    </div>
  );
};
