'use client';

import { motion } from 'framer-motion';
import { btnSizes, btnVariant } from '@/lib/ui/variants';
import { cn } from '@/lib/ui/cn';
import { useButtonHoverSound } from '@/audio/useHoverSound';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { transitions } from '@/lib/motion/variants';

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
  const { reduced } = useMotionPrefs();
  const {
    onPointerEnter: hoverPointerEnter,
    onMouseEnter: hoverMouseEnter,
    onPointerLeave: hoverPointerLeave,
  } = useButtonHoverSound();

  const {
    onDrag: _d,
    onDragStart: _ds,
    onDragEnd: _de,
    onDragEnter: _den,
    onDragExit: _dex,
    onDragOver: _do,
    onDrop: _dp,
    onAnimationStart: _as,
    ...safeProps
  } = props;

  return (
    <motion.button
      type="button"
      disabled={disabled}
      className={cn(
        btnVariant(variant, active),
        btnSizes[size],
        !disabled && 'cursor-pointer',
        className
      )}
      {...safeProps}
      whileHover={
        reduced || disabled
          ? undefined
          : {
              y: -1,
              boxShadow:
                '0 1px 0 rgba(200, 194, 180, 0.12) inset, 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 12px rgba(154, 130, 88, 0.08)',
            }
      }
      whileTap={reduced || disabled ? undefined : { y: 1, scale: 0.99 }}
      transition={transitions.hover}
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
    >
      {children}
    </motion.button>
  );
}
