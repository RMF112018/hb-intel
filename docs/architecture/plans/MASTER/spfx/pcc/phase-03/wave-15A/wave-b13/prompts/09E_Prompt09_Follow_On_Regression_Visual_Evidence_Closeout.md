# Phase 08 Prompt 09E — Prompt 09 Follow-On Regression, Visual Evidence, and Closeout Gate

## Role
Act as the final auditor and implementation closeout owner for the Prompt 09 follow-on package. This prompt is not a new product expansion. It validates and hardens what Prompts 09A–09D already implemented.

## Baseline / Preflight
Before editing or validating:
1. Confirm Prompts 09A, 09B, 09C, and 09D are present in history.
2. Confirm current branch / HEAD.
3. Confirm current intentional package / manifest posture.
4. Capture `git status --short`.
5. Preserve operator WIP and identify any out-of-scope drift.

Do **not** re-read files still within current context or memory unless local drift is suspected, a validation failure requires it, or a current final audit needs an exact source check.

## Parallel Document Control Surface Safety — Mandatory
Parallel work on the dedicated Document Control surface may be present by this point.

Rules:
- Do not “clean up” or normalize Documents-surface WIP.
- Do not modify Documents-surface files unless a validation failure proves Prompt 09 work caused a direct compile break and the fix is strictly additive/non-disruptive.
- If parallel drift exists, document it and isolate Prompt 09 closeout from it.

## Objective
Validate that the Prompt 09 follow-on initiative has achieved all of the following:

1. `PccDocumentControlCard` has become a compact recent-item feed with PCC-native card tabs.
2. The card remains preview-only; no row-level deep links or live source launches were introduced.
3. Future deep-link implementation is documented explicitly for later phases.
4. Project Home first 12 cards use the revised operational/analytics choreography.
5. Project Home read-model tail uses the revised lifecycle/HBI/source-intelligence choreography.
6. Bento direct-child invariants, shell-owned active-panel ownership, and no-dense-grid guardrails remain intact.
7. Dedicated Documents surface work was not disrupted.

## Audit Checklist

### A. Document Control card contract
Verify:
- card title/gateway retained;
- My Recent Files is default;
- Latest Changes switch works;
- tabs use correct roles/aria/keyboard posture;
- feed items emit required data markers;
- top-five cardinality is visible in fixture path;
- empty-feed state exists;
- no feed item is an anchor or executable launch affordance;
- developer-facing future deep-link documentation exists.

### B. Read-model contract and provider parity
Verify:
- home feed contract exists in models;
- optional additive read-model field does not break Documents surface;
- fixture client and backend mock provider both populate sample/empty feed consistently;
- adapter maps feed data to Project Home card.

### C. First-12 choreography
Verify row/order targets:
- row 1: Priority / Readiness / Document Control;
- row 2: Action Exposure / Site Health / Project Health Trend;
- row 3: Approvals / Readiness Rollup / Missing Configurations;
- row 4: External Platforms / Team Snapshot / Recent Activity.
Confirm 12-col and 10-col row sums.

### D. Tail choreography
Verify tail order and spans:
- Lifecycle Timeline + Procore;
- Ask HBI + Project Memory;
- Related Records + Project Lens.
Confirm 12-col and 10-col matrices.

### E. Guardrails
Verify:
- no `grid-auto-flow: dense`;
- no wrapper between `PccBentoGrid` and `PccDashboardCard`;
- shell remains sole `data-pcc-active-surface-panel` owner;
- no lockfile/dependency drift unless already operator-owned before this prompt;
- no unexpected package/manifest bump in this prompt.

## Validation Commands
Run:
```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
git diff --check
```

Run Prettier against Prompt 09 touched files or the prompt-specific set if maintained.

Record `pnpm-lock.yaml` MD5 before/after.

## Visual Evidence
If the live PCC screenshot/evidence harness environment is available and operator authorization is satisfied:
- run a focused Project Home screenshot capture or the repo-standard PCC visual evidence lane;
- capture at minimum:
  - standardLaptop;
  - desktop;
  - ultrawide if current harness supports it;
- inspect above-the-fold, mid-page analytics cluster, and read-model tail.

If the live environment is not available:
- do not fabricate evidence;
- state clearly that visual evidence was not produced in this prompt.

## Optional Edits Allowed
Only if validation reveals small Prompt 09-owned defects:
- stale comments that contradict the final order/card count;
- stale test descriptions that contradict final Prompt 09 behavior;
- missing Prompt 09 marker assertion tests;
- tiny corrective type/test changes directly required to reconcile 09A–09D.

Do not introduce a new product feature in Prompt 09E.

## Closeout Artifact
Create or update a durable closeout artifact in the repo’s Prompt 09 follow-on plan/evidence location if that is consistent with the current Phase 08 package structure. The closeout should record:
- baseline;
- commit chain;
- changed-file families;
- final card feed contract;
- final first-fold choreography;
- final tail choreography;
- validation commands/results;
- visual evidence presence/absence;
- dedicated Documents surface non-disruption statement;
- residual risks.

## Out of Scope / Hard Stops
- No new UI feature.
- No Documents surface redesign.
- No deep-link runtime.
- No Graph/PnP/Procore runtime.
- No grid primitive redesign.
- No dependency additions.
- No package/manifest/version bump unless operator separately authorizes it.

## Closeout Format
Return:
1. Final verdict: PASS / BLOCKED
2. Current HEAD
3. Prompt 09A–09D commit chain summary
4. Validation results
5. Visual evidence summary
6. Any tiny Prompt 09E corrective edits, if any
7. Dedicated Documents surface safety statement
8. Lockfile MD5 before/after
9. Commit summary/description if Prompt 09E authored a commit
10. Residual risks / next recommended prompt if further visual tuning is still needed
