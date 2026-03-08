# SF02-T08 — Deployment, ADR & Documentation

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-02-Shared-Feature-BIC-Next-Move.md`
**Decisions Applied:** All 10 (D-01 through D-10)
**Estimated Effort:** 0.25 sprint-weeks
**Depends On:** T01–T07

---

## Objective

Complete the documentation suite, write the ADR, produce the server-aggregation migration guide (D-06), and run the final pre-deployment verification checklist.

---

## 3-Line Plan

1. Write ADR `0011-bic-next-move-platform-primitive.md` documenting all 10 interview decisions.
2. Write `docs/how-to/developer/bic-server-aggregation-migration.md` (D-06 requirement).
3. Execute pre-deployment checklist and verify `pnpm turbo run build` passes cleanly.

---

## Pre-Deployment Checklist

### Code Quality
- [ ] `pnpm --filter @hbc/bic-next-move typecheck` exits 0
- [ ] `pnpm --filter @hbc/bic-next-move lint` exits 0
- [ ] `pnpm --filter @hbc/bic-next-move test:coverage` exits 0 with ≥95% on all thresholds
- [ ] No domain package imports in `packages/bic-next-move/src/` (architecture check)
- [ ] `@hbc/bic-next-move/testing` sub-path resolves and exports all 4 utilities

### Contract Stability
- [ ] `IBicNextMoveConfig<T>` has exactly 8 required resolvers + 2 optional (`resolveTransferHistory`, `urgencyThresholds`)
- [ ] `IBicNextMoveState` has `urgencyTier`, `transferHistory`, `isOverdue`, `isBlocked` fields
- [ ] `BIC_MODULE_MANIFEST` contains all 10 expected module keys
- [ ] `BIC_AGGREGATION_MODE` defaults to `'client'` with `'server'` stub present

### Documentation
- [ ] ADR `docs/architecture/adr/0011-bic-next-move-platform-primitive.md` written
- [ ] `docs/how-to/developer/bic-server-aggregation-migration.md` written (D-06)
- [ ] `docs/how-to/developer/bic-module-adoption.md` written (module registration guide)
- [ ] `docs/reference/bic-next-move/api.md` written (complete API reference)

### Integration
- [ ] `@hbc/notification-intelligence` lazy import confirmed working (no hard dep)
- [ ] `useBicMyItems` fan-out confirmed via dev-harness with 2+ registered modules
- [ ] Transfer deduplication confirmed: explicit `recordBicTransfer()` + hook diff = 1 notification
- [ ] Dev-mode manifest guard emits warning for unregistered manifest key (test in dev build)
- [ ] `BIC_TRANSFER_EVENT` DOM event fires and is observable by test harness

### Storybook
- [ ] All 7 canonical state stories render without console errors for `HbcBicBadge`
- [ ] All 7 canonical state stories render without console errors for `HbcBicDetail`
- [ ] All 3 canonical stories render without console errors for `HbcBicBlockedBanner`

### Build
- [ ] `pnpm turbo run build --filter @hbc/bic-next-move` exits 0
- [ ] `dist/index.js` and `dist/index.d.ts` present
- [ ] `testing/index.js` and `testing/index.d.ts` present (sub-path artifacts)

---

## ADR: `docs/architecture/adr/0011-bic-next-move-platform-primitive.md`

```markdown
# ADR-0011: BIC Next Move as a Platform-Wide Ownership Primitive

**Date:** 2026-03-08
**Status:** Accepted
**Deciders:** HB Intel Architecture Team
**Source Feature:** PH7-SF-02

---

## Context

The UX competitive study (ux-mold-breaker.md §7.2, con-tech-ux-study §8.2) identified that
Procore's Ball-In-Court (BIC) system — which shows who owns the next move on a record —
is the industry's most effective accountability mechanism. However, Procore's implementation
is inconsistent: BIC exists on submittals and RFIs but not on Change Events, disorienting
users who rely on it in some tools but find it absent in others.

HB Intel's response is to generalize BIC into a **platform-wide primitive** via
`@hbc/bic-next-move` — a Tier 1 shared package that any module adopts through a
generic configuration contract (`IBicNextMoveConfig<T>`).

---

## Decisions Made

### D-01 — Urgency Tier Calculation
**Decision:** Fixed platform defaults (`watch < 3 business days`, `immediate = overdue or today`)
with optional per-config threshold overrides via `IBicNextMoveConfig.urgencyThresholds`.
**Rationale:** Zero configuration burden for the common case; targeted override available for
items with non-standard cadences (bid deadlines, permit log). Null owner forces `immediate`
regardless of due date (D-04).

### D-02 — Cross-Module Item Registry
**Decision:** Runtime self-registration via `registerBicModule()` + `BIC_MODULE_MANIFEST`
typed manifest + dev-mode guard for missing/mistyped registrations.
**Rationale:** Keeps `@hbc/bic-next-move` (Tier 1) free of imports from domain packages
(Tier 3). The manifest guard restores discoverability and error-catching that pure runtime
registration lacks. New modules are added to the manifest as a one-line change.

### D-03 — BIC Transfer Detection
**Decision:** Hybrid — hook-level diff detection in `useBicNextMove` for UI-driven transfers
+ explicit `recordBicTransfer()` for background/server-driven transfers + 60-second
deduplication bucket prevents double-notification.
**Rationale:** Hook-only detection misses background transfers (the most important ones).
Explicit-only detection imposes maintenance burden on every module author. Hybrid covers
both paths without burdening the common case.

### D-04 — Null Owner State
**Decision:** `⚠️ Unassigned` amber warning badge. `urgencyTier` forced to `'immediate'`.
Prominent callout in `HbcBicDetail`. No "fallback owner" pattern.
**Rationale:** The whole purpose of BIC is accountability visibility. A fallback owner
pattern ("defaults to Project Manager") creates exactly the "appears owned, actually stalled"
scenario the UX study flagged as the primary source of unresolved construction delays.

### D-05 — Complexity Mode Integration
**Decision:** Three distinct tiers (Essential / Standard / Expert) with optional `forceVariant`
prop override per component instance.
**Rationale:** Graduated disclosure per the broader UX design philosophy. `forceVariant` is
required for SPFx narrow column contexts (pin to `essential`) and My Work Feed rows (pin to
`standard`). Used `@hbc/ui-kit/app-shell` in `HbcBicBadge` to comply with SPFx bundle budget.

### D-06 — `useBicMyItems` Query Strategy
**Decision:** Client-side fan-out via `Promise.allSettled` now. `BIC_AGGREGATION_MODE`
feature flag present for future server-side aggregation. Migration path documented in
`docs/how-to/developer/bic-server-aggregation-migration.md`.
**Rationale:** Phase 7 module count (~10) does not justify a new cross-module Azure Function.
The abstraction layer (registered `queryFn` per module) means the switch to server aggregation
requires zero changes to module registration code — only the `executeBicFanOut` implementation
changes behind the flag.

### D-07 — Caching & Staleness
**Decision:** `useBicNextMove` = 60s stale. `useBicMyItems` = 3-min stale + refetch on window
focus. `immediate`-tier items get 45s polling override supplied by the feed consumer.
**Rationale:** 30-second blanket polling would hit Graph throttling thresholds in a team of 20+.
5-minute blanket is too coarse for single-item views where a user is actively watching for an
update. Tiered staleness matched to user attention is the minimum-viable performance model.

### D-08 — Ownership Transfer History Depth
**Decision:** Optional `resolveTransferHistory?: (item: T) => IBicTransfer[]` in config.
Expert mode renders collapsible "Full Ownership History" in `HbcBicDetail`. Absent resolver
silently omits the section.
**Rationale:** A platform-level transfer log (Option C) would add a new SharePoint list dependency
and a write on every transfer — too heavy for a Phase 7 foundation package. The optional resolver
gives full history to modules that store it, zero cost to those that don't.

### D-09 — Cross-Module Navigation
**Decision:** Router-agnostic `onNavigate?: (href: string) => void` callback on
`HbcBicBlockedBanner`. Plain `<a>` fallback when absent. Dev-mode warning for missing
`onNavigate` when `href` is a relative PWA path.
**Rationale:** `@hbc/bic-next-move` is Tier 1 and must not import TanStack Router.
Inversion of control via callback keeps the package router-agnostic while enabling SPA
navigation in PWA contexts. SPFx gets the plain anchor fallback at no cost.

### D-10 — Testing Fixtures
**Decision:** `@hbc/bic-next-move/testing` sub-path exports `MockBicItem`,
`createMockBicConfig()`, `mockBicStates` (7 canonical fixtures), `createMockBicOwner()`.
Zero production bundle impact.
**Rationale:** Every consumer module would otherwise reimplement the same mock boilerplate.
The sub-path pattern is already established in this monorepo (`@hbc/ui-kit/app-shell`,
`@hbc/ui-kit/theme`). Canonical fixtures also ensure visual consistency across all BIC
Storybook stories platform-wide.

---

## Consequences

**Positive:**
- Every future module gets consistent, cross-platform BIC ownership display by implementing
  one configuration object — zero UI work required.
- The My Work Feed and Project Canvas aggregate all owned items with no new backend infrastructure.
- Procore's BIC inconsistency (exists on some tools, not others) is architecturally eliminated.

**Negative / Trade-offs:**
- The optional `resolveTransferHistory` resolver means transfer history quality varies by module.
  Modules that don't store transfer events will show no history in Expert mode.
- Client-side fan-out in `useBicMyItems` means N API calls per feed load. This is acceptable
  at Phase 7 scale but will require migration to server aggregation if module count exceeds ~15.
  See `docs/how-to/developer/bic-server-aggregation-migration.md`.
- The `BIC_MODULE_MANIFEST` must be manually updated when new modules are added.
  CI lint rule should enforce this via a check against registered module keys in the codebase.
```

---

## Migration Guide: `docs/how-to/developer/bic-server-aggregation-migration.md`

```markdown
# How To: Migrate BIC Aggregation to Server-Side

**Applies to:** `@hbc/bic-next-move` v1.x+
**Trigger:** Client-side fan-out performance becomes unacceptable (>~15 registered modules or
  observable throttling on slow connections in a team of 20+).

---

## Background

`useBicMyItems` currently uses client-side fan-out (D-06): it calls each registered module's
`queryFn` in parallel via `Promise.allSettled` and merges results in the browser.

This is controlled by `BIC_AGGREGATION_MODE` in `src/constants/manifest.ts`.
When set to `'server'`, `useBicMyItems` instead calls a single Azure Function endpoint
(`GET /api/bic/my-items`) that pre-aggregates results server-side.

The abstraction layer means **no module registration changes are required**.
Module authors continue to call `registerBicModule()` with their `queryFn`.
Only the aggregation path inside the package changes.

---

## Step 1: Build the Azure Function

Create `apps/azure-functions/src/functions/bicMyItems.ts`:

\`\`\`typescript
import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
// Import each module's server-side query function
// (These are the server equivalents of the module queryFns registered client-side)
import { fetchBdScorecardBicItems } from '@hbc/bd-scorecard/server';
import { fetchEstimatingPursuitBicItems } from '@hbc/estimating/server';
// ... etc for all 10 manifest modules

export async function bicMyItems(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const userId = request.query.get('userId');
  if (!userId) return { status: 400, body: 'userId required' };

  const results = await Promise.allSettled([
    fetchBdScorecardBicItems(userId),
    fetchEstimatingPursuitBicItems(userId),
    // ...
  ]);

  const items = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => (r as PromiseFulfilledResult<any>).value);
  const failedModules = results
    .map((r, i) => r.status === 'rejected' ? manifestKeys[i] : null)
    .filter(Boolean);

  return { status: 200, jsonBody: { items, failedModules } };
}
\`\`\`

---

## Step 2: Implement `executeServerAggregation`

In `src/registry/BicModuleRegistry.ts`, replace the stub:

\`\`\`typescript
export async function executeServerAggregation(userId: string): Promise<IBicFanOutResult> {
  const response = await fetch(`/api/bic/my-items?userId=${encodeURIComponent(userId)}`);
  if (!response.ok) throw new Error(`BIC server aggregation failed: ${response.status}`);
  return response.json() as Promise<IBicFanOutResult>;
}
\`\`\`

---

## Step 3: Flip the Feature Flag

In `src/constants/manifest.ts`, update:

\`\`\`typescript
export const BIC_AGGREGATION_MODE: BicAggregationMode = 'server';
\`\`\`

Or set via environment variable:
\`\`\`
VITE_BIC_AGGREGATION_MODE=server
\`\`\`

---

## Step 4: Verify

\`\`\`bash
# Confirm single network call in My Work Feed (not N calls)
# Open browser DevTools → Network tab → filter by /api/bic
# Navigate to My Work Feed — expect exactly 1 call to /api/bic/my-items

# Run E2E tests
pnpm exec playwright test e2e/bic-next-move.spec.ts

# Confirm client fan-out is no longer called
# (useBicMyItems should not call individual module proxy endpoints)
\`\`\`
```

---

## Module Adoption Guide: `docs/how-to/developer/bic-module-adoption.md`

```markdown
# How To: Add BIC Next Move to a New Module

**Time to implement:** ~2 hours for a direct-assignee module, ~4 hours for workflow-state-derived.

## Step 1: Add dependency

\`\`\`json
// In your module's package.json
{
  "dependencies": {
    "@hbc/bic-next-move": "workspace:*"
  }
}
\`\`\`

## Step 2: Add your key to BIC_MODULE_MANIFEST

In `packages/bic-next-move/src/constants/manifest.ts`, add your key to the array:

\`\`\`typescript
export const BIC_MODULE_MANIFEST = [
  // ... existing keys ...
  'your-module-key',   // ← Add here
] as const;
\`\`\`

Submit this as a one-line PR change. The manifest guard will warn if you forget.

## Step 3: Define your BIC config

\`\`\`typescript
// packages/your-module/src/bic/yourItemBicConfig.ts
import { IBicNextMoveConfig } from '@hbc/bic-next-move';
import { IYourItem } from '../types';

export const yourItemBicConfig: IBicNextMoveConfig<IYourItem> = {
  ownershipModel: 'direct-assignee', // or 'workflow-state-derived'
  resolveCurrentOwner: (item) => item.assignee ? {
    userId: item.assignee.id,
    displayName: item.assignee.name,
    role: item.assignee.role,
  } : null,
  resolveExpectedAction: (item) => item.pendingAction,
  resolveDueDate: (item) => item.dueDate ?? null,
  resolveIsBlocked: (item) => item.isBlocked,
  resolveBlockedReason: (item) => item.blockedReason ?? null,
  resolvePreviousOwner: (item) => null, // implement if available
  resolveNextOwner: (item) => null,     // implement if available
  resolveEscalationOwner: (item) => null, // implement if available
};
\`\`\`

## Step 4: Register at bootstrap

\`\`\`typescript
// packages/your-module/src/index.ts
import { registerBicModule } from '@hbc/bic-next-move';
import { yourItemBicConfig, resolveFullBicState } from '@hbc/bic-next-move';

registerBicModule({
  key: 'your-module-key',
  label: 'Your Module Label',
  queryFn: async (userId) => {
    const items = await fetchYourItemsOwnedBy(userId);
    return items.map(item => ({
      itemKey: \`your-module-key::\${item.id}\`,
      moduleKey: 'your-module-key',
      moduleLabel: 'Your Module Label',
      state: resolveFullBicState(item, yourItemBicConfig),
      href: \`/your-module/\${item.id}\`,
      title: item.title,
    }));
  },
});
\`\`\`

## Step 5: Render in list rows

\`\`\`tsx
import { HbcBicBadge } from '@hbc/bic-next-move';
// In SPFx: import from '@hbc/ui-kit/app-shell' internally — HbcBicBadge handles this

<HbcBicBadge item={yourItem} config={yourItemBicConfig} />
\`\`\`

## Step 6: Render in detail view

\`\`\`tsx
import { HbcBicDetail } from '@hbc/bic-next-move';

<HbcBicDetail
  item={yourItem}
  config={yourItemBicConfig}
  showChain={true}
  onNavigate={(href) => router.navigate({ to: href })}
/>
\`\`\`

## Step 7: Write tests

\`\`\`typescript
import { createMockBicConfig, mockBicStates } from '@hbc/bic-next-move/testing';
// Use the canonical fixtures — do not reimplement boilerplate
\`\`\`

See `docs/reference/bic-next-move/api.md` for full API reference.
```

---

## Final Verification Commands

```bash
# 1. Full turbo build including bic-next-move and all dependents
pnpm turbo run build --filter @hbc/bic-next-move...

# 2. Full test suite with coverage enforcement
pnpm --filter @hbc/bic-next-move test:coverage
# Expected: Lines ≥95%, Functions ≥95%, Branches ≥95%, Statements ≥95%

# 3. Confirm dist artifacts
ls packages/bic-next-move/dist/
# Expected: index.js, index.d.ts, index.js.map, index.d.ts.map

# 4. Confirm testing sub-path artifacts
ls packages/bic-next-move/testing/
# Expected: index.js, index.d.ts (or .ts source files if not pre-compiled)

# 5. Architecture dependency check (no domain imports)
grep -r "from '@hbc/bd-" packages/bic-next-move/src/
grep -r "from '@hbc/estimating" packages/bic-next-move/src/
grep -r "from '@hbc/project-hub" packages/bic-next-move/src/
# Expected: zero matches for all three

# 6. Verify ADR and docs exist
test -f docs/architecture/adr/0011-bic-next-move-platform-primitive.md && echo "ADR OK"
test -f docs/how-to/developer/bic-server-aggregation-migration.md && echo "Migration guide OK"
test -f docs/how-to/developer/bic-module-adoption.md && echo "Adoption guide OK"

# 7. Playwright E2E (requires dev-harness running)
pnpm exec playwright test e2e/bic-next-move.spec.ts --reporter=list
```

---

## Blueprint Progress Comment

Add to `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` at end of file:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF02 completed: 2026-03-08
Package: @hbc/bic-next-move
Documentation added:
  - docs/architecture/plans/shared-features/SF02-BIC-Next-Move.md (implementation summary)
  - docs/architecture/plans/shared-features/SF02-T01-Package-Scaffold.md
  - docs/architecture/plans/shared-features/SF02-T02-TypeScript-Contracts.md
  - docs/architecture/plans/shared-features/SF02-T03-Module-Registry.md
  - docs/architecture/plans/shared-features/SF02-T04-Hooks.md
  - docs/architecture/plans/shared-features/SF02-T05-Components.md
  - docs/architecture/plans/shared-features/SF02-T06-Transfer-Detection.md
  - docs/architecture/plans/shared-features/SF02-T07-Testing-Strategy.md
  - docs/architecture/plans/shared-features/SF02-T08-Deployment.md
  - docs/how-to/developer/bic-module-adoption.md
  - docs/how-to/developer/bic-server-aggregation-migration.md
ADR created: docs/architecture/adr/0011-bic-next-move-platform-primitive.md
Next: SF03 (per PH7-Shared-Features-Evaluation.md build sequence)
-->
```
