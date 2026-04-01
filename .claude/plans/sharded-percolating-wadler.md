# Phase 2 Prompt-02 — Backend State Transition and Launch Contract Remediation

## Context

The P2-01 audit identified 6 ambiguities in the provisioning launch contract. The most material are: (1) `provisionProjectSite` endpoint requires only delegated scope, not admin role — any authenticated user can trigger provisioning directly; (2) `state-machine.md` incorrectly lists `Failed → Provisioning` as an admin retry path when admin retry actually bypasses request-state transitions entirely; (3) no code comments classify the two launch paths or explain when the direct endpoint should/shouldn't be used; (4) the transition table in `state-machine.md` is missing `UnderReview → ReadyToProvision`.

**Chosen contract: Path A — Reconcile Around Current Repo Truth.** The auto-trigger from `ReadyToProvision` is the controller-facing launch contract. The direct `provisionProjectSite` endpoint and admin retry are secondary/operational entry points. No lifecycle reversal needed.

---

## Files to Modify

### Code Changes
- `backend/functions/src/functions/provisioningSaga/index.ts` — Add `requireAdmin` to `provisionProjectSite` endpoint; add contract comments classifying all provisioning entry points
- `backend/functions/src/functions/projectRequests/index.ts` — Improve auto-trigger comment to explicitly state this is the controller-facing launch contract
- `backend/functions/src/state-machine.ts` — Add contract comment above `CONTROLLER_TRANSITIONS` clarifying ReadyToProvision is the controller-facing launch trigger point

### Test Changes
- `backend/functions/src/functions/projectRequests/__tests__/request-lifecycle.test.ts` — Add test verifying auto-trigger fires on ReadyToProvision transition; add test verifying projectNumber format rejection

### Doc Changes
- `docs/reference/provisioning/state-machine.md` — Fix `Failed → Provisioning` line; add `UnderReview → ReadyToProvision`; add launch contract section
- `docs/reference/provisioning/saga-steps.md` — Add "Launch Semantics" section classifying all entry points
- `docs/architecture/reviews/project-setup-accounting-phase-2-backend-lifecycle-hardening-report.md` — Append Prompt-02 section with chosen contract, rationale, changes, and consequences

### Version Bump
- `backend/functions/package.json` — `00.000.111` → `00.000.112`

---

## Task 1: Add admin role check to provisionProjectSite endpoint

**File:** `backend/functions/src/functions/provisioningSaga/index.ts`

The `provisionProjectSite` handler currently checks only `requireDelegatedScope`. Add `requireAdmin` check after the delegated scope check, since direct provisioning should only be available to admin/operational callers, not regular users.

Find the handler (around lines 20-78) and add after the `requireDelegatedScope` check:
```typescript
// P2-02: Direct provisioning is an admin/operational entry point.
// Controller-facing provisioning is triggered via advanceRequestState → ReadyToProvision auto-trigger.
const adminDenied = requireAdmin(auth.claims, requestId);
if (adminDenied) return adminDenied;
```

Also add a block comment at the top of the handler explaining the launch contract:
```typescript
/**
 * P2-02 Launch Contract: Direct provisioning endpoint.
 *
 * This is a secondary/operational entry point for provisioning. The primary
 * controller-facing launch path is:
 *   1. Controller approves via advanceRequestState → ReadyToProvision
 *   2. Backend auto-triggers SagaOrchestrator.execute() fire-and-forget
 *
 * This direct endpoint exists for:
 *   - Admin recovery/re-provisioning outside the normal request lifecycle
 *   - Service principal or automation-driven provisioning
 *   - Operational scenarios where the request lifecycle is not applicable
 *
 * Requires admin role (P2-02). Does not validate request state.
 */
```

Import `requireAdmin` from `../../middleware/authorization.js` if not already imported.

## Task 2: Clarify auto-trigger comment in advanceRequestState

**File:** `backend/functions/src/functions/projectRequests/index.ts`

Update the comment at line 351 from:
```typescript
// D-PH6-08 automatic provisioning handoff: fire-and-forget saga on approval.
```
to:
```typescript
// D-PH6-08, P2-02: Controller-facing provisioning launch contract.
// When controller approval advances request to ReadyToProvision, the backend
// auto-triggers the provisioning saga fire-and-forget. This is the primary
// controller-facing launch path. The saga will reconcile the request state
// to Provisioning via reconcileRequestState(). No separate "launch" action
// is required or expected from the controller.
```

## Task 3: Add contract comment to backend state-machine

**File:** `backend/functions/src/state-machine.ts`

Add a block comment above `CONTROLLER_TRANSITIONS` (around line 69):
```typescript
/**
 * P2-02 Launch Contract: Controller transitions.
 *
 * ReadyToProvision is the controller-facing launch trigger point.
 * When a controller advances a request to ReadyToProvision (with projectNumber),
 * the backend auto-triggers the provisioning saga. The saga then reconciles
 * the request to Provisioning via reconcileRequestState().
 *
 * AwaitingExternalSetup → ReadyToProvision is a valid controller transition
 * in this list but is NOT currently exposed in the Accounting UI (Phase 1 G-01).
 */
```

## Task 4: Add tests for auto-trigger and projectNumber format

**File:** `backend/functions/src/functions/projectRequests/__tests__/request-lifecycle.test.ts`

Add two test cases in the appropriate test group:

**Test 1: Auto-trigger fires on ReadyToProvision**
- Setup: mock SagaOrchestrator, create request in UnderReview state, mock role as controller
- Act: call advanceRequestState with newState='ReadyToProvision' and valid projectNumber
- Assert: SagaOrchestrator.execute was called with correct IProvisionSiteRequest shape

**Test 2: ProjectNumber format rejection**
- Setup: create request in UnderReview state, mock role as controller
- Act: call advanceRequestState with newState='ReadyToProvision' and invalid projectNumber (e.g., '25-1-1')
- Assert: 400 response with VALIDATION_ERROR

Read the existing test file to understand the mock patterns and test helper setup before writing.

## Task 5: Fix state-machine.md

**File:** `docs/reference/provisioning/state-machine.md`

**Change 1:** Fix the transition table. Current line 26 says `AwaitingExternalSetup → ReadyToProvision` with actor "Controller" — this is correct. But add the missing `UnderReview → ReadyToProvision` row:

Insert after line 24 (`UnderReview → AwaitingExternalSetup | Controller`):
```markdown
| `UnderReview` | `ReadyToProvision` | Controller (requires valid projectNumber; auto-triggers saga) |
```

**Change 2:** Fix line 26 to clarify it also auto-triggers:
```markdown
| `AwaitingExternalSetup` | `ReadyToProvision` | Controller (requires valid projectNumber; auto-triggers saga) |
```

**Change 3:** Fix line 30 — `Failed → Provisioning | Admin (via retry)` is incorrect. Admin retry re-runs the saga directly via the `retryProvisioning` endpoint without transitioning request state. Replace with:
```markdown
| `Failed` | `UnderReview` | Admin/Controller (reopen for correction) |
```

**Change 4:** Add a "Launch Contract" section at the end:
```markdown
## Launch Contract (P2-02)

The controller-facing provisioning launch contract is:

1. Controller approves request via `advanceState(requestId, 'ReadyToProvision', { projectNumber })`
2. Backend validates transition, role authorization, and projectNumber format
3. Backend auto-triggers `SagaOrchestrator.execute()` fire-and-forget
4. Saga reconciles request to `Provisioning` via `reconcileRequestState()`

Other provisioning entry points:
- **Direct API** (`POST provision-project-site`): Admin-only operational endpoint; does not validate request state
- **Admin retry** (`POST provisioning-retry/{projectId}`): Re-executes saga from last successful step; does not transition request state
- **Timer** (Step 5 deferred): Cron-triggered overnight retry for deferred web-part installations
```

## Task 6: Add launch semantics section to saga-steps.md

**File:** `docs/reference/provisioning/saga-steps.md`

Add after the existing "Retry Policy" section:
```markdown
## Launch Semantics (P2-02)

The saga can be triggered through three entry points:

| Entry Point | Trigger | Auth | Request State Validation |
|------------|---------|------|------------------------|
| Controller approval auto-trigger | `advanceRequestState` sets `ReadyToProvision` | Controller/Admin role | Yes — must be valid transition from current state |
| Direct provisioning endpoint | `POST provision-project-site` | Admin role + delegated scope | No — caller provides metadata directly |
| Admin retry | `POST provisioning-retry/{projectId}` | Admin role + delegated scope | No — re-executes from failed run |

The controller approval auto-trigger is the primary controller-facing launch path. The direct endpoint and admin retry are secondary/operational paths.
```

## Task 7: Update Phase 2 audit report

**File:** `docs/architecture/reviews/project-setup-accounting-phase-2-backend-lifecycle-hardening-report.md`

Append a new section at the end:
```markdown
---

## Prompt-02 Addendum: Launch Contract Remediation

**Chosen Contract:** Path A — Reconcile Around Current Repo Truth

**Rationale:** The current auto-trigger from `ReadyToProvision` is the correct controller-facing launch contract. It is tested (860 tests pass), well-integrated with role authorization, and already the only controller-accessible path. Path B (lifecycle reversal) would require broad changes with no clear benefit.

**Changes Made:**
1. Added `requireAdmin` to `provisionProjectSite` endpoint — prevents non-admin users from triggering provisioning directly
2. Added contract classification comments to auto-trigger, direct endpoint, and CONTROLLER_TRANSITIONS
3. Fixed `state-machine.md`: corrected `Failed → Provisioning` to `Failed → UnderReview`; added missing `UnderReview → ReadyToProvision`; added Launch Contract section
4. Added launch semantics to `saga-steps.md`
5. Added tests: auto-trigger fires on ReadyToProvision; projectNumber format rejection

**Entry Point Classification:**
| Entry Point | Classification | Auth | Intended Use |
|------------|---------------|------|-------------|
| Auto-trigger via advanceRequestState | Primary (controller-facing) | Controller/Admin role | Normal workflow approval |
| POST provision-project-site | Secondary (operational) | Admin role (P2-02) | Admin recovery, automation |
| POST provisioning-retry/{projectId} | Secondary (recovery) | Admin role | Failed run re-execution |
| Timer (Step 5) | System (automated) | System | Deferred web-part retry |

**Compatibility Consequences:**
- Accounting: no change (already uses advanceState which triggers auto-launch)
- Estimating: no change (does not call provisioning directly)
- Admin: provisionProjectSite now requires admin role (already required for other admin endpoints)
- Direct API callers: must now have admin role to call provisionProjectSite

**Stale Docs Updated:**
- state-machine.md: Fixed incorrect Failed → Provisioning transition
- saga-steps.md: Added launch semantics classification
```

## Task 8: Version bump

**File:** `backend/functions/package.json`

Change `"version": "00.000.111"` → `"version": "00.000.112"`

---

## Verification

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/provisioning check-types
pnpm --filter @hbc/provisioning test
```

All must pass. New tests (Task 4) must be included in the pass count.

## Commit Message

```
feat(backend): freeze controller-facing provisioning launch contract and add admin gate to direct endpoint (P2-02)
```
