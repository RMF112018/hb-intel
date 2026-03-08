# SF02-T05 — Components: `HbcBicBadge`, `HbcBicDetail`, `HbcBicBlockedBanner`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-02-Shared-Feature-BIC-Next-Move.md`
**Decisions Applied:** D-04 (null owner), D-05 (complexity tiers + forceVariant), D-08 (transfer history), D-09 (onNavigate callback)
**Estimated Effort:** 1.25 sprint-weeks
**Depends On:** T01, T02, T03, T04

---

## Objective

Implement the three BIC components that render ownership state across the platform. Every component must support all three complexity tiers (Essential / Standard / Expert), the Unassigned warning state (D-04), and the `forceVariant` override prop (D-05).

---

## 3-Line Plan

1. Implement `HbcBicBadge` — compact list-row badge with urgency dot, unassigned state, all three complexity variants.
2. Implement `HbcBicDetail` — full ownership trail with chain, due-date relative display, Expert collapsible history (D-08), blocked banner inline.
3. Implement `HbcBicBlockedBanner` — blocked reason with `onNavigate` router-agnostic link (D-09), three complexity tiers.

---

## Shared Utilities

```typescript
// src/components/_utils.ts

import type { BicUrgencyTier } from '../types/IBicNextMove';

/** Maps urgency tier to CSS class suffix for styling */
export function urgencyClass(tier: BicUrgencyTier, isBlocked: boolean): string {
  if (isBlocked) return 'hbc-bic--blocked';
  switch (tier) {
    case 'immediate': return 'hbc-bic--immediate';
    case 'watch':     return 'hbc-bic--watch';
    case 'upcoming':  return 'hbc-bic--upcoming';
  }
}

/** Returns urgency dot aria-label */
export function urgencyLabel(tier: BicUrgencyTier, isOverdue: boolean, isBlocked: boolean): string {
  if (isBlocked) return 'Blocked';
  if (isOverdue) return 'Overdue';
  switch (tier) {
    case 'immediate': return 'Due today';
    case 'watch':     return 'Due soon';
    case 'upcoming':  return 'Upcoming';
  }
}

/** Formats an ISO 8601 date as a relative string */
export function relativeDate(isoDate: string): string {
  const due = new Date(isoDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Due today';
  if (diffDays === -1) return 'Overdue by 1 day';
  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
  if (diffDays === 1) return 'Due tomorrow';
  return `Due in ${diffDays} days`;
}

/** Truncates text to maxLength characters, appending '…' if truncated */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

/** Reads complexity variant from context or returns forceVariant override */
export function resolveVariant(
  forceVariant: 'essential' | 'standard' | 'expert' | undefined,
  contextVariant: 'essential' | 'standard' | 'expert'
): 'essential' | 'standard' | 'expert' {
  return forceVariant ?? contextVariant;
}
```

---

## `src/components/HbcBicBadge.tsx`

```tsx
import React from 'react';
import { useComplexity } from '@hbc/ui-kit/app-shell'; // SPFx-safe import
import type { IBicNextMoveConfig, IBicNextMoveState, BicComplexityVariant } from '../types/IBicNextMove';
import { resolveFullBicState } from '../hooks/useBicNextMove';
import { urgencyClass, urgencyLabel, truncate, resolveVariant } from './_utils';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface HbcBicBadgeProps<T> {
  item: T;
  config: IBicNextMoveConfig<T>;
  /**
   * Optional override for complexity tier (D-05).
   * Use 'essential' for narrow columns and SPFx contexts.
   * Use 'standard' for My Work Feed rows (regardless of user's global setting).
   * When absent, inherits from @hbc/complexity context.
   */
  forceVariant?: BicComplexityVariant;
  /** Additional CSS class names for the badge wrapper */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Complexity tier rendering matrix (D-05)
//
// Essential: Avatar + name only
// Standard:  Avatar + name + urgency dot
// Expert:    Avatar + name + urgency dot + action text (truncated 40 chars)
// ─────────────────────────────────────────────────────────────────────────────

export function HbcBicBadge<T>({
  item,
  config,
  forceVariant,
  className = '',
}: HbcBicBadgeProps<T>): React.ReactElement {
  const { variant: contextVariant } = useComplexity();
  const variant = resolveVariant(forceVariant, contextVariant);

  // Resolve state synchronously — no additional API calls (spec requirement)
  const state: IBicNextMoveState = resolveFullBicState(item, config);

  // ── D-04: Unassigned state ───────────────────────────────────────────────
  if (state.currentOwner === null) {
    return (
      <span
        className={`hbc-bic-badge hbc-bic-badge--unassigned ${className}`}
        aria-label="Unassigned — this item may be stalled"
      >
        <span className="hbc-bic-badge__icon" aria-hidden="true">⚠️</span>
        <span className="hbc-bic-badge__name">Unassigned</span>
        {variant !== 'essential' && (
          <span className="hbc-bic-badge__dot hbc-bic--immediate" aria-label="Immediate attention required" />
        )}
      </span>
    );
  }

  const { currentOwner, urgencyTier, isOverdue, isBlocked, expectedAction } = state;
  const dotClass = urgencyClass(urgencyTier, isBlocked);
  const dotLabel = urgencyLabel(urgencyTier, isOverdue, isBlocked);

  return (
    <span
      className={`hbc-bic-badge ${dotClass} ${className}`}
      title={buildTooltip(state)}
      role="img"
      aria-label={buildAriaLabel(state)}
    >
      {/* Avatar — always shown in all variants */}
      <span
        className="hbc-bic-badge__avatar"
        aria-hidden="true"
      >
        {currentOwner.displayName.charAt(0).toUpperCase()}
      </span>

      {/* Owner name — always shown in all variants */}
      <span className="hbc-bic-badge__name">{currentOwner.displayName}</span>

      {/* Urgency dot — Standard and Expert only */}
      {variant !== 'essential' && (
        isBlocked ? (
          <span className="hbc-bic-badge__lock" aria-label="Blocked">🔒</span>
        ) : (
          <span className={`hbc-bic-badge__dot ${dotClass}`} aria-label={dotLabel} />
        )
      )}

      {/* Action text — Expert only, truncated to 40 chars */}
      {variant === 'expert' && (
        <span className="hbc-bic-badge__action" aria-hidden="true">
          {truncate(expectedAction, 40)}
        </span>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Accessibility helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildTooltip(state: IBicNextMoveState): string {
  if (state.currentOwner === null) return 'No owner assigned — this item may be stalled';
  const parts = [
    `${state.currentOwner.displayName} (${state.currentOwner.role})`,
    state.expectedAction,
  ];
  if (state.dueDate) parts.push(relativeDate(state.dueDate));
  if (state.isBlocked) parts.push(`Blocked: ${state.blockedReason}`);
  return parts.join(' · ');
}

function buildAriaLabel(state: IBicNextMoveState): string {
  if (state.currentOwner === null) return 'Ball in court: Unassigned';
  return `Ball in court: ${state.currentOwner.displayName}, ${state.expectedAction}`;
}

function relativeDate(isoDate: string): string {
  const due = new Date(isoDate);
  const now = new Date();
  const diffDays = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Overdue';
  if (diffDays === 1) return 'Due tomorrow';
  return `Due in ${diffDays} days`;
}
```

---

## `src/components/HbcBicDetail.tsx`

```tsx
import React, { useState } from 'react';
import { useComplexity } from '@hbc/ui-kit';           // Full ui-kit — PWA/non-SPFx only
import type {
  IBicNextMoveConfig,
  IBicNextMoveState,
  IBicTransfer,
  IBicOwner,
  BicComplexityVariant,
} from '../types/IBicNextMove';
import { resolveFullBicState } from '../hooks/useBicNextMove';
import { relativeDate, resolveVariant } from './_utils';
import { HbcBicBlockedBanner } from './HbcBicBlockedBanner';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface HbcBicDetailProps<T> {
  item: T;
  config: IBicNextMoveConfig<T>;
  /** Whether to show the previous owner + next owner chain (D-08 context) */
  showChain?: boolean;
  /** Complexity override (D-05) */
  forceVariant?: BicComplexityVariant;
  /**
   * Router-agnostic navigation callback for blocked-by cross-module links (D-09).
   * When absent, HbcBicBlockedBanner falls back to plain <a> tag.
   */
  onNavigate?: (href: string) => void;
  /** Optional blocked-by item link shown in HbcBicBlockedBanner */
  blockedByItem?: { label: string; href: string };
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Complexity tier rendering matrix (D-05)
//
// Essential: Current owner + expected action
// Standard:  + due date + HbcBicBlockedBanner if blocked
// Expert:    + previous owner + next owner + escalation owner
//            + collapsible transfer history (D-08, when resolver present)
// ─────────────────────────────────────────────────────────────────────────────

export function HbcBicDetail<T>({
  item,
  config,
  showChain = false,
  forceVariant,
  onNavigate,
  blockedByItem,
  className = '',
}: HbcBicDetailProps<T>): React.ReactElement {
  const { variant: contextVariant } = useComplexity();
  const variant = resolveVariant(forceVariant, contextVariant);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const state: IBicNextMoveState = resolveFullBicState(item, config);

  // ── D-04: Unassigned state ───────────────────────────────────────────────
  if (state.currentOwner === null) {
    return (
      <section className={`hbc-bic-detail hbc-bic-detail--unassigned ${className}`} aria-label="Next Move">
        <div className="hbc-bic-detail__unassigned-callout" role="alert">
          <span className="hbc-bic-detail__unassigned-icon" aria-hidden="true">⚠️</span>
          <div>
            <strong>This item has no current owner.</strong>
            <p>Assign one to keep it moving.</p>
          </div>
        </div>
      </section>
    );
  }

  const {
    currentOwner,
    expectedAction,
    dueDate,
    isOverdue,
    isBlocked,
    blockedReason,
    previousOwner,
    nextOwner,
    escalationOwner,
    transferHistory,
  } = state;

  return (
    <section className={`hbc-bic-detail ${className}`} aria-label="Next Move">

      {/* ── Current Owner (all variants) ───────────────────────────────── */}
      <div className="hbc-bic-detail__current">
        <OwnerChip owner={currentOwner} label="Current owner" size="large" />
        <p className="hbc-bic-detail__action">{expectedAction}</p>
      </div>

      {/* ── Due Date (Standard + Expert) ──────────────────────────────── */}
      {variant !== 'essential' && dueDate && (
        <p
          className={`hbc-bic-detail__due ${isOverdue ? 'hbc-bic-detail__due--overdue' : ''}`}
          aria-label={`Due date: ${relativeDate(dueDate)}`}
        >
          {relativeDate(dueDate)}
        </p>
      )}

      {/* ── Blocked Banner (Standard + Expert) ────────────────────────── */}
      {variant !== 'essential' && isBlocked && blockedReason && (
        <HbcBicBlockedBanner
          blockedReason={blockedReason}
          blockedByItem={blockedByItem}
          onNavigate={onNavigate}
          forceVariant={variant}
        />
      )}

      {/* ── Ownership Chain (Expert + showChain) ──────────────────────── */}
      {(variant === 'expert' || showChain) && (
        <div className="hbc-bic-detail__chain" aria-label="Ownership chain">
          {previousOwner && (
            <ChainNode owner={previousOwner} label="Previous owner" direction="from" />
          )}
          <ChainNode owner={currentOwner} label="Current owner" direction="current" />
          {nextOwner && (
            <ChainNode owner={nextOwner} label="Next owner" direction="to" />
          )}
        </div>
      )}

      {/* ── Escalation Owner (Expert only) ────────────────────────────── */}
      {variant === 'expert' && escalationOwner && dueDate && (
        <p className="hbc-bic-detail__escalation">
          Escalates to{' '}
          <strong>{escalationOwner.displayName}</strong>{' '}
          ({escalationOwner.role}) if not actioned by{' '}
          <time dateTime={dueDate}>{new Date(dueDate).toLocaleDateString()}</time>
        </p>
      )}

      {/* ── Transfer History (Expert + D-08 resolver present) ─────────── */}
      {variant === 'expert' && transferHistory.length > 0 && (
        <div className="hbc-bic-detail__history">
          <button
            className="hbc-bic-detail__history-toggle"
            aria-expanded={historyExpanded}
            onClick={() => setHistoryExpanded((v) => !v)}
          >
            {historyExpanded ? 'Hide' : 'Show'} full ownership history
            ({transferHistory.length} transfer{transferHistory.length === 1 ? '' : 's'})
          </button>
          {historyExpanded && (
            <ol className="hbc-bic-detail__history-list" aria-label="Transfer history">
              {transferHistory.map((transfer, index) => (
                <TransferRow key={index} transfer={transfer} />
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface OwnerChipProps {
  owner: IBicOwner;
  label: string;
  size?: 'small' | 'large';
}

function OwnerChip({ owner, label, size = 'small' }: OwnerChipProps): React.ReactElement {
  return (
    <div className={`hbc-bic-owner-chip hbc-bic-owner-chip--${size}`} aria-label={`${label}: ${owner.displayName}`}>
      <span className="hbc-bic-owner-chip__avatar" aria-hidden="true">
        {owner.displayName.charAt(0).toUpperCase()}
      </span>
      <div className="hbc-bic-owner-chip__text">
        <span className="hbc-bic-owner-chip__name">{owner.displayName}</span>
        <span className="hbc-bic-owner-chip__role">{owner.role}</span>
        {owner.groupContext && (
          <span className="hbc-bic-owner-chip__group">{owner.groupContext}</span>
        )}
      </div>
    </div>
  );
}

interface ChainNodeProps {
  owner: IBicOwner;
  label: string;
  direction: 'from' | 'current' | 'to';
}

function ChainNode({ owner, label, direction }: ChainNodeProps): React.ReactElement {
  return (
    <div className={`hbc-bic-chain-node hbc-bic-chain-node--${direction}`}>
      <span className="hbc-bic-chain-node__label">{label}</span>
      <OwnerChip owner={owner} label={label} />
      {direction !== 'to' && (
        <span className="hbc-bic-chain-node__arrow" aria-hidden="true">→</span>
      )}
    </div>
  );
}

interface TransferRowProps {
  transfer: IBicTransfer;
}

function TransferRow({ transfer }: TransferRowProps): React.ReactElement {
  return (
    <li className="hbc-bic-transfer-row">
      <time dateTime={transfer.transferredAt} className="hbc-bic-transfer-row__time">
        {new Date(transfer.transferredAt).toLocaleDateString()}
      </time>
      {transfer.fromOwner ? (
        <span>{transfer.fromOwner.displayName} → {transfer.toOwner.displayName}</span>
      ) : (
        <span>Assigned to {transfer.toOwner.displayName}</span>
      )}
      <span className="hbc-bic-transfer-row__action">{transfer.action}</span>
    </li>
  );
}

// Import IBicTransfer here for use in TransferRow
import type { IBicTransfer } from '../types/IBicNextMove';
```

---

## `src/components/HbcBicBlockedBanner.tsx`

```tsx
import React, { useEffect } from 'react';
import type { BicComplexityVariant } from '../types/IBicNextMove';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface HbcBicBlockedBannerProps {
  blockedReason: string;
  /**
   * Link to the blocking item if cross-module (D-09).
   * Rendered via onNavigate callback (SPA) or plain <a> fallback.
   */
  blockedByItem?: { label: string; href: string };
  /**
   * Router-agnostic navigation handler (D-09).
   * Pass router.navigate in PWA contexts.
   * Omit in SPFx contexts — plain <a> fallback applies.
   * A dev-mode warning is emitted if absent and blockedByItem.href is a relative path.
   */
  onNavigate?: (href: string) => void;
  /** Complexity override (D-05) */
  forceVariant?: BicComplexityVariant;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Complexity tier rendering matrix (D-05)
//
// Essential: Reason text only
// Standard:  Reason text + blocked-by link (via onNavigate / <a>)
// Expert:    Reason text + blocked-by link + escalation path note
// ─────────────────────────────────────────────────────────────────────────────

export function HbcBicBlockedBanner({
  blockedReason,
  blockedByItem,
  onNavigate,
  forceVariant,
  className = '',
}: HbcBicBlockedBannerProps): React.ReactElement {
  // D-09: Dev-mode warning when onNavigate is absent and href is relative
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && blockedByItem && !onNavigate) {
      const isRelative = blockedByItem.href.startsWith('/');
      if (isRelative) {
        console.warn(
          '[bic-next-move] HbcBicBlockedBanner: onNavigate is not provided but blockedByItem.href ' +
          `("${blockedByItem.href}") appears to be a relative PWA route. ` +
          'Falling back to <a> tag which will cause a full page reload in SPA context. ' +
          'Pass onNavigate={(href) => router.navigate({ to: href })} from your PWA context.'
        );
      }
    }
  }, [blockedByItem, onNavigate]);

  // Resolve variant — banner inherits forceVariant when passed from HbcBicDetail
  const variant = forceVariant ?? 'standard';

  return (
    <div
      className={`hbc-bic-blocked-banner ${className}`}
      role="alert"
      aria-live="polite"
      aria-label="Item is blocked"
    >
      <span className="hbc-bic-blocked-banner__icon" aria-hidden="true">🔒</span>

      <div className="hbc-bic-blocked-banner__content">
        {/* Reason — all variants */}
        <p className="hbc-bic-blocked-banner__reason">{blockedReason}</p>

        {/* Blocked-by link — Standard and Expert only (D-05) */}
        {variant !== 'essential' && blockedByItem && (
          <BlockedByLink
            item={blockedByItem}
            onNavigate={onNavigate}
          />
        )}

        {/* Escalation note — Expert only (D-05) */}
        {variant === 'expert' && (
          <p className="hbc-bic-blocked-banner__escalation-note">
            This item cannot advance until the blocking condition is resolved.
            If unresolved, it will escalate to the assigned escalation owner.
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Blocked-by link sub-component (D-09)
// ─────────────────────────────────────────────────────────────────────────────

interface BlockedByLinkProps {
  item: { label: string; href: string };
  onNavigate?: (href: string) => void;
}

function BlockedByLink({ item, onNavigate }: BlockedByLinkProps): React.ReactElement {
  if (onNavigate) {
    // SPA navigation — no page reload (D-09)
    return (
      <button
        className="hbc-bic-blocked-banner__link hbc-bic-blocked-banner__link--spa"
        onClick={() => onNavigate(item.href)}
        type="button"
      >
        View blocking item: {item.label}
      </button>
    );
  }

  // Plain anchor fallback — SPFx and non-SPA contexts (D-09)
  return (
    <a
      className="hbc-bic-blocked-banner__link hbc-bic-blocked-banner__link--anchor"
      href={item.href}
    >
      View blocking item: {item.label}
    </a>
  );
}
```

---

## `src/components/index.ts`

```typescript
export { HbcBicBadge } from './HbcBicBadge';
export type { HbcBicBadgeProps } from './HbcBicBadge';

export { HbcBicDetail } from './HbcBicDetail';
export type { HbcBicDetailProps } from './HbcBicDetail';

export { HbcBicBlockedBanner } from './HbcBicBlockedBanner';
export type { HbcBicBlockedBannerProps } from './HbcBicBlockedBanner';
```

---

## SPFx Import Rules Summary

| Component | Import Source | Reason |
|---|---|---|
| `HbcBicBadge` | `@hbc/ui-kit/app-shell` | Must stay within SPFx bundle budget; `useComplexity` from app-shell only |
| `HbcBicDetail` | `@hbc/ui-kit` (full) | Rich layout components; PWA/non-constrained contexts only |
| `HbcBicBlockedBanner` | No ui-kit import | Self-contained; works in both SPFx and PWA |

When rendering `HbcBicBadge` in an SPFx narrow column, always apply `forceVariant="essential"`:

```tsx
// SPFx webpart — narrow column context
<HbcBicBadge
  item={permit}
  config={permitBicConfig}
  forceVariant="essential"   // D-05 — pins to essential regardless of user setting
/>
```

---

## Verification Commands

```bash
# 1. Typecheck
pnpm --filter @hbc/bic-next-move typecheck

# 2. Run component unit tests (written in T07)
pnpm --filter @hbc/bic-next-move test -- HbcBicBadge
pnpm --filter @hbc/bic-next-move test -- HbcBicDetail
pnpm --filter @hbc/bic-next-move test -- HbcBicBlockedBanner

# 3. Confirm all three components are exported from package root
node -e "
  import('@hbc/bic-next-move').then(m => {
    console.log('HbcBicBadge:', typeof m.HbcBicBadge);
    console.log('HbcBicDetail:', typeof m.HbcBicDetail);
    console.log('HbcBicBlockedBanner:', typeof m.HbcBicBlockedBanner);
  });
"

# 4. Storybook smoke test (verify stories load without errors)
pnpm --filter @hbc/bic-next-move storybook --ci
```
