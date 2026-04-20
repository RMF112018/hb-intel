# Financial Route / Context Contract — Prompt 02
## Objective
Complete the second route/context contract workstream for the Financial module by implementing durable route-safe Financial context, including reporting-period/version/artifact continuity, draft-safe project switching, deep-link entry, and per-project return-memory behavior.

## Context
Prompt 01 should already be complete.
Use the canonical Financial route family established there as the baseline for this pass.

This prompt is about route-safe context behavior, not UI redesign.
The goal is to ensure Financial navigation and re-entry behavior is durable, project-safe, and operationally trustworthy.

## Critical Guardrails
- Stay grounded in repo truth and actual implementation seams.
- Do not rely on ephemeral local component state for context that must survive navigation or re-entry.
- Do not allow cross-project context leakage.
- Do not silently drop draft or working context when switching projects if repo truth requires protective behavior.
- Do not blur route state, session state, and working-state persistence; use each deliberately.
- Do not re-read files already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not redesign business workflows in this prompt; implement the governing context contract.

## Files to Inspect First
Inspect the repo directly and ground this pass in actual file content, especially:

### Doctrine / planning files
- Financial route/context contract files
- Project Hub project-context continuity and switching doctrine
- source-of-truth / action-boundary files where they affect route-safe context
- runtime-governance files where version / artifact / stale-state logic affects navigation
- acceptance/readiness files that mention re-entry, switching, or deep-link durability

### Likely implementation surfaces
- `packages/shell/src/stores/projectStore.ts`
- project picker / project switching components
- session-state packages or helpers
- Financial route loaders / page entry logic
- deep-link resolution utilities
- query-param and route-state handling code
- artifact/review/publication/history navigation helpers
- tests covering navigation, switching, or re-entry behavior

## Required Actions
1. Inspect current Financial context behavior.
   - Determine what context is currently stored in:
     - route params,
     - query params,
     - shell store,
     - session state,
     - page-local state,
     - or not persisted at all.
   - Identify where current behavior is fragile, ambiguous, or cross-project unsafe.

2. Implement route-safe Financial context where required.
   - Ensure route and supporting context handling safely preserve, where applicable:
     - project identity,
     - Financial surface identity,
     - reporting period,
     - working version or publication candidate context,
     - selected artifact / review / history item context,
     - re-entry target.

3. Implement deep-link durability.
   - Ensure direct entry into a valid Financial route resolves correctly.
   - Ensure required context is reconstructed or fetched safely on entry.
   - Ensure invalid or incomplete deep links fail safely and predictably.

4. Implement draft-safe project switching behavior.
   - Ensure project switching does not leak Financial working context across projects.
   - Where active work or draft-sensitive context exists, apply the repo-truth-required protection behavior.
   - Make the switching behavior explicit and deterministic.

5. Implement per-project return-memory behavior.
   - Where repo truth supports it, preserve a user’s last meaningful Financial location per project.
   - Ensure this behavior is bounded, explainable, and does not restore stale or invalid context unsafely.

6. Normalize route/context integration points.
   - Ensure route loaders, shell stores, session-state helpers, and deep-link utilities agree on the same context contract.
   - Remove contradictory or duplicate context handling where found.

7. Add or update focused tests.
   - Prove:
     - valid deep-link entry,
     - safe missing/invalid context handling,
     - project-switch behavior,
     - per-project return-memory restoration,
     - no cross-project context leakage,
     - safe restoration of Financial route context after navigation.

8. Update documentation only where needed.
   - If implementation reveals small doc drift, correct it.
   - Do not broaden this into doctrine rewrites beyond the route/context contract.

## Deliverables
1. Durable Financial route/context behavior implemented.
2. Deep-link handling normalized.
3. Draft-safe project switching behavior implemented.
4. Per-project return-memory behavior implemented where governed.
5. Focused tests added or updated.
6. Minimal documentation corrections if required.
7. A concise changed-files and context-behavior summary.

## Definition of Done
This prompt is complete only when:
- Financial route context is durable and project-safe,
- deep links resolve predictably,
- project switching does not leak or corrupt Financial context,
- per-project return-memory works where required,
- invalid context fails safely,
- and tests prove the critical re-entry and switching behaviors.

## Output Format
Return:
1. objective completed
2. files changed
3. route-safe context behaviors implemented
4. deep-link and switching behaviors implemented
5. tests added or updated
6. remaining context risks / follow-ups
