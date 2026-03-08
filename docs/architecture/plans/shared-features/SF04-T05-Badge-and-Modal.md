# SF04-T05 — `HbcAcknowledgmentBadge` + `HbcAcknowledgmentModal`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-03 (confirmation phrase), D-04 (decline reasons), D-07 (badge complexity floor), D-09 (declined badge state)
**Estimated Effort:** 0.5 sprint-weeks
**Wave:** 3

---

## Objective

Implement the two supporting components: `HbcAcknowledgmentBadge` (compact list-row status indicator with complexity-driven information density) and `HbcAcknowledgmentModal` (confirmation dialog handling phrase input, decline reason collection, and cancel).

---

## 3-Line Plan

1. Implement `HbcAcknowledgmentBadge` with Standard as the floor tier (D-07): count + icon always shown; Expert adds hover tooltip of pending party names.
2. Implement `HbcAcknowledgmentModal` with confirmation phrase input (D-03) and configurable decline reason UI (D-04: radio buttons when `declineReasons` supplied, free-text otherwise).
3. Verify all badge states and modal submission/validation paths with unit tests.

---

## `HbcAcknowledgmentBadge`

### Props

```typescript
interface HbcAcknowledgmentBadgeProps<T> {
  item: T;
  config: IAcknowledgmentConfig<T>;
  contextId: string;
  /** Override complexity tier for testing/Storybook. Uses useComplexity() if absent. */
  complexityTier?: ComplexityTier;
}
```

### Complexity Behaviour (D-07)

| Tier | Rendered |
|---|---|
| `essential` | Same as Standard (floor = Standard per D-07) |
| `standard` | Icon + "N of M acknowledged" count |
| `expert` | Standard content + hover tooltip listing pending party names |

### Visual States

| `overallStatus` | Icon | Label | Colour |
|---|---|---|---|
| `pending` | ⏳ | "0 of N acknowledged" | neutral |
| `partial` | ⏳ | "X of N acknowledged" | warning |
| `acknowledged` | ✓ | "Complete" | success |
| `declined` | ✗ | "Declined" | danger |
| `bypassed` (any) | ✓⚠ | "Complete (with bypass)" | warning |

### Implementation

```typescript
// components/HbcAcknowledgmentBadge.tsx
import * as React from 'react';
import { useComplexity } from '@hbc/complexity';
import { useAcknowledgment } from '../hooks/useAcknowledgment';
import type { IAcknowledgmentConfig, IAcknowledgmentState, ComplexityTier } from '../types';

export function HbcAcknowledgmentBadge<T>({
  item,
  config,
  contextId,
  complexityTier: complexityTierProp,
}: HbcAcknowledgmentBadgeProps<T>) {
  const { tier: contextTier } = useComplexity();
  // D-07: floor = standard — Essential renders same as Standard
  const effectiveTier: ComplexityTier =
    complexityTierProp === 'essential' || contextTier === 'essential'
      ? 'standard'
      : (complexityTierProp ?? contextTier);

  // Badge fetches its own state (lightweight — badge may appear in list rows
  // without a parent panel mounted). staleTime and refetchInterval apply (D-05).
  const { state } = useAcknowledgment(config, contextId, '' /* no current user needed for badge */);

  if (!state) return <BadgeSkeleton />;

  const parties = config.resolveParties(item);
  const required = parties.filter((p) => p.required);
  const acknowledged = state.events.filter(
    (e) => e.status === 'acknowledged' || e.status === 'bypassed'
  );
  const pending = required.filter(
    (p) => !state.events.find(
      (e) => e.partyUserId === p.userId &&
        (e.status === 'acknowledged' || e.status === 'bypassed')
    )
  );
  const hasBypass = state.events.some((e) => e.isBypass);

  const { icon, label, colorClass } = resolveBadgeDisplay(
    state.overallStatus,
    acknowledged.length,
    required.length,
    hasBypass
  );

  const badgeEl = (
    <span
      className={`hbc-ack-badge hbc-ack-badge--${colorClass}`}
      aria-label={label}
    >
      <span className="hbc-ack-badge__icon" aria-hidden="true">{icon}</span>
      <span className="hbc-ack-badge__label">{label}</span>
    </span>
  );

  // Expert: wrap in tooltip showing pending party names (D-07)
  if (effectiveTier === 'expert' && pending.length > 0) {
    const tooltipContent = `Pending: ${pending.map((p) => p.displayName).join(', ')}`;
    return (
      <Tooltip content={tooltipContent}>
        {badgeEl}
      </Tooltip>
    );
  }

  return badgeEl;
}

function resolveBadgeDisplay(
  overallStatus: IAcknowledgmentState['overallStatus'],
  acknowledgedCount: number,
  requiredCount: number,
  hasBypass: boolean
): { icon: string; label: string; colorClass: string } {
  if (overallStatus === 'declined') {
    return { icon: '✗', label: 'Declined', colorClass: 'danger' };
  }
  if (overallStatus === 'acknowledged') {
    return hasBypass
      ? { icon: '✓', label: 'Complete (with bypass)', colorClass: 'warning' }
      : { icon: '✓', label: 'Complete', colorClass: 'success' };
  }
  return {
    icon: '⏳',
    label: `${acknowledgedCount} of ${requiredCount} acknowledged`,
    colorClass: acknowledgedCount > 0 ? 'warning' : 'neutral',
  };
}
```

---

## `HbcAcknowledgmentModal`

### Props

```typescript
interface HbcAcknowledgmentModalProps {
  isOpen: boolean;
  intent: 'acknowledge' | 'decline';
  promptMessage: string;
  requireConfirmationPhrase?: boolean;
  /** Defaults to "I CONFIRM" (D-03). */
  confirmationPhrase?: string;
  allowDecline?: boolean;
  /** Optional predefined decline categories (D-04). */
  declineReasons?: string[];
  onConfirm: () => void;
  onDecline: (reason: string, category?: string) => void;
  onCancel: () => void;
}
```

### Modal: Acknowledge Path (D-03)

```typescript
// Inside HbcAcknowledgmentModal — acknowledge intent branch
function AcknowledgeContent({
  promptMessage,
  requireConfirmationPhrase,
  confirmationPhrase,
  onConfirm,
  onCancel,
}: AcknowledgeContentProps) {
  const phrase = confirmationPhrase ?? DEFAULT_CONFIRMATION_PHRASE; // "I CONFIRM"
  const [inputValue, setInputValue] = React.useState('');
  const phraseMatch = inputValue.trim() === phrase;
  const canSubmit = !requireConfirmationPhrase || phraseMatch;

  return (
    <>
      <p className="hbc-modal__prompt">{promptMessage}</p>

      {requireConfirmationPhrase && (
        <div className="hbc-modal__phrase-input">
          <label htmlFor="ack-phrase">
            Type <strong>{phrase}</strong> to proceed
          </label>
          <input
            id="ack-phrase"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            aria-invalid={inputValue.length > 0 && !phraseMatch}
            aria-describedby="ack-phrase-hint"
            autoComplete="off"
          />
          {inputValue.length > 0 && !phraseMatch && (
            <span id="ack-phrase-hint" className="hbc-modal__phrase-hint" role="alert">
              Phrase does not match
            </span>
          )}
        </div>
      )}

      <div className="hbc-modal__actions">
        <button
          onClick={onConfirm}
          disabled={!canSubmit}
          className="hbc-btn hbc-btn--primary"
        >
          Confirm
        </button>
        <button onClick={onCancel} className="hbc-btn hbc-btn--ghost">
          Cancel
        </button>
      </div>
    </>
  );
}
```

### Modal: Decline Path (D-04)

```typescript
// Inside HbcAcknowledgmentModal — decline intent branch
function DeclineContent({
  declineReasons,
  onDecline,
  onCancel,
}: DeclineContentProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [freeText, setFreeText] = React.useState('');

  const hasCategories = declineReasons && declineReasons.length > 0;
  const isOther = selectedCategory === 'Other' || !hasCategories;

  // When categories provided: require a selection; free-text required only for "Other"
  // When no categories: free-text required (min 10 chars) — D-04
  const canSubmit = hasCategories
    ? selectedCategory !== '' &&
      (!isOther || freeText.trim().length >= DECLINE_REASON_MIN_LENGTH)
    : freeText.trim().length >= DECLINE_REASON_MIN_LENGTH;

  const handleSubmit = () => {
    const category = hasCategories ? selectedCategory : undefined;
    const reason = freeText.trim() || selectedCategory;
    onDecline(reason, category);
  };

  return (
    <>
      <p className="hbc-modal__decline-heading">
        Please provide a reason for declining.
      </p>

      {/* Category radio list (D-04: declineReasons[] provided) */}
      {hasCategories && (
        <fieldset className="hbc-modal__decline-categories">
          <legend className="sr-only">Decline reason</legend>
          {[...declineReasons!, 'Other'].map((reason) => (
            <label key={reason} className="hbc-modal__decline-radio">
              <input
                type="radio"
                name="decline-reason"
                value={reason}
                checked={selectedCategory === reason}
                onChange={() => setSelectedCategory(reason)}
              />
              {reason}
            </label>
          ))}
        </fieldset>
      )}

      {/* Free-text: always shown when no categories; shown for "Other" */}
      {(!hasCategories || isOther) && (
        <div className="hbc-modal__decline-freetext">
          <label htmlFor="decline-text">
            {hasCategories ? 'Please elaborate' : 'Reason'}
            {!hasCategories && (
              <span className="hbc-modal__min-hint">
                {' '}(minimum {DECLINE_REASON_MIN_LENGTH} characters)
              </span>
            )}
          </label>
          <textarea
            id="decline-text"
            rows={4}
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            aria-describedby="decline-char-count"
          />
          <span id="decline-char-count" className="hbc-modal__char-count">
            {freeText.trim().length} / {DECLINE_REASON_MIN_LENGTH} min
          </span>
        </div>
      )}

      <div className="hbc-modal__actions">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="hbc-btn hbc-btn--danger"
        >
          Confirm Decline
        </button>
        <button onClick={onCancel} className="hbc-btn hbc-btn--ghost">
          Cancel
        </button>
      </div>
    </>
  );
}
```

### Full Modal Shell

```typescript
export function HbcAcknowledgmentModal({
  isOpen, intent, promptMessage,
  requireConfirmationPhrase, confirmationPhrase,
  allowDecline, declineReasons,
  onConfirm, onDecline, onCancel,
}: HbcAcknowledgmentModalProps) {
  if (!isOpen) return null;

  return (
    <dialog
      open
      className="hbc-modal"
      aria-modal="true"
      aria-labelledby="ack-modal-title"
      onKeyDown={(e) => e.key === 'Escape' && onCancel()}
    >
      <div className="hbc-modal__content">
        <h2 id="ack-modal-title" className="hbc-modal__title">
          {intent === 'acknowledge' ? 'Confirm Acknowledgment' : 'Decline Sign-Off'}
        </h2>

        {intent === 'acknowledge' ? (
          <AcknowledgeContent
            promptMessage={promptMessage}
            requireConfirmationPhrase={requireConfirmationPhrase}
            confirmationPhrase={confirmationPhrase}
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        ) : (
          <DeclineContent
            declineReasons={declineReasons}
            onDecline={onDecline}
            onCancel={onCancel}
          />
        )}
      </div>
    </dialog>
  );
}
```

---

## Unit Tests (Representative)

```typescript
// components/__tests__/HbcAcknowledgmentModal.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcAcknowledgmentModal } from '../HbcAcknowledgmentModal';

const baseProps = {
  isOpen: true,
  intent: 'acknowledge' as const,
  promptMessage: 'Please confirm you have reviewed this document.',
  onConfirm: vi.fn(),
  onDecline: vi.fn(),
  onCancel: vi.fn(),
};

describe('HbcAcknowledgmentModal — acknowledge path', () => {
  it('renders prompt message', () => {
    render(<HbcAcknowledgmentModal {...baseProps} />);
    expect(screen.getByText(baseProps.promptMessage)).toBeInTheDocument();
  });

  it('confirm button enabled when no phrase required', () => {
    render(<HbcAcknowledgmentModal {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Confirm' })).not.toBeDisabled();
  });

  it('confirm button disabled until correct phrase typed (D-03)', async () => {
    const user = userEvent.setup();
    render(
      <HbcAcknowledgmentModal
        {...baseProps}
        requireConfirmationPhrase
        confirmationPhrase="I CONFIRM"
      />
    );
    const btn = screen.getByRole('button', { name: 'Confirm' });
    expect(btn).toBeDisabled();
    await user.type(screen.getByLabelText(/I CONFIRM/i), 'I CONFIRM');
    expect(btn).not.toBeDisabled();
  });

  it('shows mismatch hint for wrong phrase (D-03)', async () => {
    const user = userEvent.setup();
    render(
      <HbcAcknowledgmentModal {...baseProps} requireConfirmationPhrase />
    );
    await user.type(screen.getByLabelText(/I CONFIRM/i), 'wrong');
    expect(screen.getByRole('alert')).toHaveTextContent('Phrase does not match');
  });
});

describe('HbcAcknowledgmentModal — decline path', () => {
  const declineProps = { ...baseProps, intent: 'decline' as const };

  it('free-text decline requires 10 chars (D-04)', async () => {
    const user = userEvent.setup();
    render(<HbcAcknowledgmentModal {...declineProps} />);
    const btn = screen.getByRole('button', { name: 'Confirm Decline' });
    await user.type(screen.getByLabelText('Reason'), 'short');
    expect(btn).toBeDisabled();
    await user.type(screen.getByLabelText('Reason'), ' enough now');
    expect(btn).not.toBeDisabled();
  });

  it('renders radio buttons when declineReasons provided (D-04)', () => {
    render(
      <HbcAcknowledgmentModal
        {...declineProps}
        declineReasons={['Incomplete', 'Incorrect parties', 'Other']}
      />
    );
    expect(screen.getAllByRole('radio')).toHaveLength(4); // 3 + "Other" appended
  });

  it('shows free-text when "Other" selected (D-04)', async () => {
    const user = userEvent.setup();
    render(
      <HbcAcknowledgmentModal
        {...declineProps}
        declineReasons={['Incomplete', 'Other']}
      />
    );
    await user.click(screen.getByLabelText('Other'));
    expect(screen.getByLabelText('Please elaborate')).toBeInTheDocument();
  });
});

describe('HbcAcknowledgmentBadge complexity floor (D-07)', () => {
  it('renders count at Essential tier (floor = Standard)', () => {
    // Verify badge shows "0 of 2 acknowledged" even at Essential tier
  });

  it('renders tooltip at Expert tier with pending names', () => {
    // Verify tooltip content matches pending party displayNames
  });
});
```

---

## CSS Classes

```css
.hbc-ack-badge { display: inline-flex; align-items: center; gap: 4px; }
.hbc-ack-badge--success { color: var(--hbc-color-success); }
.hbc-ack-badge--warning { color: var(--hbc-color-warning); }
.hbc-ack-badge--danger  { color: var(--hbc-color-danger);  }
.hbc-ack-badge--neutral { color: var(--hbc-color-neutral-500); }

.hbc-modal { border: none; border-radius: var(--hbc-radius-lg); padding: var(--hbc-spacing-6); }
.hbc-modal__content { max-width: 480px; }
.hbc-modal__title { margin-bottom: var(--hbc-spacing-4); }
.hbc-modal__prompt { margin-bottom: var(--hbc-spacing-4); }
.hbc-modal__phrase-input { display: flex; flex-direction: column; gap: var(--hbc-spacing-2); }
.hbc-modal__phrase-hint { color: var(--hbc-color-danger); font-size: 0.85em; }
.hbc-modal__decline-categories { border: none; padding: 0; }
.hbc-modal__decline-radio { display: flex; align-items: center; gap: var(--hbc-spacing-2); }
.hbc-modal__decline-freetext { display: flex; flex-direction: column; gap: var(--hbc-spacing-2); }
.hbc-modal__char-count { font-size: 0.8em; color: var(--hbc-color-neutral-400); }
.hbc-modal__min-hint { font-size: 0.85em; color: var(--hbc-color-neutral-400); }
.hbc-modal__actions { display: flex; gap: var(--hbc-spacing-3); margin-top: var(--hbc-spacing-6); }
```

---

## Verification Commands

```bash
pnpm --filter @hbc/acknowledgment typecheck
pnpm --filter @hbc/acknowledgment test -- --reporter=verbose components/HbcAcknowledgmentBadge
pnpm --filter @hbc/acknowledgment test -- --reporter=verbose components/HbcAcknowledgmentModal
```
