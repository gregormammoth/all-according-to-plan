export function cardFrameClass(type: string): string {
  const t = type.toLowerCase();
  const byType: Record<string, string> = {
    asset: 'border-emerald-600 bg-white ring-1 ring-emerald-100',
    event: 'border-indigo-600 bg-white ring-1 ring-indigo-100',
  };
  return byType[t] ?? 'border-stone-300 bg-white ring-1 ring-stone-100';
}

export function cardTypeBadgeClass(type: string): string {
  const t = type.toLowerCase();
  const byType: Record<string, string> = {
    asset: 'bg-emerald-600 text-white',
    event: 'bg-indigo-600 text-white',
  };
  return byType[t] ?? 'bg-stone-400 text-white';
}
