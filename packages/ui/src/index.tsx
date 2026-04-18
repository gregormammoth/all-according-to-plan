export type UiShellProps = {
  title: string;
};

export function UiShell({ title }: UiShellProps) {
  return <div data-ui-shell>{title}</div>;
}
