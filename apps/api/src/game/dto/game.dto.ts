export class GroupStatsDto {
  satisfaction!: number;
  loyalty!: number;
  fear!: number;
}

export class PlayerStatsDto {
  people!: GroupStatsDto;
  elites!: GroupStatsDto;
  security!: GroupStatsDto;
}

export class ResourcesDto {
  money!: number;
  influence!: number;
  authority!: number;
}

export class CardCostDto {
  money?: number;
  influence?: number;
  authority?: number;
}

export class EventHistoryEntryDto {
  round!: number;
  eventId!: string;
  title!: string;
  description!: string;
  outcomeLabel?: string;
}

export class LastResolvedEventDto {
  round!: number;
  eventId!: string;
  title!: string;
  description!: string;
}

export class GameStateDto {
  round!: number;
  maxRounds!: number;
  maxPlayerActionsPerRound!: number;
  playerActionsUsed!: number;
  phase!: string;
  gameSeed!: number;
  pendingEvent!: Record<string, unknown> | null;
  pendingChoiceId!: string | null;
  diceResult!: Record<string, unknown> | null;
  eventStep!: string;
  lastOutcomeSummary!: string | null;
  statChangesPreview!: Record<string, unknown> | null;
  resourceChangesPreview!: Record<string, unknown> | null;
  reshuffleCount!: number;
  lastDeckAction!: 'draw' | 'reshuffle' | null;
  stats!: PlayerStatsDto;
  resources!: ResourcesDto;
  hand!: string[];
  deck!: string[];
  deckDiscard!: string[];
  playedCardIds!: string[];
  cardsPlayedThisRound!: string[];
  activeEventIds!: string[];
  eventHistory!: EventHistoryEntryDto[];
  lastResolvedEvent!: LastResolvedEventDto | null;
  scheduledEffects!: Array<{ firesAtRound: number; effects: unknown }>;
  gameResult!: Record<string, unknown> | null;
  finalStatsSnapshot!: Record<string, unknown> | null;
  log!: string[];
}
