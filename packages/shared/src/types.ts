export type GroupKey = 'people' | 'elites' | 'security';

export type GroupStatKey = 'satisfaction' | 'loyalty' | 'fear';

export type GroupStats = Record<GroupStatKey, number>;

export type PlayerStats = Record<GroupKey, GroupStats>;
export type FactionStats = PlayerStats;

export type ResourceType = 'money' | 'influence' | 'authority';

export type ResourceKey = ResourceType;

export type Resources = Record<ResourceKey, number>;

export type ActionType = 'playCard' | 'drawCard' | 'gainResource';

export type DeckState = {
  cards: string[];
};

export type HandState = {
  cards: string[];
  maxSize: number;
};

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
  type: 'asset' | 'event';
  archetype?: string;
  cost: CardCost;
  immediateEffects?: CardEffects;
  passiveEffects?: CardEffects[];
  gain?: Partial<Resources>;
  delayedEffects?: CardEffects[];
};

export type GameEvent = {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  effects: CardEffects;
  resources?: Partial<Resources>;
  round?: number;
  condition?: string;
  outcomePreview?: {
    success: string;
    failure: string;
  };
  choices?: EventChoice[];
};

export type Outcome = {
  statDeltas: Partial<Record<GroupKey, Partial<GroupStats>>>;
  resourceDeltas: Partial<Resources>;
};

export type EventChoice = {
  id: string;
  text: string;
  cost?: Partial<Resources>;
  probability?: {
    success: number;
    partial: number;
    failure: number;
  };
  outcomes: {
    success: Outcome;
    partial: Outcome;
    failure: Outcome;
  };
};

export type DiceResult = {
  roll: number;
  threshold: {
    success: number;
    partial: number;
  };
  outcomeType: 'success' | 'partial_success' | 'failure';
};

export type EventStep = 'idle' | 'choice' | 'rolling' | 'revealed' | 'applied';

export type GamePhase = 'player' | 'event_modal' | 'game_over';

export type ScheduledEffect = {
  firesAtRound: number;
  effects: CardEffects;
};

export type GameResult = {
  type: 'victory' | 'survival' | 'failure';
  score: number;
  summaryText: string;
};

export type FinalStatsSnapshot = {
  stats: FactionStats;
  resources: Resources;
  totalCardsPlayed: number;
  totalEvents: number;
};

export type GameState = {
  round: number;
  maxRounds: number;
  maxPlayerActionsPerRound: number;
  playerActionsUsed: number;
  phase: GamePhase;
  gameSeed: number;
  pendingEvent: GameEvent | null;
  pendingChoiceId: string | null;
  diceResult: DiceResult | null;
  eventStep: EventStep;
  lastOutcomeSummary: string | null;
  statChangesPreview: Outcome['statDeltas'] | null;
  resourceChangesPreview: Outcome['resourceDeltas'] | null;
  reshuffleCount: number;
  lastDeckAction: 'draw' | 'reshuffle' | null;
  stats: PlayerStats;
  resources: Resources;
  hand: string[];
  deck: string[];
  deckDiscard: string[];
  activeAssets: string[];
  playedCardIds: string[];
  cardsPlayedThisRound: string[];
  activeEventIds: string[];
  eventHistory: Array<{
    round: number;
    eventId: string;
    title: string;
    description: string;
    outcomeLabel?: string;
  }>;
  lastResolvedEvent: {
    round: number;
    eventId: string;
    title: string;
    description: string;
  } | null;
  scheduledEffects: ScheduledEffect[];
  gameResult: GameResult | null;
  finalStatsSnapshot: FinalStatsSnapshot | null;
  log: string[];
};

export type CardsDocument = {
  cards: Card[];
};
