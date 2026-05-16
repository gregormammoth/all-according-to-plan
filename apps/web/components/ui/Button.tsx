'use client';

import { btnSizes, btnVariant } from '@/lib/ui/variants';
import { cn } from '@/lib/ui/cn';
import { useButtonHoverSound } from '@/audio/useHoverSound';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: keyof typeof btnSizes;
  active?: boolean;
  hoverSound?: boolean;
};

export function Button({
  variant = 'default',
  size = 'md',
  active = false,
  hoverSound = true,
  className,
  children,
  onPointerEnter,
  onPointerLeave,
  onMouseEnter,
  disabled,
  ...props
}: ButtonProps) {
  const {
    onPointerEnter: hoverPointerEnter,
    onMouseEnter: hoverMouseEnter,
    onPointerLeave: hoverPointerLeave,
  } = useButtonHoverSound();

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        btnVariant(variant, active),
        btnSizes[size],
        !disabled && 'cursor-pointer',
        className
      )}
      onPointerEnter={(e) => {
        if (hoverSound && !disabled) hoverPointerEnter(e);
        onPointerEnter?.(e);
      }}
      onMouseEnter={(e) => {
        if (hoverSound && !disabled) hoverMouseEnter();
        onMouseEnter?.(e);
      }}
      onPointerLeave={(e) => {
        if (hoverSound) hoverPointerLeave();
        onPointerLeave?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
