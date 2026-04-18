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
  stats!: PlayerStatsDto;
  resources!: ResourcesDto;
  hand!: string[];
  deck!: string[];
  playedCardIds!: string[];
  cardsPlayedThisRound!: string[];
  activeEventIds!: string[];
  eventHistory!: EventHistoryEntryDto[];
  lastResolvedEvent!: LastResolvedEventDto | null;
  scheduledEffects!: Array<{ firesAtRound: number; effects: unknown }>;
  log!: string[];
}
