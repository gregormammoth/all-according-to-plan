'use client';

import { useEffect, useRef } from 'react';
import { calculateStabilityIndex } from '@all-according-to-plan/shared';
import { getAudioManager } from './AudioManager';
import { computeAtmosphereFromStats } from './types';
import { useAudioStore } from './audioStore';
import { useGameStore } from '@/state/gameStore';
import { useAudio } from './useAudio';

function countConsecutiveFailures(
  history: { outcomeLabel?: string }[]
): number {
  let count = 0;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const label = history[i].outcomeLabel?.toLowerCase() ?? '';
    if (label.includes('failure')) count += 1;
    else break;
  }
  return count;
}

export function useGameAudio(): void {
  const { play, unlocked } = useAudio();
  const state = useGameStore((s) => s.state);
  const eventModalOpen = useGameStore((s) => s.eventModal.isOpen);
  const event = useGameStore((s) => s.eventModal.event);

  const crisisModalOpen = useGameStore((s) => s.crisisModal.isOpen);

  const prevStep = useRef(state.eventStep);
  const prevCrisisStep = useRef(state.crisisStep);
  const prevModalOpen = useRef(eventModalOpen);
  const prevCrisisModalOpen = useRef(crisisModalOpen);
  const prevActions = useRef(state.playerActionsUsed);
  useEffect(() => {
    if (!unlocked || state.phase === 'game_over') return;
    void getAudioManager().startGameplayBed();
  }, [unlocked, state.phase]);

  useEffect(() => {
    if (!unlocked || state.phase === 'game_over') return;

    const stability = calculateStabilityIndex(state.stats);
    const profile = computeAtmosphereFromStats(
      state.stats,
      stability,
      state.round,
      state.phase,
      countConsecutiveFailures(state.eventHistory)
    );

    getAudioManager().updateAtmosphere(profile);
  }, [unlocked, state.stats, state.round, state.phase, state.eventHistory]);

  useEffect(() => {
    if (!unlocked || state.phase === 'game_over') return;

    if (
      state.playerActionsUsed >= state.maxPlayerActionsPerRound &&
      prevActions.current < state.maxPlayerActionsPerRound &&
      state.phase === 'player'
    ) {
      play('end_turn');
    }
    prevActions.current = state.playerActionsUsed;
  }, [
    unlocked,
    play,
    state.playerActionsUsed,
    state.maxPlayerActionsPerRound,
    state.phase,
  ]);

  useEffect(() => {
    if (!unlocked || state.phase === 'game_over') return;

    if (eventModalOpen && !prevModalOpen.current) {
      const election = event?.type === 'election';
      play('modal_open');
      play(election ? 'election_sting' : 'event_sting');
    }
    prevModalOpen.current = eventModalOpen;
  }, [unlocked, play, eventModalOpen, event?.type, state.phase]);

  useEffect(() => {
    if (!unlocked || state.phase === 'game_over') return;
    if (crisisModalOpen && !prevCrisisModalOpen.current) {
      play('modal_open');
      play('event_sting');
    }
    prevCrisisModalOpen.current = crisisModalOpen;
  }, [unlocked, play, crisisModalOpen, state.phase]);

  useEffect(() => {
    if (!unlocked || state.phase === 'game_over') return;
    if (state.eventStep === 'rolling' && prevStep.current !== 'rolling') {
      play('dice_roll');
    }
    if (state.crisisStep === 'rolling' && prevCrisisStep.current !== 'rolling') {
      play('dice_roll');
    }
    if (state.eventStep === 'revealed' && prevStep.current !== 'revealed' && state.diceResult) {
      if (state.diceResult.outcomeType === 'success') play('success_reveal');
      else if (state.diceResult.outcomeType === 'partial_success') play('partial_reveal');
      else play('failure_reveal');
    }
    if (state.crisisStep === 'revealed' && prevCrisisStep.current !== 'revealed' && state.crisisDiceResult) {
      if (state.crisisDiceResult.success) play('success_reveal');
      else play('failure_reveal');
    }
    prevStep.current = state.eventStep;
    prevCrisisStep.current = state.crisisStep;
  }, [unlocked, play, state.eventStep, state.crisisStep, state.diceResult, state.crisisDiceResult, state.phase]);
}
