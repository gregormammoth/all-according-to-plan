import { Controller, Get } from '@nestjs/common';
import { GameStateDto } from './dto/game.dto';

@Controller('game')
export class GameController {
  @Get('snapshot')
  getSnapshot(): GameStateDto {
    return {
      round: 1,
      maxRounds: 25,
      maxPlayerActionsPerRound: 3,
      playerActionsUsed: 0,
      phase: 'player',
      gameSeed: 1337,
      pendingEvent: null,
      pendingChoiceId: null,
      diceResult: null,
      eventStep: 'idle',
      lastOutcomeSummary: null,
      statChangesPreview: null,
      resourceChangesPreview: null,
      reshuffleCount: 0,
      lastDeckAction: null,
      stats: {
        people: { satisfaction: 5, loyalty: 5, fear: 5 },
        elites: { satisfaction: 5, loyalty: 5, fear: 5 },
        security: { satisfaction: 5, loyalty: 5, fear: 5 },
      },
      resources: { money: 10, influence: 5, authority: 5 },
      hand: [],
      deck: [],
      deckDiscard: [],
      playedCardIds: [],
      cardsPlayedThisRound: [],
      activeEventIds: [],
      eventHistory: [],
      lastResolvedEvent: null,
      scheduledEffects: [],
      gameResult: null,
      finalStatsSnapshot: null,
      log: ['api placeholder snapshot'],
    };
  }
}
