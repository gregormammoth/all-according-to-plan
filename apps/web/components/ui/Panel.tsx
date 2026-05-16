import { panelBase } from '@/lib/ui/variants';
import { cn } from '@/lib/ui/cn';

type PanelProps = {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'header';
  bleed?: boolean;
};

export function Panel({ children, className, as: Tag = 'div', bleed = false }: PanelProps) {
  return (
    <Tag className={cn(panelBase, 'p-4', bleed && 'overflow-visible', className)}>{children}</Tag>
  );
}
