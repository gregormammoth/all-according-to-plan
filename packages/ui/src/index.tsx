export type { ActionEconomyBarProps } from './ActionEconomyBar';
export { ActionEconomyBar } from './ActionEconomyBar';
export type { PlayerHandRailProps } from './PlayerHandRail';
export { PlayerHandRail } from './PlayerHandRail';

export type UiShellProps = {
  title: string;
};

export function UiShell({ title }: UiShellProps) {
  return <div data-ui-shell>{title}</div>;
}
