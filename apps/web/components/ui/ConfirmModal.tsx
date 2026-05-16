'use client';

import { useEffect, useId, useRef } from 'react';
import { getAudioManager } from '@/audio/AudioManager';
import { useAudioStore } from '@/audio/audioStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/ui/cn';
import { labelMeta } from '@/lib/ui/variants';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'neutral';
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const unlocked = useAudioStore((s) => s.unlocked);
  const muted = useAudioStore((s) => s.settings.muted);

  useEffect(() => {
    if (!open) return;
    if (unlocked && !muted) {
      getAudioManager().play('warning_sting', { volume: 0.32 });
    }
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel, unlocked, muted]);

  if (!open) return null;

  const panelTone =
    tone === 'danger'
      ? 'border-faction-danger/40 shadow-[0_0_40px_rgba(110,69,69,0.15)]'
      : tone === 'warning'
        ? 'border-state-amber/35'
        : 'border-state-steel/60';

  return (
    <div
      className="fixed inset-0 z-[5000] flex animate-fade-in items-center justify-center p-6"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <button type="button" className="modal-backdrop" aria-label="Dismiss" onClick={onCancel} />
      <div className={cn('modal-panel relative z-[1] max-w-md animate-slide-up !p-6', panelTone)}>
        <p className={cn(labelMeta, tone === 'danger' && 'text-faction-danger')}>Emergency directive</p>
        <h2 id={titleId} className="mt-2 font-display text-xl font-bold uppercase tracking-tight text-board-ink">
          {title}
        </h2>
        <p id={descId} className="mt-3 text-sm leading-relaxed text-state-paper-dim">
          {description}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            className="rounded-md border border-state-steel/70 bg-state-graphite px-4 py-2 font-display text-[11px] font-bold uppercase tracking-label text-state-paper-dim transition-all duration-ui hover:text-board-ink"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} size="md" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
