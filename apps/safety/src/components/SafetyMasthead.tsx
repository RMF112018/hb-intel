import type { ReactNode } from 'react';
import { HbcTypography } from '@hbc/ui-kit';

export interface SafetyMastheadMetaItem {
  readonly key: string;
  readonly label: ReactNode;
}

export interface SafetyMastheadProps {
  /** Short, UPPERCASE context label (e.g. "Safety · Upload"). Rendered as eyebrow. */
  eyebrow: string;
  /** Page title — the operational voice of the surface. */
  title: string;
  /** One-sentence orientation copy. Optional. */
  description?: ReactNode;
  /** Compact row of status/meta chips (inspector, date, period). Optional. */
  meta?: ReadonlyArray<SafetyMastheadMetaItem>;
  /** Primary/secondary actions rendered on the trailing edge of the title row. */
  actions?: ReactNode;
}

/**
 * SafetyMasthead — product-family voice.
 *
 * Purpose (Phase-3 closure Task B): unify every Safety route with a single
 * authored masthead so the surface reads as one serious product rather than
 * six disjoint screens of ui-kit controls. Intentionally thin — composes
 * HbcTypography; no new visual primitives are invented here.
 */
export function SafetyMasthead({
  eyebrow,
  title,
  description,
  meta,
  actions,
}: SafetyMastheadProps): ReactNode {
  return (
    <header className="safety-masthead" data-safety-ui="masthead">
      <div className="safety-masthead__eyebrow">
        <HbcTypography intent="label">{eyebrow}</HbcTypography>
      </div>
      <div className="safety-masthead__row">
        <HbcTypography intent="heading2" as="h1">
          {title}
        </HbcTypography>
        {actions && <div className="safety-masthead__actions">{actions}</div>}
      </div>
      {description && <HbcTypography intent="body">{description}</HbcTypography>}
      {meta && meta.length > 0 && (
        <div className="safety-masthead__meta">
          {meta.map((m) => (
            <HbcTypography key={m.key} intent="bodySmall">
              {m.label}
            </HbcTypography>
          ))}
        </div>
      )}
    </header>
  );
}
