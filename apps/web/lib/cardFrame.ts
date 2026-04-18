export function cardFrameClass(type: string): string {
  const t = type.toLowerCase();
  const byType: Record<string, string> = {
    economy: 'border-emerald-500 bg-white ring-1 ring-emerald-100',
    propaganda: 'border-violet-500 bg-white ring-1 ring-violet-100',
    intrigue: 'border-amber-500 bg-white ring-1 ring-amber-100',
    crisis: 'border-rose-600 bg-white ring-1 ring-rose-100',
    security: 'border-sky-600 bg-white ring-1 ring-sky-100',
    social: 'border-teal-500 bg-white ring-1 ring-teal-100',
    mega_project: 'border-slate-500 bg-white ring-1 ring-slate-100',
    strategy: 'border-indigo-600 bg-white ring-1 ring-indigo-100',
  };
  return byType[t] ?? 'border-stone-300 bg-white ring-1 ring-stone-100';
}

export function cardTypeBadgeClass(type: string): string {
  const t = type.toLowerCase();
  const byType: Record<string, string> = {
    economy: 'bg-emerald-500 text-white',
    propaganda: 'bg-violet-600 text-white',
    intrigue: 'bg-amber-500 text-stone-900',
    crisis: 'bg-rose-600 text-white',
    security: 'bg-sky-600 text-white',
    social: 'bg-teal-500 text-white',
    mega_project: 'bg-slate-500 text-white',
    strategy: 'bg-indigo-600 text-white',
  };
  return byType[t] ?? 'bg-stone-400 text-white';
}
