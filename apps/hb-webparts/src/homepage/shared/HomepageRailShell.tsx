import * as React from 'react';

export interface HomepageRailShellProps {
  label: string;
  children: React.ReactNode;
}

export function HomepageRailShell({ label, children }: HomepageRailShellProps): React.JSX.Element {
  return (
    <div aria-label={label} data-hbc-homepage="rail-shell" role="region">
      {children}
    </div>
  );
}
