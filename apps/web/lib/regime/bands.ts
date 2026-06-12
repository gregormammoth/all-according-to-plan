export type RegimeBand = {
  label: string;
  badgeClass: string;
  barClass: string;
};

export function legitimacyBand(value: number): RegimeBand {
  if (value >= 70) {
    return {
      label: 'Stable',
      badgeClass: 'border-faction-people/40 bg-faction-people/10 text-faction-people',
      barClass: 'bg-faction-people',
    };
  }
  if (value >= 40) {
    return {
      label: 'Questioned',
      badgeClass: 'border-state-amber/40 bg-state-amber/10 text-state-amber',
      barClass: 'bg-state-amber',
    };
  }
  if (value >= 15) {
    return {
      label: 'Crisis',
      badgeClass: 'border-faction-danger/30 bg-faction-danger/10 text-faction-danger',
      barClass: 'bg-faction-danger/80',
    };
  }
  return {
    label: 'Collapse Risk',
    badgeClass: 'border-faction-danger/50 bg-faction-danger/20 text-faction-danger',
    barClass: 'bg-faction-danger',
  };
}

export function controlBand(value: number): RegimeBand {
  if (value >= 70) {
    return {
      label: 'Strong',
      badgeClass: 'border-faction-security/40 bg-faction-security/10 text-faction-security',
      barClass: 'bg-faction-security',
    };
  }
  if (value >= 40) {
    return {
      label: 'Weakening',
      badgeClass: 'border-state-amber/40 bg-state-amber/10 text-state-amber',
      barClass: 'bg-state-amber',
    };
  }
  if (value >= 15) {
    return {
      label: 'Fragile',
      badgeClass: 'border-faction-danger/30 bg-faction-danger/10 text-faction-danger',
      barClass: 'bg-faction-danger/80',
    };
  }
  return {
    label: 'Near Breakdown',
    badgeClass: 'border-faction-danger/50 bg-faction-danger/20 text-faction-danger',
    barClass: 'bg-faction-danger',
  };
}
