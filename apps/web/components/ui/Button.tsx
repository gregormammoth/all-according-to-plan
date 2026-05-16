'use client';

import { btnSizes, btnVariant } from '@/lib/ui/variants';
import { cn } from '@/lib/ui/cn';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: keyof typeof btnSizes;
  active?: boolean;
};

export function Button({
  variant = 'default',
  size = 'md',
  active = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button type="button" className={cn(btnVariant(variant, active), btnSizes[size], className)} {...props}>
      {children}
    </button>
  );
}
