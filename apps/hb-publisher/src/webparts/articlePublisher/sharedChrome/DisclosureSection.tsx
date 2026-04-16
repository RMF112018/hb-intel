/**
 * Progressive-disclosure wrapper for low-frequency / advanced
 * authoring controls in the Article Publisher panels. Wraps the
 * native `<details>` / `<summary>` element so keyboard semantics,
 * focus ring, and screen-reader announcement come free from the
 * browser — no custom a11y contract required.
 *
 * Starts collapsed by default; callers can pass `defaultOpen` when a
 * seeded draft contains non-default values in the disclosed region so
 * authors never lose sight of values they (or a prior save) set.
 */
import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { PublisherIcon } from './PublisherIcon.js';
import styles from '../article-publisher.module.css';

export interface DisclosureSectionProps {
  readonly label: string;
  readonly summaryHint?: string;
  readonly defaultOpen?: boolean;
  readonly children: React.ReactNode;
  readonly testId?: string;
}

export function DisclosureSection({
  label,
  summaryHint,
  defaultOpen,
  children,
  testId,
}: DisclosureSectionProps): JSX.Element {
  return (
    <details
      className={styles.disclosureSection}
      open={defaultOpen || undefined}
      data-testid={testId}
    >
      <summary className={styles.disclosureSummary}>
        <span className={styles.disclosureLabel}>
          <PublisherIcon
            icon={ChevronRight}
            size="sm"
            tint="inherit"
            className={styles.disclosureChevron}
          />
          {label}
        </span>
        {summaryHint && (
          <span className={styles.disclosureHint}>{summaryHint}</span>
        )}
      </summary>
      <div className={styles.disclosureBody}>{children}</div>
    </details>
  );
}
