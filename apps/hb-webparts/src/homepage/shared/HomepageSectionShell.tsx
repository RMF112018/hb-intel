/**
 * HomepageSectionShell — Local homepage section wrapper
 *
 * Delegates to HbcHomepageSectionShell from @hbc/ui-kit/homepage for
 * structure and accessibility, adding local zone-level composition
 * styling (padding, border-radius, spacing rhythm).
 */
import * as React from 'react';
import { HbcHomepageSectionShell } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_RADIUS, HP_BORDER } from '../tokens.js';

export interface HomepageSectionShellProps {
  title: string;
  subtitle?: string;
  /** Optional trailing action in the section header */
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

const sectionStyle: React.CSSProperties = {
  padding: HP_SPACE['2xl'],
  borderRadius: HP_RADIUS.card,
  border: HP_BORDER.subtle,
};

export function HomepageSectionShell({
  title,
  subtitle,
  headerAction,
  children,
}: HomepageSectionShellProps): React.JSX.Element {
  return (
    <HbcHomepageSectionShell
      title={title}
      subtitle={subtitle}
      headerAction={headerAction}
      className={undefined}
    >
      <div style={sectionStyle}>{children}</div>
    </HbcHomepageSectionShell>
  );
}
