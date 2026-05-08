# Prompt 06 — Content, Source, and HBI Authority Copy Pass — UPDATED

## Role

You are the local code agent working in the `hb-intel` repository. You are implementing a controlled Project Home flagship remediation for the PCC SPFx application.

## Non-negotiable agent instructions

- Do **not** re-read files that are still within your current context or memory. Only re-open a file when you need to verify stale, missing, contradictory, or newly changed repo truth.
- Start with `git status --short`, `git branch --show-current`, `git rev-parse HEAD`, and `md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml`.
- Treat the accepted Prompt 05 product-code baseline as:
  - `9133bec436a7d12d249cbd2d99533342133d208e`
  - Accepted Prompt 04 baseline: `686fa9fd83c1b10c9709fb6aedea13829d61c548`
  - Accepted Prompt 03 baseline: `f4cb0b3974e2e0a35ae3ab1ff08246fe3b73c44b`
  - Accepted Prompt 02 corrective baseline: `81f3b8dff1c2cc6ec295ccd7ea0ddb8f0536f8b8`
  - Package baseline evidence: `docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/`
- Use the canonical scorecard path:
  - `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
  - Do **not** reference the old `_v2` scorecard filename.
- Preserve the Project Home two-path contract:
  - fixture-only path remains deterministic and no-read-model;
  - read-model-driven path remains opt-in through `readModelClient`;
  - fixture-only path remains exactly 10 cards;
  - read-model-driven path remains exactly 16 cards after read-model/lifecycle hooks settle.
- Preserve bento direct-child behavior:
  - every rendered `[data-pcc-card]` must have `parentElement === [data-pcc-bento-grid]`;
  - do not add wrapper `<div>` / `<section>` / layout containers around Project Home cards;
  - do not nest `PccDashboardCard` inside another `PccDashboardCard`.
- Do not introduce live writes, uploads, syncs, approvals, deletes, saves, external launches, workflow completion, source-system mutation, or writeback.
- Keep HBI advisory:
  - HBI may summarize, explain, ground, and route attention;
  - HBI must not claim autonomous decision, approval, source-of-truth, writeback, creation, deletion, modification, completion, or mutation authority.
- Keep Procore/Sage/SharePoint/PCC source-of-record boundaries explicit:
  - Procore owns Procore-native records;
  - Microsoft/SharePoint lanes own Microsoft file records where applicable;
  - PCC may summarize, display, and route attention through the read model;
  - HBI answers are grounded summaries, not record authority;
  - do not use “live system feeds” wording for read-model availability.
- Do not edit `package.json`, `pnpm-lock.yaml`, package-solution files, manifests, or SPFx packaging files.
- Do not modify shared primitives (`PccBentoGrid`, `PccDashboardCard`, `footprints.ts`, shell/tabs/hero primitives).
- Prefer Project Home-local component/copy/test changes.
- Stage paths explicitly. Never use `git add -A`. Do not use `--no-verify` or force flags.
- Run the validation commands named in this prompt before closeout. If a command cannot run, report why and what evidence remains missing.

## Objective

Reduce Project Home content needs-review exposure by tightening copy around source ownership, read-only/preview posture, disabled/inert affordances, owner/next-step responsibility, construction-operational language, mock/fixture transparency, and HBI authority boundaries.

This is a **copy and contract pass**, not a layout, routing, state-model, or data-model pass.

## Required pre-edit gates

Run before editing:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -n 10
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
grep -R "Source: live system feeds" apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.ts || echo "gate ok — no matches"
```

Expected posture:

- Current HEAD should include accepted Prompt 05 commit `9133bec436a7d12d249cbd2d99533342133d208e`.
- Lockfile MD5 should remain `00570e10e3dc9015188ba503ea996943`.
- The `grep` command should produce no matches.
- Any unrelated dirty/untracked files must remain untouched and named in closeout.
- Branch history may contain unrelated evidence/e2e commits; this prompt must keep its own staged/committed diff narrowly scoped.

## Current repo-truth baseline

At the accepted Prompt 05 baseline:

- Project Home fixture path is 10 cards and does not render lifecycle/HBI.
- Project Home read-model path is 16 cards and promotes `Lifecycle Timeline` and `Ask HBI — Grounded Project Answers` below the operational cluster.
- The command summary already uses bounded source wording:
  - `Source: PCC read-model available`
  - `Source: fixture preview`
- The command summary HBI cue currently says:
  - `HBI advisory · no writeback`
- Ask HBI panel disclaimer already states:
  - HBI is not the source of truth;
  - HBI has no decision, approval, or writeback authority;
  - answers are grounded preview data.
- Priority Actions rail uses a non-interactive row affordance:
  - `Source-owned`
- Document Control disabled action chips are disabled buttons with no handler/href, but the user-facing reason is primarily in `title`, not visible nearby body copy.
- External Platforms and Procore are display/reference surfaces with no anchor launches; copy can be more explicit about source ownership and read-only posture.

## Target copy doctrine

Apply concise, visible copy that answers:

1. **Condition** — why the item is read-only, preview, or non-executable here.
2. **Impact** — what the user can learn from it on Project Home.
3. **Next step / owner** — where the source action occurs or who owns it.

Use construction-specific language where accurate:

- approvals;
- checkpoints;
- submittals;
- RFIs;
- permits;
- inspections;
- constraints;
- buyout;
- readiness gates;
- document control;
- closeout;
- warranty;
- source records;
- responsible persona / owner;
- source system;
- project record.

Do **not** add walls of text. Prefer short support lines, `aria-describedby` reason nodes, and concise metadata copy.

## Required implementation approach

### 1. Priority Actions rail copy

File:

```text
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx
```

Current row affordance text is `Source-owned`. Improve it without introducing any executable behavior.

Required posture:

- Keep row affordance as a non-interactive `<span>`.
- Keep `data-pcc-priority-rail-disabled-action`.
- Do not add row-level buttons, anchors, hrefs, `onClick`, or workflow handlers.
- Suggested visible text:
  - `Source-owned · act in owning module`
  - or `Source-owned · complete in source workflow`

Keep it short enough not to bloat the compact 5-row rail.

Update tests to assert the exact new row affordance copy and that it remains a span.

### 2. Document Control disabled action reason copy

File:

```text
apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx
```

Current disabled Microsoft-lane action chips are true disabled buttons, but their reason copy is mostly in a `title`. Add visible, nearby reason copy and/or `aria-describedby` linkage so the reason is not tooltip-only.

Required posture:

- Keep the action elements as disabled buttons.
- Keep no inline handler, no href, no anchor.
- Preserve `data-pcc-doc-action`, `data-pcc-doc-action-execution-state`, and disabled posture.
- Add a visible reason element inside each source tile or action list, for example:
  - `Preview only — complete document actions in Microsoft/SharePoint. PCC shows source posture only.`
- Add a stable marker such as:
  - `data-pcc-doc-action-reason`
- Prefer linking disabled buttons to the reason with `aria-describedby` if practical without making IDs brittle.
- Keep external-lane copy bounded:
  - `Visibility only — open source systems outside PCC.`
  - Do not render external launch URLs.

### 3. Procore source-boundary copy

File:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeProcoreSnapshotCard.tsx
```

Add one concise source-boundary line in the preview body:

Suggested copy:

```text
Read-model snapshot only — Procore remains the system of record; no PCC writeback from this card.
```

Required posture:

- Do not add links.
- Do not add actions.
- Do not change Procore state mapping.
- Do not change tier/region/footprint.
- Do not imply PCC is a full Procore mirror.
- Do not say “live system feeds.”

Add a stable marker such as:

```tsx
data-pcc-procore-source-boundary
```

### 4. External Platforms source-boundary copy

File:

```text
apps/project-control-center/src/surfaces/projectHome/PccExternalSystemsCard.tsx
```

Add one compact source-boundary line or row metadata cue explaining that this is reference/visibility posture only.

Suggested copy:

```text
Reference only — PCC shows mapping and health posture; source-system actions stay outside Project Home.
```

Required posture:

- Do not add links.
- Do not add buttons.
- Keep no anchors/hrefs.
- Keep system rows display-only.
- Do not add route/tab/workspace markers.

Add a stable marker such as:

```tsx
data-pcc-external-source-boundary
```

### 5. Missing Configurations owner/next-step copy

File:

```text
apps/project-control-center/src/surfaces/projectHome/PccMissingConfigurationsCard.tsx
```

Current rows include owner and required-before. Add a concise next-step/source-action cue that does not become a button.

Suggested copy:

```text
Next step: setup owner resolves this in the source configuration workflow.
```

If more specific wording can be derived safely from existing fields, use it. Do not invent system-specific URLs or owners beyond the existing typed fields.

Required posture:

- No buttons.
- No anchors.
- No hrefs.
- No source-system mutation.
- Preserve severity pill behavior.
- Preserve state handling.

Add a stable marker such as:

```tsx
data-pcc-missing-config-next-step
```

### 6. Project Intelligence / command summary HBI cue

Files:

```text
apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.ts
apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.test.ts
```

Refine the command-summary HBI cue from:

```text
HBI advisory · no writeback
```

to bounded authority language that remains compact, for example:

```text
HBI advisory · no decisions or writeback
```

or:

```text
HBI advisory · no approval/writeback authority
```

Required posture:

- Keep the helper pure.
- Do not add new inputs or fabricated counts.
- Do not alter source-label mapping except to preserve the already-correct `Source: PCC read-model available`.
- Add tests proving:
  - the cue contains `HBI advisory`;
  - the cue contains no `approve`, `submit`, `sync`, `create`, `delete`, `modify`, `complete`, or `writeback` mutation claim except as explicitly negated/bounded;
  - `Source: live system feeds` remains absent.

### 7. Ask HBI panel disclaimer

File:

```text
apps/project-control-center/src/surfaces/unifiedLifecycle/components/AskHbiGroundingPreviewPanel.tsx
```

The Prompt 05 disclaimer is already good. Do **not** change it unless a test reveals exact wording drift.

Allowed change:

- None expected.

Tests may still assert it contains:
- `not the source of truth`;
- `no decision`;
- `approval`;
- `writeback`;
- `grounded`;
- `preview`.

### 8. Add a Project Home content-authority test block

File:

```text
apps/project-control-center/src/tests/PccProjectHome.test.tsx
```

Add targeted tests for the copy contract:

- Priority Actions row affordance text is the new bounded source-owned copy and remains a `<span>`.
- Document Control disabled actions have visible reason copy and disabled/no-handler/no-href posture.
- Procore card renders `data-pcc-procore-source-boundary` and contains:
  - `Procore remains the system of record`
  - `no PCC writeback`
- External Platforms card renders `data-pcc-external-source-boundary` and contains:
  - `Reference only`
  - `source-system actions`
- Missing Configurations rows render `data-pcc-missing-config-next-step` with owner/next-step language.
- Project Home text does not contain forbidden autonomous HBI claims.

Suggested forbidden-claims helper:

```ts
const FORBIDDEN_HBI_MUTATION_CLAIM =
  /\b(?:hbi|ai)\b(?![^.\n]*(?:not|no|does not|cannot|is not authorized to))[^.\n]*(?:approves?|submits?|syncs?|writes? back|creates?|deletes?|modifies?|completes?)/i;
```

Use this as a guardrail, not as a replacement for the positive assertions.

### 9. Add or update narrower component tests where useful

Expected test files may include:

```text
apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.test.ts
apps/project-control-center/src/tests/AskHbiGroundingPreviewPanel.test.tsx
```

Do not over-test generic text. Lock the authority/source-boundary obligations that are most likely to regress.

## Expected files to change

Expected product files:

```text
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx
apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeProcoreSnapshotCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccExternalSystemsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccMissingConfigurationsCard.tsx
apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.ts
```

Expected test files:

```text
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.test.ts
```

Optional test file only if needed:

```text
apps/project-control-center/src/tests/AskHbiGroundingPreviewPanel.test.tsx
```

Do not edit unless a validated blocker requires it:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeUnifiedLifecycleSection.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeAskHbiSection.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailViewModel.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.module.css
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
```

Absolutely do not edit:

- shared primitives;
- shell/tabs/hero;
- package files;
- lockfile;
- manifests;
- SPFx packaging;
- blueprint docs;
- planning docs;
- unrelated `e2e/pcc-live` files.

## Required validation

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
grep -R "Source: live system feeds" apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.ts || echo "gate ok — no matches"

pnpm --filter @hbc/spfx-project-control-center check-types

( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts projectCommandSummary )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccProjectHome )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccApp.optIn )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccCardTierContract )

pnpm exec prettier --check \
  apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx \
  apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx \
  apps/project-control-center/src/surfaces/projectHome/PccProjectHomeProcoreSnapshotCard.tsx \
  apps/project-control-center/src/surfaces/projectHome/PccExternalSystemsCard.tsx \
  apps/project-control-center/src/surfaces/projectHome/PccMissingConfigurationsCard.tsx \
  apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.ts \
  apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.test.ts \
  apps/project-control-center/src/tests/PccProjectHome.test.tsx

git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If `AskHbiGroundingPreviewPanel.test.tsx` is edited, add:

```bash
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts AskHbiGroundingPreviewPanel )
pnpm exec prettier --check apps/project-control-center/src/tests/AskHbiGroundingPreviewPanel.test.tsx
```

If broader test impact is plausible, run:

```bash
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts )
```

No hosted Playwright is required for Prompt 06. Hosted/tenant proof remains OPERATOR-PENDING until Prompt 07.

## Commit posture

Commit subject:

```text
feat(pcc/project-home): clarify source and HBI authority copy (Wave 15A wave-b6 Prompt 06)
```

Commit description should include:

- baseline: accepted Prompt 05 at `9133bec436a7d12d249cbd2d99533342133d208e`;
- copy surfaces changed;
- exact source-boundary / disabled-reason obligations added;
- HBI command cue refined;
- Prompt 02 bounded source label preserved;
- Prompt 03 compact rail behavior preserved;
- Prompt 04/05 card order preserved;
- fixture path remains 10 cards;
- read-model path remains 16 cards;
- no routes/tabs/surface markers added;
- no shared primitives, package files, lockfile, manifests, SPFx packaging, blueprint docs, planning docs, or unrelated e2e files changed;
- lockfile MD5 reconfirmed as `00570e10e3dc9015188ba503ea996943`;
- canonical `Co-Authored-By` line.

## Closeout response

Return:

```text
Files changed:
Repo-truth confirmed:
Implementation summary:
Copy obligations added:
Prompt 02/03/04/05 preservation:
Tests run:
Validation results:
Lockfile/package/manifest status:
No-execution/source-boundary status:
Known residual risks:
Commit:
```

## Known residual risks to report if still true

- Hosted/tenant proof remains OPERATOR-PENDING.
- Content evidence findings are improved by source/copy tests, but final proof requires Prompt 07/08 evidence regeneration.
- Tooltip-only disabled copy should be avoided; if any remains due to constraints, report it explicitly.
- Copy remains deliberately compact; deeper workflow instructions belong in owning module surfaces, not the Project Home first fold.
