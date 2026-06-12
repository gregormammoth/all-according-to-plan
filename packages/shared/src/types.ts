export type GroupKey = 'people' | 'elites' | 'security';

export type GroupStatKey = 'satisfaction' | 'loyalty' | 'fear';

export type GroupStats = Record<GroupStatKey, number>;

export type PlayerStats = Record<GroupKey, GroupStats>;
export type FactionStats = PlayerStats;

export type ResourceType = 'money' | 'influence' | 'authority';

export type ResourceKey = ResourceType;

export type Resources = Record<ResourceKey, number>;

export type ActionType = 'playCard' | 'drawCard' | 'gainResource' | 'resolveCrisis';

export type EffectsBundle = {
  statDeltas?: Partial<Record<GroupKey, Partial<GroupStats>>>;
  resourceDeltas?: Partial<Resources>;
  legitimacyDelta?: number;
  controlDelta?: number;
  removeCrisis?: boolean;
};

export type CrisisSeverity = 'minor' | 'major';

export type CrisisTestAttribute = 'legitimacy' | 'control';

export type CrisisDefinition = {
  id: string;
  name: string;
  description: string;
  severity: CrisisSeverity;
  ongoingEffects?: EffectsBundle;
  escalationEffects?: EffectsBundle;
  resolution?: {
    actionCost: number;
    resourceCost?: Partial<Resources>;
    test?: {
      attribute: CrisisTestAttribute;
      difficulty: number;
    };
  };
  successEffects?: EffectsBundle;
  failureEffects?: EffectsBundle;
};

export type ActiveCrisis = {
  crisisId: string;
  doom: number;
  createdRound: number;
};

export type CrisesDocument = {
  crises: CrisisDefinition[];
};

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

export type RegimeDelta = {
  legitimacyDelta?: number;
  controlDelta?: number;
};

export type EffectBlock = CardEffects & RegimeDelta;

export type Card = {
  id: string;
  name: string;
  description: string;
  type: 'asset' | 'event';
  archetype?: string;
  cost: CardCost;
  immediateEffects?: EffectBlock;
  passiveEffects?: EffectBlock[];
  gain?: Partial<Resources>;
  delayedEffects?: EffectBlock[];
  legitimacyDelta?: number;
  controlDelta?: number;
};

export type RegimeTracks = {
  legitimacy: number;
  control: number;
};

export type GameEvent = {
  id: string;
  type?: 'normal' | 'election';
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
  legitimacyDelta?: number;
  controlDelta?: number;
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
  legitimacyDelta?: number;
  controlDelta?: number;
};

export type RegimeCollapseCause = 'legitimacy' | 'control' | 'factions';

export type GameResult = {
  type: 'victory' | 'survival' | 'failure';
  score: number;
  summaryText: string;
  collapseCause?: RegimeCollapseCause;
};

export type FinalStatsSnapshot = {
  stats: FactionStats;
  resources: Resources;
  totalCardsPlayed: number;
  totalEvents: number;
  finalLegitimacy: number;
  finalControl: number;
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
  regimeChangesPreview: RegimeDelta | null;
  reshuffleCount: number;
  lastDeckAction: 'draw' | 'reshuffle' | null;
  stats: PlayerStats;
  resources: Resources;
  legitimacy: number;
  control: number;
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
  activeCrises: ActiveCrisis[];
  gameResult: GameResult | null;
  finalStatsSnapshot: FinalStatsSnapshot | null;
  log: string[];
};

export type CardsDocument = {
  cards: Card[];
};
