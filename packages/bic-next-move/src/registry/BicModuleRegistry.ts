import type { IBicModuleRegistration, IBicRegisteredItem } from '../types/IBicNextMove';
import {
  BIC_MODULE_MANIFEST,
  BIC_DYNAMIC_PREFIXES,
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

/**
 * Returns true if the key is either an exact match in BIC_MODULE_MANIFEST
 * or matches a dynamic prefix (e.g. 'step-wizard:*').
 */
export function isKnownModuleKey(key: string): boolean {
  if ((BIC_MODULE_MANIFEST as readonly string[]).includes(key)) return true;
  return BIC_DYNAMIC_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function scheduleManifestGuard(): void {
  if (_guardScheduled) return;
  _guardScheduled = true;

  /* c8 ignore next -- production guard */
  if (process.env.NODE_ENV === 'production') return;

  setTimeout(() => {
    // Check 1: Registered keys that are NOT in the manifest (typo detection)
    for (const [key] of _registry) {
      if (!isKnownModuleKey(key)) {
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
// stub-approved: server-side BIC aggregation deferred per ADR-0095 D-07.
// This endpoint will aggregate BIC state across modules via the backend aggregation
// service. Implement when the backend aggregation endpoint is activated in PH8 CI/CD phase.
export async function executeServerAggregation(
  _userId: string
): Promise<IBicFanOutResult> {
  throw new Error(
    '[bic-next-move] Server aggregation mode is not yet implemented. ' +
    'See docs/how-to/developer/bic-server-aggregation-migration.md'
  );
}
