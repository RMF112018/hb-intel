import * as React from 'react';

export interface HomepageSectionShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function HomepageSectionShell({ title, subtitle, children }: HomepageSectionShellProps): React.JSX.Element {
  return (
    <section aria-label={title} data-hbc-homepage="section-shell">
      <header>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}
