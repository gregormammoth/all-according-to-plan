export type GroupKey = 'people' | 'elites' | 'security';

export type GroupStatKey = 'satisfaction' | 'loyalty' | 'fear';

export type GroupStats = Record<GroupStatKey, number>;

export type PlayerStats = Record<GroupKey, GroupStats>;

export type ResourceKey = 'money' | 'influence' | 'authority';

export type Resources = Record<ResourceKey, number>;

export type CardCost = Partial<Resources>;

export type FactionStatBlock = {
  satisfaction: number;
  loyalty: number;
  fear: number;
};

export type CardEffects = Record<GroupKey, FactionStatBlock>;

export type Card = {
  id: string;
  name: string;
  description: string;
  type: string;
  cost: CardCost;
  effects: CardEffects;
  gain?: Partial<Resources>;
  delayedEffects?: CardEffects;
};

export type GameEvent = {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  effects: CardEffects;
  resources?: Partial<Resources>;
  round?: number;
};

export type GamePhase = 'player' | 'game_over';

export type ScheduledEffect = {
  firesAtRound: number;
  effects: CardEffects;
};

export type GameState = {
  round: number;
  maxRounds: number;
  maxPlayerActionsPerRound: number;
  playerActionsUsed: number;
  phase: GamePhase;
  stats: PlayerStats;
  resources: Resources;
  hand: string[];
  deck: string[];
  playedCardIds: string[];
  cardsPlayedThisRound: string[];
  activeEventIds: string[];
  eventHistory: Array<{
    round: number;
    eventId: string;
    title: string;
    description: string;
  }>;
  lastResolvedEvent: {
    round: number;
    eventId: string;
    title: string;
    description: string;
  } | null;
  scheduledEffects: ScheduledEffect[];
  log: string[];
};

export type CardsDocument = {
  cards: Card[];
};
