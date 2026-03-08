# SF02-T03 — Module Registry

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-02-Shared-Feature-BIC-Next-Move.md`
**Decisions Applied:** D-02 (runtime registration + manifest guard), D-06 (client fan-out + aggregation mode flag)
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01 (scaffold), T02 (contracts)

---

## Objective

Implement the module self-registration system that enables `useBicMyItems` to aggregate owned items across all domain modules without `@hbc/bic-next-move` importing from any of them. Includes the dev-mode manifest guard and the client-side fan-out layer.

---

## 3-Line Plan

1. Implement `BicModuleRegistry.ts` — in-memory registry singleton with `registerBicModule()`, `getRegistry()`, and dev-mode manifest guard.
2. Implement the `useBicMyItems` registry layer — fan-out via `Promise.allSettled`, partial-result handling, `BIC_AGGREGATION_MODE` flag stub.
3. Verify: a domain module's `registerBicModule()` call makes its items appear in `useBicMyItems` without any import from `@hbc/bic-next-move` to that module.

---

## `src/registry/BicModuleRegistry.ts`

```typescript
import type { IBicModuleRegistration, IBicRegisteredItem } from '../types/IBicNextMove';
import {
  BIC_MODULE_MANIFEST,
  BIC_MANIFEST_GUARD_DELAY_MS,
  type BicModuleKey,
} from '../constants/manifest';

// ─────────────────────────────────────────────────────────────────────────────
// Internal registry state
// ─────────────────────────────────────────────────────────────────────────────

const _registry = new Map<string, IBicModuleRegistration>();
let _guardScheduled = false;

// ─────────────────────────────────────────────────────────────────────────────
// Dev-mode manifest guard (D-02)
// ─────────────────────────────────────────────────────────────────────────────

function scheduleManifestGuard(): void {
  if (_guardScheduled) return;
  _guardScheduled = true;

  if (process.env.NODE_ENV === 'production') return;

  setTimeout(() => {
    // Check 1: Registered keys that are NOT in the manifest (typo detection)
    for (const [key] of _registry) {
      if (!(BIC_MODULE_MANIFEST as readonly string[]).includes(key)) {
        console.warn(
          `[bic-next-move] Module registered with unknown key "${key}". ` +
          `This key is not in BIC_MODULE_MANIFEST. Check for typos or add it to the manifest. ` +
          `File: src/constants/manifest.ts`
        );
      }
    }

    // Check 2: Manifest keys that never registered (forgotten bootstrap call)
    for (const manifestKey of BIC_MODULE_MANIFEST) {
      if (!_registry.has(manifestKey)) {
        console.warn(
          `[bic-next-move] Expected module "${manifestKey}" (from BIC_MODULE_MANIFEST) ` +
          `has not registered within ${BIC_MANIFEST_GUARD_DELAY_MS}ms of app bootstrap. ` +
          `Ensure registerBicModule({ key: "${manifestKey}", ... }) is called during module initialization. ` +
          `Items from this module will be absent from useBicMyItems.`
        );
      }
    }
  }, BIC_MANIFEST_GUARD_DELAY_MS);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registers a domain module's BIC query function with the platform registry.
 *
 * Call this during your module's bootstrap (e.g., in index.ts, before rendering).
 * The key must match a value in BIC_MODULE_MANIFEST.
 *
 * @example
 * // In packages/bd-scorecard/src/index.ts
 * import { registerBicModule } from '@hbc/bic-next-move';
 *
 * registerBicModule({
 *   key: 'bd-scorecard',
 *   label: 'Go/No-Go Scorecards',
 *   queryFn: async (userId) => fetchScorecardBicItems(userId),
 * });
 */
export function registerBicModule(registration: IBicModuleRegistration): void {
  if (_registry.has(registration.key)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[bic-next-move] Module "${registration.key}" is already registered. ` +
        `Duplicate registration ignored. Check that registerBicModule is not called twice.`
      );
    }
    return;
  }

  _registry.set(registration.key, registration);
  scheduleManifestGuard();
}

/**
 * Returns a snapshot of all registered modules.
 * Used internally by useBicMyItems.
 */
export function getRegistry(): ReadonlyMap<string, IBicModuleRegistration> {
  return _registry;
}

/**
 * Returns the registration for a specific module key.
 * Returns undefined if the module is not registered.
 */
export function getModuleRegistration(
  key: BicModuleKey | string
): IBicModuleRegistration | undefined {
  return _registry.get(key);
}

/**
 * Clears the registry. Used in tests only — do NOT call in production code.
 * @internal
 */
export function _clearRegistryForTests(): void {
  _registry.clear();
  _guardScheduled = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fan-out query executor (D-06)
// ─────────────────────────────────────────────────────────────────────────────

export interface IBicFanOutResult {
  items: IBicRegisteredItem[];
  failedModules: string[];
}

/**
 * Executes all registered module queryFns in parallel via Promise.allSettled.
 * Failed modules are recorded in failedModules rather than failing the entire call.
 * This is the client-side aggregation path (BIC_AGGREGATION_MODE = 'client').
 *
 * See docs/how-to/developer/bic-server-aggregation-migration.md for the
 * server-side aggregation migration path (BIC_AGGREGATION_MODE = 'server').
 */
export async function executeBicFanOut(userId: string): Promise<IBicFanOutResult> {
  const registrations = Array.from(getRegistry().values());

  const results = await Promise.allSettled(
    registrations.map((reg) =>
      reg.queryFn(userId).then((items) => ({ key: reg.key, items }))
    )
  );

  const allItems: IBicRegisteredItem[] = [];
  const failedModules: string[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value.items);
    } else {
      // Find which module failed by correlating index
      const index = results.indexOf(result);
      const failedKey = registrations[index]?.key ?? 'unknown';
      failedModules.push(failedKey);

      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[bic-next-move] Module "${failedKey}" failed to load BIC items:`,
          result.reason
        );
      }
    }
  }

  // Sort: immediate → watch → upcoming; within tier, sort by dueDate ascending
  allItems.sort((a, b) => {
    const tierOrder: Record<string, number> = { immediate: 0, watch: 1, upcoming: 2 };
    const tierDiff = tierOrder[a.state.urgencyTier] - tierOrder[b.state.urgencyTier];
    if (tierDiff !== 0) return tierDiff;

    // Secondary sort: overdue items first within 'immediate'
    if (a.state.isOverdue !== b.state.isOverdue) return a.state.isOverdue ? -1 : 1;

    // Tertiary sort: earliest due date first
    if (!a.state.dueDate && !b.state.dueDate) return 0;
    if (!a.state.dueDate) return 1;
    if (!b.state.dueDate) return -1;
    return new Date(a.state.dueDate).getTime() - new Date(b.state.dueDate).getTime();
  });

  return { items: allItems, failedModules };
}

/**
 * Server-side aggregation stub (D-06).
 *
 * This function is intentionally not implemented — it is the migration target
 * described in docs/how-to/developer/bic-server-aggregation-migration.md.
 *
 * When BIC_AGGREGATION_MODE is switched to 'server':
 * 1. Implement this function to call GET /api/bic/my-items
 * 2. The Azure Function must return IBicFanOutResult shape
 * 3. No module registration changes required
 *
 * @internal — do not call directly; useBicMyItems routes via BIC_AGGREGATION_MODE
 */
export async function executeServerAggregation(
  _userId: string
): Promise<IBicFanOutResult> {
  throw new Error(
    '[bic-next-move] Server aggregation mode is not yet implemented. ' +
    'See docs/how-to/developer/bic-server-aggregation-migration.md'
  );
}
```

---

## Module Adoption Example

This is the complete pattern a domain module author follows to register. This example goes in `packages/bd-scorecard/src/index.ts`:

```typescript
import { registerBicModule } from '@hbc/bic-next-move';
import type { IBicRegisteredItem } from '@hbc/bic-next-move';
import { scorecardBicConfig } from './bic/scorecardBicConfig';
import { fetchActiveScorecards } from './api/scorecardApi';

registerBicModule({
  key: 'bd-scorecard',
  label: 'Go/No-Go Scorecards',
  queryFn: async (userId: string): Promise<IBicRegisteredItem[]> => {
    const scorecards = await fetchActiveScorecards({ ownedByUserId: userId });

    return scorecards.map((scorecard) => {
      const state = resolveFullBicState(scorecard, scorecardBicConfig);
      return {
        itemKey: `bd-scorecard::${scorecard.id}`,
        moduleKey: 'bd-scorecard',
        moduleLabel: 'Go/No-Go Scorecards',
        state,
        href: `/bd/scorecards/${scorecard.id}`,
        title: `${scorecard.projectName} – Go/No-Go Scorecard`,
      };
    });
  },
});
```

> **Note:** `resolveFullBicState` is a helper exported from `useBicNextMove` (T04) that runs the config resolvers against an item and returns `IBicNextMoveState`. Module `queryFn` implementations use it to avoid duplicating resolver logic.

---

## Registry Module Dependency Rule

`@hbc/bic-next-move` must **never** import from any domain module package. The dependency arrow always points inward:

```
packages/bd-scorecard  ──imports──▶  @hbc/bic-next-move
packages/estimating    ──imports──▶  @hbc/bic-next-move
packages/project-hub   ──imports──▶  @hbc/bic-next-move

@hbc/bic-next-move     ──never imports──▶  any domain package
```

If a CI lint rule flags an import from a domain package inside `packages/bic-next-move/src/`, that is an architecture violation and must be rejected immediately per CLAUDE.md §7.

---

## Verification Commands

```bash
# 1. Typecheck
pnpm --filter @hbc/bic-next-move typecheck

# 2. Run registry unit tests (written in T07)
pnpm --filter @hbc/bic-next-move test -- BicModuleRegistry

# 3. Verify no domain package imports exist in bic-next-move source
grep -r "from '@hbc/bd-" packages/bic-next-move/src/ && echo "VIOLATION" || echo "OK"
grep -r "from '@hbc/estimating" packages/bic-next-move/src/ && echo "VIOLATION" || echo "OK"
grep -r "from '@hbc/project-hub" packages/bic-next-move/src/ && echo "VIOLATION" || echo "OK"

# 4. Integration smoke test: register a mock module and confirm it appears in fan-out
node -e "
  import('@hbc/bic-next-move').then(({ registerBicModule, executeBicFanOut }) => {
    registerBicModule({
      key: 'bd-scorecard',
      label: 'Test',
      queryFn: async () => [],
    });
    return executeBicFanOut('user-123');
  }).then((result) => {
    console.log('Fan-out OK, failed modules:', result.failedModules);
  });
"
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF02-T03 Module Registry: COMPLETE — 2026-03-08
Files populated:
  - src/registry/BicModuleRegistry.ts — full registry singleton with registerBicModule(), getRegistry(),
    getModuleRegistration(), _clearRegistryForTests(), scheduleManifestGuard (D-02),
    executeBicFanOut with Promise.allSettled + partial-result + sort (D-06),
    executeServerAggregation stub (D-06)
  - src/registry/index.ts — barrel export already correct from T01 (no changes needed)
Barrel exports verified: src/index.ts already re-exports ./registry from T01
Verification: typecheck zero errors, build produces dist/ with .d.ts declarations
-->
