import { panelBase } from '@/lib/ui/variants';
import { cn } from '@/lib/ui/cn';

type PanelProps = {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'header';
};

export function Panel({ children, className, as: Tag = 'div' }: PanelProps) {
  return <Tag className={cn(panelBase, 'p-4', className)}>{children}</Tag>;
}
