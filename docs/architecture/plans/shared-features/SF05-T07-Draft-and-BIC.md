# SF05-T07 — Draft Persistence + BIC Integration

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-02 (monotonic merge), D-04 (step-level BIC, actionable only), D-05 (visitedStepIds persist), D-07 (onAllCompleteFired persist)
**Estimated Effort:** 0.5 sprint-weeks
**Wave:** 2

---

## Objective

Specify the complete `@hbc/session-state` draft persistence contract for step wizard state, and the step-level BIC lifecycle integration with `@hbc/bic-next-move` — including the `step-wizard:*` wildcard prefix amendment required in SF02.

---

## 3-Line Plan

1. Define the draft store read/write contract, merge-on-restore flow, and stale-state detection used by `useStepWizard` and `useStepProgress`.
2. Specify the step-level BIC lifecycle (create on unlock, close on complete) and the `step-wizard:*` wildcard amendment to SF02-T02/T03.
3. Document the cross-package dependency and provide the exact amendment text for the SF02 plan files.

---

## Draft Persistence Contract

### Storage Key Pattern

```
@hbc/session-state namespace: 'step-wizard'
key format: `step-wizard:${draftKey}`

Examples:
  step-wizard:scorecard-wizard-abc123
  step-wizard:turnover-meeting-proj-456
  step-wizard:provisioning-user-789
```

### Payload Written to Draft Store

```typescript
// Full IStepWizardDraft written on every mutation
{
  stepStatuses: {
    'bd-section':          'complete',    // monotonically protected on merge
    'estimating-section':  'in-progress',
    'operations-section':  'not-started',
    'finance-section':     'not-started',
    'executive-section':   'not-started',
  },
  completedAts: {
    'bd-section':          '2026-03-08T09:15:00Z',
    'estimating-section':  null,
    'operations-section':  null,
    'finance-section':     null,
    'executive-section':   null,
  },
  visitedStepIds: ['bd-section', 'estimating-section'],  // sequential-with-jumps (D-05)
  onAllCompleteFired: false,                             // D-07
  savedAt: '2026-03-08T10:30:00Z',
}
```

### Read-on-Mount Flow (D-02)

```
useStepWizard mounts
  │
  ├─ draftKey present?
  │    └─ YES: draftStore.read('step-wizard:${draftKey}')
  │         ├─ null (no stored draft) → INITIAL_DRAFT(stepIds)
  │         └─ IStepWizardDraft found → mergeDraft(inMemory, stored)
  │              ├─ For each stepId: mergeStepStatus(stored, inMemory) — D-02
  │              ├─ visitedStepIds: union of stored + inMemory
  │              └─ onAllCompleteFired: stored.onAllCompleteFired (true wins)
  │
  └─ draftKey absent → INITIAL_DRAFT(stepIds) — no persistence
```

### Write-on-Mutation Flow

```
Any state mutation (markComplete, advance, goTo, markBlocked, reopenStep)
  │
  └─ setDraft(newDraft)
       │
       └─ React.useEffect([draft]) → draftStore.write('step-wizard:${draftKey}', draft)
```

### Stale-State Detection (`useStepProgress`)

```typescript
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

// Draft is considered stale if:
const isStale = Date.now() - new Date(draft.savedAt).getTime() > STALE_THRESHOLD_MS;

// Stale drafts are displayed with a ↻ indicator in HbcStepProgress
// but are NOT discarded — monotonic merge still applies
```

---

## BIC Integration: Step-Level Lifecycle (D-04)

### Wildcard Amendment to SF02 — REQUIRED

**File to amend:** `packages/bic-next-move/src/config/BIC_MODULE_MANIFEST.ts`

```typescript
// AMENDMENT REQUIRED IN SF02-T02 IMPLEMENTATION
// Add wildcard entry to support dynamic step-wizard module keys

export const BIC_MODULE_MANIFEST = {
  // ── Existing static module keys (SF02 original) ──
  'project-hub-pmp':              { domain: 'project-hub' },
  'project-hub-turnover':         { domain: 'project-hub' },
  'project-hub-monthly-review':   { domain: 'project-hub' },
  'bd-scorecard':                 { domain: 'business-development' },
  'estimating-bid-receipt':       { domain: 'estimating' },
  'admin-provisioning':           { domain: 'admin' },
  'workflow-handoff':             { domain: 'workflow' },

  // ── SF05 Amendment: wildcard prefix for step-wizard step BIC entries ──
  // Keys matching 'step-wizard:*' are registered dynamically by @hbc/step-wizard.
  // Format: step-wizard:{draftKey}:{stepId}
  // The dev-mode manifest guard (SF02-T03) recognises this prefix pattern
  // and allows any matching key without requiring a per-step PR.
  'step-wizard:*': { dynamic: true, prefix: 'step-wizard:', domain: 'step-wizard' },
} as const;
```

**File to amend:** `packages/bic-next-move/src/registry/BicModuleRegistry.ts` (SF02-T03)

```typescript
// AMENDMENT REQUIRED IN SF02-T03 IMPLEMENTATION
// Update dev-mode manifest guard to recognise wildcard prefix entries

function isKnownModuleKey(key: string): boolean {
  // Exact match
  if (key in BIC_MODULE_MANIFEST) return true;

  // Wildcard prefix match — support dynamic registrations like step-wizard:*
  const wildcardEntries = Object.entries(BIC_MODULE_MANIFEST).filter(
    ([k, v]) => (v as { dynamic?: boolean }).dynamic && (v as { prefix: string }).prefix
  );
  return wildcardEntries.some(([, v]) => key.startsWith((v as { prefix: string }).prefix));
}
```

### Step BIC Entry Lifecycle

#### On Step Unlock (becomes actionable)

```typescript
// Called from useStepWizard when a step transitions to actionable state
// (first step on mount, or next step unlocked by advance/visit in s-w-j mode)

async function registerStepBicEntry<T>(
  step: IStep<T>,
  item: T,
  draftKey: string
): Promise<void> {
  const assignee = step.resolveAssignee?.(item) ?? null;
  const dueDate = step.dueDate?.(item) ?? null;
  const moduleKey = `step-wizard:${draftKey}:${step.stepId}`;

  await bicClient.open({
    moduleKey,
    owner: assignee,          // null → SF02 D-04: ⚠️ Unassigned, urgency forced to immediate
    label: step.label,
    dueDate,
  });

  // Register notification for new assignee (D-08)
  if (assignee) {
    await notifClient.registerEvent({
      tier: 'immediate',
      type: 'step-assigned',
      moduleKey,
      assigneeUserId: assignee.userId,
    });
  }
}
```

#### On Step Completion

```typescript
async function closeStepBicEntry(stepId: string, draftKey: string): Promise<void> {
  const moduleKey = `step-wizard:${draftKey}:${stepId}`;
  await bicClient.close({ moduleKey });
  // BIC transfer to next actionable step's assignee is handled by
  // the next registerStepBicEntry call (advance/goTo triggers unlock)
}
```

### Mode-Specific BIC Entry Table (D-04)

| Mode | Active BIC Entries |
|---|---|
| `sequential` | Current step only (one entry at a time) |
| `parallel` | All pending steps with `resolveAssignee` defined (all open simultaneously) |
| `sequential-with-jumps` | Current active step + any pending visited steps with assignees |

### Integration in `useStepWizard`

```typescript
// After markComplete succeeds:
React.useEffect(() => {
  if (!draftKey) return;
  const actionableStepIds = getActionableStepIds(config, state, draft);

  for (const step of config.steps) {
    const moduleKey = `step-wizard:${draftKey}:${step.stepId}`;
    const isActionable = actionableStepIds.has(step.stepId);
    const status = draft.stepStatuses[step.stepId] ?? 'not-started';

    if (isActionable && status !== 'complete') {
      void registerStepBicEntry(step, item, draftKey);
    } else if (status === 'complete') {
      void closeStepBicEntry(step.stepId, draftKey);
    }
  }
}, [draft.stepStatuses, draftKey]);

function getActionableStepIds<T>(
  config: IStepWizardConfig<T>,
  state: IStepWizardState,
  draft: IStepWizardDraft
): Set<string> {
  if (config.orderMode === 'sequential') {
    return state.activeStepId ? new Set([state.activeStepId]) : new Set();
  }
  if (config.orderMode === 'parallel') {
    return new Set(
      config.steps
        .filter((s) => (draft.stepStatuses[s.stepId] ?? 'not-started') !== 'complete')
        .map((s) => s.stepId)
    );
  }
  // sequential-with-jumps: active step + pending visited steps
  const visited = new Set(draft.visitedStepIds);
  return new Set(
    config.steps
      .filter((s) =>
        visited.has(s.stepId) &&
        (draft.stepStatuses[s.stepId] ?? 'not-started') !== 'complete'
      )
      .map((s) => s.stepId)
  );
}
```

---

## SF02 Cross-Package Dependency Summary

| SF02 Artifact | Amendment Required | When |
|---|---|---|
| `SF02-T02-TypeScript-Contracts.md` | Add `BIC_MODULE_MANIFEST['step-wizard:*']` wildcard entry | Before SF05 Wave 2 begins |
| `SF02-T03-Module-Registry.md` | Update `isKnownModuleKey()` to match wildcard prefix | Before SF05 Wave 2 begins |
| SF02 ADR-0011 | Add note: SF05 uses `step-wizard:*` dynamic prefix pattern | With SF05 T09 deployment |

These amendments must be implemented and deployed before `useStepWizard`'s BIC integration goes live. They are non-breaking additions — no existing SF02 functionality changes.

---

## Unit Tests

```typescript
// state/__tests__/draftPersistence.test.ts
import { describe, it, expect } from 'vitest';
import { mergeDraft, mergeStepStatus } from '../draftPayload';

describe('mergeDraft', () => {
  it('preserves complete status from stored draft (D-02)', () => {
    const stored = {
      stepStatuses: { 'step-1': 'complete' },
      completedAts: { 'step-1': '2026-03-08T09:00:00Z' },
      visitedStepIds: ['step-1'],
      onAllCompleteFired: true,
      savedAt: '2026-03-08T09:00:00Z',
    };
    const inMemory = { 'step-1': 'in-progress' };
    const result = mergeDraft(inMemory, stored);
    expect(result.mergedStatuses['step-1']).toBe('complete');
  });

  it('unions visitedStepIds — never removes visited entries (D-05)', () => {
    const stored = { ...baseDraft, visitedStepIds: ['step-1', 'step-2'] };
    const result = mergeDraft({ 'step-1': 'in-progress' }, stored);
    expect(result.mergedVisitedIds).toContain('step-1');
    expect(result.mergedVisitedIds).toContain('step-2');
  });

  it('onAllCompleteFired: stored true wins over inMemory false (D-07)', () => {
    const stored = { ...baseDraft, onAllCompleteFired: true };
    const result = mergeDraft({}, stored);
    expect(result.onAllCompleteFired).toBe(true);
  });
});
```

---

## Verification Commands

```bash
pnpm --filter @hbc/step-wizard typecheck
pnpm --filter @hbc/step-wizard test -- --reporter=verbose state/__tests__/draftPersistence

# Verify SF02 amendments compile correctly
pnpm --filter @hbc/bic-next-move typecheck
```
