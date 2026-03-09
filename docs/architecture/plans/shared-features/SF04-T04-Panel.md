# SF04-T04 — `HbcAcknowledgmentPanel`: All Three Modes

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 (bypass/bypassed rows), D-02 (pending sync indicator), D-07 (complexity gating), D-09 (decline blocks all)
**Estimated Effort:** 0.75 sprint-weeks
**Wave:** 3

---

## Objective

Implement `HbcAcknowledgmentPanel` — the full sign-off UI rendered on record detail pages — correctly for all three modes (single, parallel, sequential) with complexity gating and all edge-case visual states.

---

## 3-Line Plan

1. Implement the base panel shell with complexity-gated rendering (D-07): Essential = CTA only, Standard = party list, Expert = full audit trail.
2. Implement mode-specific sub-renderers: `SingleModeContent`, `ParallelModeContent`, `SequentialModeStepper`.
3. Wire `useAcknowledgment` and `useAcknowledgmentGate` into the panel; open `HbcAcknowledgmentModal` on CTA click.

---

## Props Interface

```typescript
interface HbcAcknowledgmentPanelProps<T> {
  item: T;
  config: IAcknowledgmentConfig<T>;
  contextId: string;
  currentUserId: string;
  /** Whether the current user can interact (vs. read-only viewer). */
  canAcknowledge?: boolean;
  /** Override complexity tier for testing/Storybook. Uses useComplexity() if absent. */
  complexityTier?: ComplexityTier;
}
```

---

## Component Structure

```
HbcAcknowledgmentPanel<T>
├── useAcknowledgment()            — state, submit, isSubmitting
├── useAcknowledgmentGate()        — canAcknowledge, isCurrentTurn, party
├── useComplexity()                — tier (D-07)
│
├── [Essential tier]
│   └── EssentialCTA               — "Your acknowledgment is required." + action buttons
│
├── [Standard tier]
│   └── PartyListView              — avatar + name + role + StatusBadge per party
│       └── [canAcknowledge row]   — ActionRow with Acknowledge / Decline buttons
│
└── [Expert tier]
    └── AuditTrailView             — PartyListView + prompt message + IP + all timestamps
        └── BypassedRow indicator  — flagged visually (D-01)

HbcAcknowledgmentModal             — opens on any Acknowledge / Decline CTA click
```

---

## `HbcAcknowledgmentPanel.tsx`

```typescript
import * as React from 'react';
import { useComplexity } from '@hbc/complexity';
import { useAcknowledgment } from '../hooks/useAcknowledgment';
import { useAcknowledgmentGate } from '../hooks/useAcknowledgmentGate';
import { HbcAcknowledgmentModal } from './HbcAcknowledgmentModal';
import { EssentialCTA } from './panel/EssentialCTA';
import { StandardPartyList } from './panel/StandardPartyList';
import { ExpertAuditTrail } from './panel/ExpertAuditTrail';
import type { IAcknowledgmentConfig, ComplexityTier } from '../types';

export function HbcAcknowledgmentPanel<T>({
  item,
  config,
  contextId,
  currentUserId,
  canAcknowledge: canAcknowledgeProp,
  complexityTier: complexityTierProp,
}: HbcAcknowledgmentPanelProps<T>) {
  const { tier: contextTier } = useComplexity();
  const tier: ComplexityTier = complexityTierProp ?? contextTier;

  const { state, isLoading, isSubmitting, submit } = useAcknowledgment(
    config,
    contextId,
    currentUserId
  );
  const gate = useAcknowledgmentGate(config, state, item, currentUserId);
  const canAct = canAcknowledgeProp ?? gate.canAcknowledge;

  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalIntent, setModalIntent] = React.useState<'acknowledge' | 'decline'>(
    'acknowledge'
  );

  const openModal = (intent: 'acknowledge' | 'decline') => {
    setModalIntent(intent);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    setModalOpen(false);
    await submit({ status: 'acknowledged' });
  };

  const handleDecline = async (reason: string, category?: string) => {
    setModalOpen(false);
    await submit({ status: 'declined', declineReason: reason, declineCategory: category });
  };

  if (isLoading) return <PanelSkeleton />;
  if (!state) return null;

  const parties = config.resolveParties(item);
  const promptMessage = gate.party
    ? config.resolvePromptMessage(item, gate.party)
    : '';

  return (
    <div className="hbc-ack-panel" aria-label={config.label}>
      <h3 className="hbc-ack-panel__label">{config.label}</h3>

      {/* Essential: CTA only (D-07) */}
      {tier === 'essential' && (
        <EssentialCTA
          state={state}
          canAct={canAct}
          isSubmitting={isSubmitting}
          onAcknowledge={() => openModal('acknowledge')}
          onDecline={config.allowDecline ? () => openModal('decline') : undefined}
        />
      )}

      {/* Standard: full party list (D-07) */}
      {tier === 'standard' && (
        <StandardPartyList
          config={config}
          state={state}
          parties={parties}
          currentUserId={currentUserId}
          canAct={canAct}
          isCurrentTurn={gate.isCurrentTurn}
          isSubmitting={isSubmitting}
          onAcknowledge={() => openModal('acknowledge')}
          onDecline={config.allowDecline ? () => openModal('decline') : undefined}
        />
      )}

      {/* Expert: full audit trail with timestamps + bypassed flags (D-07, D-01) */}
      {tier === 'expert' && (
        <ExpertAuditTrail
          config={config}
          state={state}
          parties={parties}
          currentUserId={currentUserId}
          canAct={canAct}
          isCurrentTurn={gate.isCurrentTurn}
          isSubmitting={isSubmitting}
          onAcknowledge={() => openModal('acknowledge')}
          onDecline={config.allowDecline ? () => openModal('decline') : undefined}
        />
      )}

      {/* Decline-blocked banner */}
      {state.overallStatus === 'declined' && (
        <DeclineBlockedBanner events={state.events} />
      )}

      {/* Completion banner */}
      {state.isComplete && <CompletionBanner label={config.label} />}

      <HbcAcknowledgmentModal
        isOpen={modalOpen}
        intent={modalIntent}
        promptMessage={promptMessage}
        requireConfirmationPhrase={config.requireConfirmationPhrase}
        confirmationPhrase={config.confirmationPhrase}
        allowDecline={config.allowDecline}
        declineReasons={config.declineReasons}
        onConfirm={handleConfirm}
        onDecline={handleDecline}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
```

---

## Sub-Component: `EssentialCTA`

```typescript
// panel/EssentialCTA.tsx
interface EssentialCTAProps {
  state: IAcknowledgmentState;
  canAct: boolean;
  isSubmitting: boolean;
  onAcknowledge: () => void;
  onDecline?: () => void;
}

export function EssentialCTA({
  state, canAct, isSubmitting, onAcknowledge, onDecline
}: EssentialCTAProps) {
  if (state.isComplete) {
    return (
      <p className="hbc-ack-panel__complete-msg" role="status">
        ✓ Sign-off complete
      </p>
    );
  }

  if (state.overallStatus === 'declined') {
    return (
      <p className="hbc-ack-panel__declined-msg" role="alert">
        ✗ Acknowledgment declined — workflow blocked
      </p>
    );
  }

  if (!canAct) {
    return (
      <p className="hbc-ack-panel__waiting-msg">
        ⏳ Waiting for sign-off
      </p>
    );
  }

  return (
    <div className="hbc-ack-panel__essential-cta">
      <p className="hbc-ack-panel__prompt">Your acknowledgment is required.</p>
      <div className="hbc-ack-panel__actions">
        <button
          onClick={onAcknowledge}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="hbc-btn hbc-btn--primary"
        >
          {isSubmitting ? 'Submitting…' : 'Acknowledge'}
        </button>
        {onDecline && (
          <button
            onClick={onDecline}
            disabled={isSubmitting}
            className="hbc-btn hbc-btn--ghost hbc-btn--danger"
          >
            Decline
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## Sub-Component: `StandardPartyList`

Renders one row per party with avatar, name, role, status badge, and (for the current user when canAct) action buttons.

```typescript
// panel/StandardPartyList.tsx

function PartyRow({
  party, event, isCurrentUser, canAct, isCurrentTurn, isSubmitting,
  mode, onAcknowledge, onDecline
}: PartyRowProps) {
  const isPendingSync = event?.isPendingSync ?? false;
  const status = event?.status ?? 'pending';

  return (
    <li className="hbc-ack-party-row" aria-current={isCurrentTurn ? 'step' : undefined}>
      <Avatar userId={party.userId} displayName={party.displayName} />
      <div className="hbc-ack-party-row__info">
        <span className="hbc-ack-party-row__name">{party.displayName}</span>
        <span className="hbc-ack-party-row__role">{party.role}</span>
      </div>

      <StatusBadge
        status={status}
        isPendingSync={isPendingSync}
        isBypass={event?.isBypass}
      />

      {/* Sequential locked row — not yet their turn */}
      {mode === 'sequential' && !isCurrentTurn && status === 'pending' && (
        <LockIcon aria-label="Waiting for earlier party to acknowledge" />
      )}

      {/* Action row — current user, their turn */}
      {isCurrentUser && canAct && isCurrentTurn && (
        <div className="hbc-ack-party-row__actions">
          <button
            onClick={onAcknowledge}
            disabled={isSubmitting}
            className="hbc-btn hbc-btn--primary hbc-btn--sm"
          >
            Acknowledge
          </button>
          {onDecline && (
            <button
              onClick={onDecline}
              disabled={isSubmitting}
              className="hbc-btn hbc-btn--ghost hbc-btn--danger hbc-btn--sm"
            >
              Decline
            </button>
          )}
        </div>
      )}
    </li>
  );
}
```

---

## Sub-Component: `ExpertAuditTrail`

Extends `StandardPartyList` with:
- Preserved `promptMessage` shown per acknowledged event
- Full ISO timestamp rendered as localised date/time
- IP address shown when present
- Bypassed events flagged with `⚠️ Bypassed by [admin name]` annotation (D-01)
- `isPendingSync` rows show `⏳ Pending sync` in place of timestamp (D-02)

```typescript
// Expert row additions (extending PartyRow)
{tier === 'expert' && event && (
  <div className="hbc-ack-audit-detail">
    {event.isBypass && (
      <span className="hbc-ack-audit-detail__bypass-flag" role="note">
        ⚠️ Bypassed by {event.bypassedBy}
      </span>
    )}
    {event.acknowledgedAt && !event.isPendingSync && (
      <time dateTime={event.acknowledgedAt} className="hbc-ack-audit-detail__time">
        {formatDateTime(event.acknowledgedAt)}
      </time>
    )}
    {event.isPendingSync && (
      <span className="hbc-ack-audit-detail__pending-sync">
        ⏳ Pending sync
      </span>
    )}
    {event.ipAddress && (
      <span className="hbc-ack-audit-detail__ip">IP: {event.ipAddress}</span>
    )}
    {event.promptMessage && (
      <blockquote className="hbc-ack-audit-detail__prompt">
        {event.promptMessage}
      </blockquote>
    )}
  </div>
)}
```

---

## Sequential Stepper Visual Specification

```
┌─ Turnover Meeting Sign-Off ──────────────────────────────────┐
│                                                               │
│  ① ✓  Jane Smith — Project Manager          [Acknowledged]   │
│       2026-03-08 09:14 AM                                    │
│                                                               │
│  ② ▶  Tom Reyes — Superintendent            [Your Turn]      │
│       [Acknowledge]  [Decline]                               │
│                                                               │
│  ③ 🔒  Karen Wu — Chief Estimator           [Waiting]        │
│                                                               │
└───────────────────────────────────────────────────────────────┘

Legend:
  ✓  = acknowledged/bypassed   aria-label="Acknowledged"
  ▶  = current turn            aria-current="step"
  🔒  = not yet their turn     aria-label="Waiting for earlier party"
  ⚠️ = bypassed                 role="note"
```

---

## CSS Classes

```css
.hbc-ack-panel { }
.hbc-ack-panel__label { }
.hbc-ack-panel__complete-msg { color: var(--hbc-color-success); }
.hbc-ack-panel__declined-msg { color: var(--hbc-color-danger); }
.hbc-ack-panel__waiting-msg  { color: var(--hbc-color-neutral-500); }
.hbc-ack-panel__essential-cta { }
.hbc-ack-panel__prompt { }
.hbc-ack-panel__actions { display: flex; gap: var(--hbc-spacing-2); }

.hbc-ack-party-row { display: flex; align-items: center; gap: var(--hbc-spacing-3); }
.hbc-ack-party-row__info { flex: 1; }
.hbc-ack-party-row__name { font-weight: 600; }
.hbc-ack-party-row__role { color: var(--hbc-color-neutral-500); font-size: 0.85em; }
.hbc-ack-party-row__actions { display: flex; gap: var(--hbc-spacing-2); }

.hbc-ack-audit-detail { padding-left: var(--hbc-spacing-8); font-size: 0.85em; }
.hbc-ack-audit-detail__bypass-flag { color: var(--hbc-color-warning); }
.hbc-ack-audit-detail__pending-sync { color: var(--hbc-color-neutral-400); font-style: italic; }
.hbc-ack-audit-detail__ip { color: var(--hbc-color-neutral-400); }
.hbc-ack-audit-detail__prompt { border-left: 3px solid var(--hbc-color-neutral-200); }
```

---

## Verification Commands

```bash
pnpm --filter @hbc/acknowledgment typecheck
pnpm --filter @hbc/acknowledgment test -- --reporter=verbose components/HbcAcknowledgmentPanel
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF04-T04 completed: 2026-03-09
Files created:
  - src/components/panel/EssentialCTA.tsx — Essential tier CTA with complete/declined/waiting/action states
  - src/components/panel/StandardPartyList.tsx — Standard tier party list with inline Avatar, StatusBadge, LockIcon, PartyRow
  - src/components/panel/ExpertAuditTrail.tsx — Expert tier audit trail extending party list with timestamps, IP, bypass flags, pending sync
Files modified:
  - src/components/HbcAcknowledgmentPanel.tsx — Full implementation with complexity-gated rendering, modal integration, DeclineBlockedBanner, CompletionBanner, PanelSkeleton
  - src/components/HbcAcknowledgmentModal.tsx — Updated stub to accept props (Record<string, any>) for T05 forward-compatibility
  - package.json — Added @hbc/complexity dependency
  - tsconfig.json — Added @hbc/complexity path mapping
Adaptations from spec:
  - ComplexityTier imported from @hbc/complexity (not ../types)
  - Avatar, StatusBadge, LockIcon implemented inline (not imported from @hbc/ui-kit)
  - formatDateTime implemented as inline helper
  - HbcAcknowledgmentPanelProps<T> defined locally in component file
  - Config cast to IAcknowledgmentConfig<unknown> for sub-component props compatibility
Verification: check-types ✓, build ✓
Next: SF04-T05 (Badge and Modal)
-->
