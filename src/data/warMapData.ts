import { ContinentDef, ContinentId, PlayerColor, PlayerColorInfo, TerritoryDef } from '../types/war';

export const CONTINENTS: Record<ContinentId, ContinentDef> = {
  north_america: {
    id: 'north_america',
    name: 'América do Norte',
    bonus: 5,
    color: '#ea580c', // Laranja vibrante clássico
    borderColor: '#c2410c',
    territoryIds: [
      'alasca',
      'mackenzie',
      'groenlandia',
      'vancouver',
      'ottawa',
      'labrador',
      'california',
      'nova_york',
      'mexico'
    ]
  },
  south_america: {
    id: 'south_america',
    name: 'América do Sul',
    bonus: 2,
    color: '#16a34a', // Verde esmeralda clássico
    borderColor: '#15803d',
    territoryIds: [
      'venezuela',
      'peru',
      'brasil',
      'argentina'
    ]
  },
  europe: {
    id: 'europe',
    name: 'Europa',
    bonus: 5,
    color: '#0284c7', // Azul celeste clássico
    borderColor: '#0369a1',
    territoryIds: [
      'islandia',
      'inglaterra',
      'franca',
      'alemanha',
      'polonia',
      'suecia',
      'moscou'
    ]
  },
  africa: {
    id: 'africa',
    name: 'África',
    bonus: 3,
    color: '#db2777', // Rosa magenta clássico
    borderColor: '#be185d',
    territoryIds: [
      'argelia',
      'egito',
      'sudao',
      'congo',
      'africa_do_sul',
      'madagascar'
    ]
  },
  asia: {
    id: 'asia',
    name: 'Ásia',
    bonus: 7,
    color: '#eab308', // Amarelo dourado clássico
    borderColor: '#ca8a04',
    territoryIds: [
      'oriente_medio',
      'aral',
      'omsk',
      'dudinka',
      'siberia',
      'tchita',
      'vladivostok',
      'mongolia',
      'china',
      'india',
      'vietna',
      'japao'
    ]
  },
  oceania: {
    id: 'oceania',
    name: 'Oceania',
    bonus: 2,
    color: '#b45309', // Marrom avermelhado / terracota
    borderColor: '#92400e',
    territoryIds: [
      'sumatra',
      'borneu',
      'nova_guine',
      'australia'
    ]
  }
};

export const TERRITORIES: Record<string, TerritoryDef> = {
  // AMÉRICA DO NORTE (9)
  alasca: {
    id: 'alasca',
    name: 'Alasca',
    continent: 'north_america',
    neighbors: ['mackenzie', 'vancouver', 'vladivostok'],
    x: 82,
    y: 135,
    cardSymbol: 'triangle'
  },
  mackenzie: {
    id: 'mackenzie',
    name: 'Mackenzie',
    continent: 'north_america',
    neighbors: ['alasca', 'vancouver', 'ottawa', 'groenlandia'],
    x: 185,
    y: 140,
    cardSymbol: 'circle'
  },
  groenlandia: {
    id: 'groenlandia',
    name: 'Groenlândia',
    continent: 'north_america',
    neighbors: ['mackenzie', 'labrador', 'islandia'],
    x: 355,
    y: 110,
    cardSymbol: 'square'
  },
  vancouver: {
    id: 'vancouver',
    name: 'Vancouver',
    continent: 'north_america',
    neighbors: ['alasca', 'mackenzie', 'ottawa', 'california'],
    x: 165,
    y: 220,
    cardSymbol: 'triangle'
  },
  ottawa: {
    id: 'ottawa',
    name: 'Ottawa',
    continent: 'north_america',
    neighbors: ['mackenzie', 'vancouver', 'labrador', 'california', 'nova_york'],
    x: 245,
    y: 225,
    cardSymbol: 'circle'
  },
  labrador: {
    id: 'labrador',
    name: 'Labrador',
    continent: 'north_america',
    neighbors: ['groenlandia', 'ottawa', 'nova_york'],
    x: 315,
    y: 215,
    cardSymbol: 'square'
  },
  california: {
    id: 'california',
    name: 'Califórnia',
    continent: 'north_america',
    neighbors: ['vancouver', 'ottawa', 'nova_york', 'mexico'],
    x: 160,
    y: 310,
    cardSymbol: 'square'
  },
  nova_york: {
    id: 'nova_york',
    name: 'Nova York',
    continent: 'north_america',
    neighbors: ['ottawa', 'labrador', 'california', 'mexico'],
    x: 250,
    y: 315,
    cardSymbol: 'circle'
  },
  mexico: {
    id: 'mexico',
    name: 'México',
    continent: 'north_america',
    neighbors: ['california', 'nova_york', 'venezuela'],
    x: 205,
    y: 410,
    cardSymbol: 'triangle'
  },

  // AMÉRICA DO SUL (4)
  venezuela: {
    id: 'venezuela',
    name: 'Venezuela',
    continent: 'south_america',
    neighbors: ['mexico', 'peru', 'brasil'],
    x: 280,
    y: 465,
    cardSymbol: 'triangle'
  },
  peru: {
    id: 'peru',
    name: 'Peru',
    continent: 'south_america',
    neighbors: ['venezuela', 'brasil', 'argentina'],
    x: 285,
    y: 560,
    cardSymbol: 'square'
  },
  brasil: {
    id: 'brasil',
    name: 'Brasil',
    continent: 'south_america',
    neighbors: ['venezuela', 'peru', 'argentina', 'argelia'],
    x: 365,
    y: 535,
    cardSymbol: 'circle'
  },
  argentina: {
    id: 'argentina',
    name: 'Argentina',
    continent: 'south_america',
    neighbors: ['peru', 'brasil'],
    x: 305,
    y: 650,
    cardSymbol: 'square'
  },

  // EUROPA (7)
  islandia: {
    id: 'islandia',
    name: 'Islândia',
    continent: 'europe',
    neighbors: ['groenlandia', 'inglaterra'],
    x: 435,
    y: 175,
    cardSymbol: 'circle'
  },
  inglaterra: {
    id: 'inglaterra',
    name: 'Inglaterra',
    continent: 'europe',
    neighbors: ['islandia', 'franca', 'alemanha'],
    x: 448,
    y: 255,
    cardSymbol: 'triangle'
  },
  franca: {
    id: 'franca',
    name: 'França',
    continent: 'europe',
    neighbors: ['inglaterra', 'alemanha', 'argelia'],
    x: 475,
    y: 320,
    cardSymbol: 'square'
  },
  alemanha: {
    id: 'alemanha',
    name: 'Alemanha',
    continent: 'europe',
    neighbors: ['inglaterra', 'franca', 'polonia'],
    x: 520,
    y: 275,
    cardSymbol: 'circle'
  },
  polonia: {
    id: 'polonia',
    name: 'Polônia',
    continent: 'europe',
    neighbors: ['alemanha', 'suecia', 'moscou', 'oriente_medio', 'egito'],
    x: 575,
    y: 280,
    cardSymbol: 'triangle'
  },
  suecia: {
    id: 'suecia',
    name: 'Suécia',
    continent: 'europe',
    neighbors: ['inglaterra', 'polonia', 'moscou'],
    x: 540,
    y: 175,
    cardSymbol: 'square'
  },
  moscou: {
    id: 'moscou',
    name: 'Moscou',
    continent: 'europe',
    neighbors: ['suecia', 'polonia', 'oriente_medio', 'aral', 'omsk'],
    x: 620,
    y: 235,
    cardSymbol: 'circle'
  },

  // ÁFRICA (6)
  argelia: {
    id: 'argelia',
    name: 'Argélia',
    continent: 'africa',
    neighbors: ['brasil', 'franca', 'egito', 'sudao', 'congo'],
    x: 475,
    y: 435,
    cardSymbol: 'triangle'
  },
  egito: {
    id: 'egito',
    name: 'Egito',
    continent: 'africa',
    neighbors: ['argelia', 'sudao', 'oriente_medio', 'polonia'],
    x: 555,
    y: 405,
    cardSymbol: 'circle'
  },
  sudao: {
    id: 'sudao',
    name: 'Sudão',
    continent: 'africa',
    neighbors: ['argelia', 'egito', 'congo', 'africa_do_sul', 'madagascar'],
    x: 575,
    y: 485,
    cardSymbol: 'square'
  },
  congo: {
    id: 'congo',
    name: 'Congo',
    continent: 'africa',
    neighbors: ['argelia', 'sudao', 'africa_do_sul'],
    x: 540,
    y: 545,
    cardSymbol: 'triangle'
  },
  africa_do_sul: {
    id: 'africa_do_sul',
    name: 'África do Sul',
    continent: 'africa',
    neighbors: ['congo', 'sudao', 'madagascar'],
    x: 560,
    y: 635,
    cardSymbol: 'circle'
  },
  madagascar: {
    id: 'madagascar',
    name: 'Madagascar',
    continent: 'africa',
    neighbors: ['africa_do_sul', 'sudao'],
    x: 638,
    y: 610,
    cardSymbol: 'square'
  },

  // ÁSIA (12)
  oriente_medio: {
    id: 'oriente_medio',
    name: 'Oriente Médio',
    continent: 'asia',
    neighbors: ['moscou', 'polonia', 'egito', 'aral', 'india'],
    x: 630,
    y: 370,
    cardSymbol: 'square'
  },
  aral: {
    id: 'aral',
    name: 'Aral',
    continent: 'asia',
    neighbors: ['moscou', 'oriente_medio', 'omsk', 'china', 'india'],
    x: 690,
    y: 295,
    cardSymbol: 'circle'
  },
  omsk: {
    id: 'omsk',
    name: 'Omsk',
    continent: 'asia',
    neighbors: ['moscou', 'aral', 'dudinka', 'tchita', 'mongolia', 'china'],
    x: 700,
    y: 215,
    cardSymbol: 'triangle'
  },
  dudinka: {
    id: 'dudinka',
    name: 'Dudinka',
    continent: 'asia',
    neighbors: ['omsk', 'tchita', 'siberia'],
    x: 750,
    y: 170,
    cardSymbol: 'square'
  },
  siberia: {
    id: 'siberia',
    name: 'Sibéria',
    continent: 'asia',
    neighbors: ['dudinka', 'tchita', 'vladivostok'],
    x: 825,
    y: 155,
    cardSymbol: 'circle'
  },
  tchita: {
    id: 'tchita',
    name: 'Tchita',
    continent: 'asia',
    neighbors: ['dudinka', 'omsk', 'siberia', 'vladivostok', 'mongolia', 'china'],
    x: 790,
    y: 250,
    cardSymbol: 'triangle'
  },
  vladivostok: {
    id: 'vladivostok',
    name: 'Vladivostok',
    continent: 'asia',
    neighbors: ['siberia', 'tchita', 'alasca', 'japao', 'china'],
    x: 890,
    y: 220,
    cardSymbol: 'square'
  },
  mongolia: {
    id: 'mongolia',
    name: 'Mongólia',
    continent: 'asia',
    neighbors: ['omsk', 'tchita', 'china', 'japao'],
    x: 815,
    y: 310,
    cardSymbol: 'circle'
  },
  china: {
    id: 'china',
    name: 'China',
    continent: 'asia',
    neighbors: ['aral', 'omsk', 'tchita', 'mongolia', 'japao', 'india', 'vietna', 'vladivostok'],
    x: 795,
    y: 375,
    cardSymbol: 'square'
  },
  india: {
    id: 'india',
    name: 'Índia',
    continent: 'asia',
    neighbors: ['oriente_medio', 'aral', 'china', 'vietna', 'sumatra'],
    x: 730,
    y: 430,
    cardSymbol: 'triangle'
  },
  vietna: {
    id: 'vietna',
    name: 'Vietnã',
    continent: 'asia',
    neighbors: ['china', 'india', 'borneu'],
    x: 805,
    y: 460,
    cardSymbol: 'circle'
  },
  japao: {
    id: 'japao',
    name: 'Japão',
    continent: 'asia',
    neighbors: ['vladivostok', 'mongolia', 'china'],
    x: 915,
    y: 360,
    cardSymbol: 'triangle'
  },

  // OCEANIA (4)
  sumatra: {
    id: 'sumatra',
    name: 'Sumatra',
    continent: 'oceania',
    neighbors: ['india', 'australia'],
    x: 785,
    y: 575,
    cardSymbol: 'square'
  },
  borneu: {
    id: 'borneu',
    name: 'Bornéu',
    continent: 'oceania',
    neighbors: ['vietna', 'australia', 'nova_guine'],
    x: 855,
    y: 545,
    cardSymbol: 'triangle'
  },
  nova_guine: {
    id: 'nova_guine',
    name: 'Nova Guiné',
    continent: 'oceania',
    neighbors: ['borneu', 'australia'],
    x: 935,
    y: 550,
    cardSymbol: 'circle'
  },
  australia: {
    id: 'australia',
    name: 'Austrália',
    continent: 'oceania',
    neighbors: ['sumatra', 'borneu', 'nova_guine'],
    x: 885,
    y: 645,
    cardSymbol: 'square'
  }
};

export const SEA_ROUTES: Array<{ from: string; to: string; curveOffset?: number; style?: 'dashed' | 'dotted' }> = [
  // Alasca <-> Vladivostok (Pacific connection wrap)
  { from: 'alasca', to: 'vladivostok', curveOffset: -50, style: 'dashed' },
  // Groenlândia <-> Islândia (Atlantic route)
  { from: 'groenlandia', to: 'islandia', curveOffset: 20, style: 'dashed' },
  // México <-> Venezuela (Central America / Caribbean)
  { from: 'mexico', to: 'venezuela', curveOffset: 15, style: 'dashed' },
  // Brasil <-> Argélia (South Atlantic route)
  { from: 'brasil', to: 'argelia', curveOffset: -30, style: 'dashed' },
  // França <-> Argélia (Mediterranean Sea)
  { from: 'franca', to: 'argelia', curveOffset: 10, style: 'dashed' },
  // Egito <-> Polônia (Mediterranean / Balkans route)
  { from: 'egito', to: 'polonia', curveOffset: 15, style: 'dashed' },
  // Inglaterra <-> Islândia
  { from: 'inglaterra', to: 'islandia', curveOffset: 0, style: 'dashed' },
  // Inglaterra <-> França (English channel)
  { from: 'inglaterra', to: 'franca', curveOffset: 0, style: 'dashed' },
  // Inglaterra <-> Alemanha (North Sea)
  { from: 'inglaterra', to: 'alemanha', curveOffset: 0, style: 'dashed' },
  // Inglaterra <-> Suécia (North Sea / Scandinavia)
  { from: 'inglaterra', to: 'suecia', curveOffset: -10, style: 'dashed' },
  // Madagascar <-> Sudão
  { from: 'madagascar', to: 'sudao', curveOffset: 20, style: 'dashed' },
  // Madagascar <-> África do Sul
  { from: 'madagascar', to: 'africa_do_sul', curveOffset: 10, style: 'dashed' },
  // Índia <-> Sumatra (Indian ocean route)
  { from: 'india', to: 'sumatra', curveOffset: 15, style: 'dashed' },
  // Vietnã <-> Bornéu (South China Sea)
  { from: 'vietna', to: 'borneu', curveOffset: 15, style: 'dashed' },
  // Japão <-> Vladivostok (Sea of Japan)
  { from: 'japao', to: 'vladivostok', curveOffset: 10, style: 'dashed' },
  // Japão <-> China
  { from: 'japao', to: 'china', curveOffset: 10, style: 'dashed' },
  // Japão <-> Mongólia
  { from: 'japao', to: 'mongolia', curveOffset: -10, style: 'dashed' },
  // Bornéu <-> Nova Guiné
  { from: 'borneu', to: 'nova_guine', curveOffset: 5, style: 'dashed' },
  // Bornéu <-> Austrália
  { from: 'borneu', to: 'australia', curveOffset: 10, style: 'dashed' },
  // Sumatra <-> Austrália
  { from: 'sumatra', to: 'australia', curveOffset: 20, style: 'dashed' },
  // Nova Guiné <-> Austrália
  { from: 'nova_guine', to: 'australia', curveOffset: 10, style: 'dashed' },
];

export const PLAYER_COLORS: Record<PlayerColor, PlayerColorInfo> = {
  red: {
    id: 'red',
    name: 'Vermelho',
    hex: '#ef4444',
    accentHex: '#b91c1c',
    borderHex: '#f87171',
    badgeHex: '#dc2626',
    textHex: '#ffffff'
  },
  blue: {
    id: 'blue',
    name: 'Azul',
    hex: '#3b82f6',
    accentHex: '#1d4ed8',
    borderHex: '#60a5fa',
    badgeHex: '#2563eb',
    textHex: '#ffffff'
  },
  green: {
    id: 'green',
    name: 'Verde',
    hex: '#22c55e',
    accentHex: '#15803d',
    borderHex: '#4ade80',
    badgeHex: '#16a34a',
    textHex: '#ffffff'
  },
  yellow: {
    id: 'yellow',
    name: 'Amarelo',
    hex: '#eab308',
    accentHex: '#a16207',
    borderHex: '#fde047',
    badgeHex: '#ca8a04',
    textHex: '#0f172a'
  },
  white: {
    id: 'white',
    name: 'Branco',
    hex: '#f1f5f9',
    accentHex: '#94a3b8',
    borderHex: '#ffffff',
    badgeHex: '#e2e8f0',
    textHex: '#0f172a'
  },
  black: {
    id: 'black',
    name: 'Preto',
    hex: '#1e293b',
    accentHex: '#020617',
    borderHex: '#475569',
    badgeHex: '#0f172a',
    textHex: '#ffffff'
  }
};

export const CARD_TRADE_TABLE = [4, 6, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50];
