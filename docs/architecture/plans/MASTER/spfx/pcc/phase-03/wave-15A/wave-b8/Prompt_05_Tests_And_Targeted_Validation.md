# Prompt 05 — Tests and Targeted Validation v2

## Mandatory Efficiency Directive

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Role

You are the local code agent executing **Prompt 05 — Tests and Targeted Validation** for PCC Phase 03 / Wave 15A wave-b8.

This prompt is the **Phase 03 validation and coverage-closeout gate**. It is not an implementation prompt, not a runtime-refactor prompt, not a visual redesign prompt, and not a Phase 04 duplicate-card-removal prompt.

The expected outcome is one of:

1. no file changes, with a complete coverage/validation report; or
2. small targeted test-only additions if a verified coverage gap remains; or
3. a narrow runtime fix only if an existing Phase 03 validation test fails and the defect is directly tied to Phase 03 header behavior.

No package, manifest, lockfile, SPFx package-solution, dependency, live integration, command routing, active module, or duplicate-card changes are authorized.

---

## Objective

Confirm that Phase 03 conditional command-header work is fully covered and validated after Prompts 01–04.

Specifically, verify that current tests cover:

- deterministic shell header metadata for all eight MVP surfaces;
- active-surface conditional rendering in the shell header;
- shell `tab` / `tabpanel` semantics and active-panel ownership;
- read-only / preview / no-writeback authority boundaries;
- command-search false-affordance prevention;
- responsive metadata-zone rendering across all eight supported modes;
- bento direct-child invariants and compatibility-marker posture;
- negative scope guardrails: no Modules launcher, no command routing, no active module state, no duplicate-card removal.

Do not duplicate coverage already added in Prompts 02–04. Prefer a coverage matrix and validation report over new tests unless a specific gap is proven.

---

## Current Baseline to Respect

Prompt 02 landed:

```text
0a018601591a2915b7b12a89f0fb05fcd82f28bb
feat(pcc): add no-execution and launch-context shell hero cues
```

Prompt 03 landed:

```text
6b5da69d0227449c262ac0ca61150b72881de22b
test(pcc): tighten hero-band and shell metadata assertions
```

Prompt 04 execution/test commit landed:

```text
3463e94cc1a63c66c1f92dea4bb62edff28a0635
test(pcc): tighten hero region a11y and 8-mode shell metadata zones
```

Prompt 04 v2 documentation/manifest update also exists:

```text
968acb965d379805bd7f94c93b953a8864d97ced
docs(pcc): update Prompt 04 header a11y semantics manifest v2.0
```

Use the latest local `HEAD` as repo truth, but confirm that the Prompt 04 execution/test commit is reachable from `HEAD`.

---

## Required First Actions

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log -1 --oneline
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git merge-base --is-ancestor 3463e94cc1a63c66c1f92dea4bb62edff28a0635 HEAD; echo "p04_execution_ancestor=$?"
```

Stop and report drift if:

- working tree is dirty in any Phase 03 target file;
- branch is not `main`;
- Prompt 04 execution commit `3463e94cc1a63c66c1f92dea4bb62edff28a0635` is not reachable from `HEAD`;
- package, lockfile, manifest, or `apps/project-control-center/config/package-solution.json` files have unapproved drift;
- shell active panel no longer uses `main[role="tabpanel"][data-pcc-active-surface-panel]`;
- duplicate/header cards were removed or demoted before Phase 04;
- command-search became interactive;
- Phase 03 metadata source-of-truth is missing or no longer exhaustive.

Non-blocking unrelated doc drift may be classified and reported, but do not silently ignore it.

---

## Files to Inspect

Inspect only the files necessary to build the coverage matrix and validation report. Do not re-read files still in active context unless repo truth has changed.

### Required test files

```text
apps/project-control-center/src/tests/projectShellViewModel.test.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
```

### Required source/reference files

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
packages/models/src/pcc/PccMvpSurfaces.ts
apps/project-control-center/config/package-solution.json
package.json
apps/project-control-center/package.json
```

### Optional Playwright files

Inspect these only if you need to confirm selector posture or if related selectors were touched:

```text
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
e2e/pcc-live/pcc-live.evidence-writer.ts
```

Do not edit Playwright files in Prompt 05 unless a Phase 03 selector regression is discovered and explicitly justified.

---

## Coverage Matrix to Complete

For each row below, report:

- **Covered / Partially Covered / Gap / Not Applicable**
- test file(s) providing coverage;
- exact assertion class, not necessarily line numbers;
- whether any action was taken in Prompt 05.

### A. Header metadata

Confirm coverage for:

1. all eight `PccMvpSurfaceId` values have metadata;
2. every `surfaceSummaryItems[]` entry has non-empty `id`, `label`, and `value`;
3. every `surfaceCues[]` entry has non-empty `id`, `label`, and `value`;
4. every surface has non-empty `readOnlyCue`;
5. summary tones are valid;
6. summary IDs are unique per surface;
7. cue IDs are unique per surface;
8. `project-readiness.no-execution` cue is locked;
9. `external-systems.launch-context` cue is locked;
10. metadata copy is deterministic and contains no live URLs;
11. authority copy prohibits affirmative writeback, approval execution, repair execution, file operations, settings mutation, external sync, command routing, or autonomous HBI decisions while allowing negated boundary language.

### B. Conditional header rendering

Confirm coverage for:

1. every active tab updates shell active-surface ID;
2. every active tab updates the hero secondary title;
3. every active tab updates rendered summary item IDs to match active-surface metadata;
4. every active tab updates rendered cue IDs to match active-surface metadata;
5. every active tab updates read-only cue text to match active-surface metadata;
6. `project-readiness.no-execution` cue renders in the hero;
7. `external-systems.launch-context` cue renders in the hero;
8. Project Home source/HBI/read-only posture is represented through existing header metadata;
9. Approvals copy includes no approval authority;
10. Documents copy includes no file operation/writeback authority;
11. External Systems copy includes launch-only/no-sync/no-writeback posture;
12. Control Center Settings copy includes no setting mutation authority;
13. Site Health copy includes no repair acknowledgement/execution authority.

### C. Accessibility and false affordance

Confirm coverage for:

1. hero root has `role="region"` and accessible label;
2. summary/cue/read-only zones render visible text;
3. summary/cue/read-only zones have no interactive descendants;
4. command-search preview has no interactive/focusable descendants;
5. command-search visible copy communicates preview/unavailable posture;
6. no clickable `div`, fake enabled controls, or disabled action without reason copy were introduced;
7. tablist/tab/tabpanel semantics are intact;
8. keyboard navigation on tabs remains valid.

### D. Responsive behavior

Confirm coverage for all eight modes:

```text
phone
tabletPortrait
tabletLandscape
smallLaptop
standardLaptop
largeLaptop
desktop
ultrawide
```

For each mode, confirm:

- hero marker renders;
- expected density renders;
- summary zone renders;
- cue zone renders;
- read-only cue renders;
- command-search slot renders;
- expected command-search variant is covered by existing unit tests or shell tests.

### E. Shell / tabpanel

Confirm coverage for:

1. shell `main[role="tabpanel"]` owns the semantic active-surface marker;
2. `aria-labelledby` updates with active tab;
3. tab `aria-controls` points to `pcc-active-surface-panel`;
4. shell active panel ID remains stable;
5. card-level `dataActiveSurfacePanel` remains compatibility only;
6. broad selector count and shell selector count expectations remain deliberate.

### F. Bento direct-child and card tier contracts

Confirm coverage for:

1. no wrapper breaks direct-child relationship between `[data-pcc-bento-grid]` and cards;
2. cards remain direct children of the bento grid;
3. card tiers/regions/footprints remain contract-tested;
4. card-level active-surface markers remain compatibility only;
5. no nested-card regression is introduced.

### G. Negative scope checks

Confirm current repo and tests do not introduce:

1. full Modules launcher behavior;
2. command routing;
3. active module state;
4. live fetches, tenant reads, Graph/PnP/Procore calls, or external sync;
5. duplicate/header-card removal or demotion;
6. Project Home count/fact migration into shell metadata;
7. Site Health Overall/last-run/failing-check migration into shell metadata;
8. package, dependency, lockfile, manifest, or package-solution drift.

---

## Authorized Changes

### Default expectation

No source changes are expected.

### Test changes

Test changes are allowed only if the coverage matrix identifies a real gap not already closed by Prompts 02–04.

If adding tests:

- prefer extending existing test files;
- keep additions compact and deterministic;
- do not create new fixtures unless unavoidable;
- do not duplicate equivalent coverage already present;
- do not add brittle pixel/layout assertions;
- do not touch Playwright unless selectors/evidence code are part of the gap.

### Runtime changes

Runtime edits are strongly discouraged and are allowed only if:

- an existing or newly added Phase 03 test fails;
- the failure proves a Phase 03 regression;
- the fix is narrow and directly tied to shell header behavior;
- the fix does not change package, lockfile, manifest, duplicate-card, command-routing, active-module, or metadata-scope boundaries.

If runtime source must be edited, stop after the failing validation result and report the proposed fix before editing unless the fix is trivial and purely corrective.

---

## Required Validation

Run in this order:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If no files changed, run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If formatting fails on changed files, make surgical formatting corrections only to changed files, then re-run:

```bash
pnpm exec prettier --check <changed-files>
pnpm --filter @hbc/spfx-project-control-center test
git diff --check
```

Do not run broad `prettier --write` over the repo.

---

## Playwright Scope

Do not run full live evidence unless files/selectors were touched or the auditor/user asks.

If Playwright selectors, live evidence files, or e2e behavior were touched, run:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

If only unit/integration tests changed, do not run live Playwright unless requested.

---

## Package / Lockfile / Manifest Audit

Confirm unchanged:

```text
package.json
apps/project-control-center/package.json
pnpm-lock.yaml
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/**/*.manifest.json
```

Also confirm no new stale root-level reference to:

```text
config/package-solution.json
```

Use only `apps/project-control-center/config/package-solution.json` for PCC package-solution references.

---

## Commit Guidance

Do not commit automatically unless the user separately authorizes a commit after reviewing validation.

If no files change, do not commit.

If files change, provide the full Prompt 05 completion report and include a proposed commit summary/description for user approval.

---

## Required Completion Response

```markdown
## Prompt 05 Complete

## Files Changed
- State `None` if no changes were required.

## Test Coverage Matrix
| Area | Coverage Status | Test / Source Evidence | Prompt 05 Action |
|---|---|---|---|
| Header metadata | ... | ... | ... |
| Conditional rendering | ... | ... | ... |
| Accessibility / false affordance | ... | ... | ... |
| Responsive behavior | ... | ... | ... |
| Shell / tabpanel | ... | ... | ... |
| Bento direct-child / card tiers | ... | ... | ... |
| Negative scope checks | ... | ... | ... |

## Runtime Fixes, If Any
- State `None` unless runtime source changed.

## Validation Results
- `git status --short` before:
- `md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml` before:
- `check-types`:
- `test`:
- `prettier --check <changed-files>` if applicable:
- `git diff --check` if applicable:
- lockfile hash after:
- `git status --short` after:

## Package / Lockfile / Manifest Audit
- `package.json`:
- `apps/project-control-center/package.json`:
- `pnpm-lock.yaml`:
- `apps/project-control-center/config/package-solution.json`:
- SPFx manifests:
- stale `config/package-solution.json` references:

## Remaining Phase 03 Issues
- State `None` if the coverage matrix is complete and validation passes.
- Otherwise list exact unresolved items and owner prompt.

## Ready for Prompt 06?
- Answer `Yes` or `No`.
- If yes, state whether Prompt 06 should be closeout-only, handoff-only, or both.
```
