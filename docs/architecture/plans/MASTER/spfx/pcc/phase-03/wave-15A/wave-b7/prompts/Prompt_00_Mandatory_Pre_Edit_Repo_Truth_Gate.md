# Updated Prompt 00 — Mandatory Pre-Edit Repo-Truth Gate for Phase 2 Shell Header Consolidation

## Objective

Perform a no-edit repo-truth gate before Phase 2 implementation. The purpose is to verify that current `main` still matches the audit assumptions, identify any stale ownership/test/comment assumptions that would affect Prompt 01, and prevent stale instructions from causing incorrect edits.

This prompt is report-only. Do not change files.

This updated Prompt 00 is intentionally stricter than the original package prompt because repo truth shows that the active-panel ownership move will create a temporary coexistence period:

- shell `main[role="tabpanel"]` becomes the semantic active-panel owner;
- card-level `data-pcc-active-surface-panel` markers may remain temporarily as compatibility markers;
- tests and Playwright selectors must not confuse those two meanings.

## Mandatory Opening Instruction

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Scope Control

This is a pre-edit gate only.

Do not:

- edit files;
- stage files;
- run formatters;
- generate implementation code;
- remove duplicate top-level header cards;
- implement a Modules launcher;
- introduce active module state;
- change package dependencies, manifests, package-solution files, or lockfile;
- run broad refactors.

## Required Checks

Perform all checks below before proposing Prompt 01 execution.

---

## 1. Confirm Local Git / Lockfile Baseline First

Run:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Report:

- branch name;
- HEAD SHA;
- dirty files;
- whether any dirty files are relevant to Prompt 00 / Prompt 01;
- lockfile hash.

Hard stop if relevant files are dirty unless you can clearly prove they are expected and unrelated.

Relevant files include, at minimum:

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
apps/project-control-center/config/package-solution.json
package.json
pnpm-lock.yaml
```

---

## 2. Confirm `PccShell.tsx` Main Markup

Inspect:

```text
apps/project-control-center/src/shell/PccShell.tsx
```

Confirm:

- `ACTIVE_PANEL_ID` value;
- `PccHorizontalTabs` receives `panelId={ACTIVE_PANEL_ID}`;
- `main` currently has:

```tsx
id={ACTIVE_PANEL_ID}
role="tabpanel"
aria-labelledby={`pcc-tab-${activeSurfaceId}`}
className={styles.canvas}
data-pcc-canvas=""
```

Confirm whether `main` already has or still lacks:

```tsx
data-pcc-active-surface-panel={activeSurfaceId}
```

Report the exact current posture:

```text
Shell semantic active-panel owner currently: absent / already implemented / drifted
```

If `main` already has the marker, do not recommend Prompt 01 as originally scoped. Recommend a narrowed validation/comment/test prompt instead.

---

## 3. Confirm Tab ARIA and Selection Contract

Inspect:

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
```

Confirm every tab still has:

- `id={`pcc-tab-${surfaceId}`}`;
- `role="tab"`;
- `type="button"`;
- `aria-selected`;
- `aria-controls={panelId}`;
- `data-pcc-tab-id={surfaceId}`;
- active/inactive tab state marker;
- click handling;
- keyboard handling for ArrowRight, ArrowLeft, Home, End, Enter, and Space.

Report any drift because Prompt 01 must preserve this contract.

---

## 4. Search Active-Panel Marker Usage

Run targeted searches:

```bash
rg -n "dataActiveSurfacePanel|data-pcc-active-surface-panel" apps/project-control-center/src e2e/pcc-live docs --glob '!**/node_modules/**'
rg -n "getActiveBento|active-panel card|active-panel parent|must mount its active panel|active-panel carrier" apps/project-control-center/src/tests apps/project-control-center/src/shell
```

Classify results into:

- production layout primitive;
- production surface cards/components;
- shell/router comments;
- unit tests;
- Playwright/e2e;
- docs/plans/evidence.

For every production card/component carrying `dataActiveSurfacePanel`, list:

```text
file path
component/card name if clear
surface id carried
whether it appears to be the first/command/header card
```

Do not require removal in Prompt 00. This is inventory only.

---

## 5. Identify Stale Card-Owner Test Assumptions

Inspect tests that reference active-panel markers, especially:

```text
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.invariants.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx
```

For each file that references `data-pcc-active-surface-panel`, classify the dependency:

```text
presence-only
shell-owner already
card-owner assumption
broad selector that will become ambiguous after shell marker is added
direct-child invariant unrelated to active-panel ownership
```

You must specifically answer:

1. Does `PccCardTierContract.test.tsx` still use a broad selector like:

   ```ts
   container.querySelector(`[data-pcc-active-surface-panel="${surfaceId}"]`)
   ```

2. Does any helper still assume the selected active-panel element’s `parentElement` is `[data-pcc-bento-grid]`?

3. Does any test still describe the marker as the “active-panel card” or “active-panel carrier” rather than a temporary compatibility marker?

4. Does any test assert exactly one broad `[data-pcc-active-surface-panel]` element across the whole rendered tree?

5. Which stale test logic must be repaired in Prompt 01 versus deferred to later prompts?

Expected Prompt 01 risk posture:

- Shell-owner tests belong in Prompt 01.
- Immediate stale selector repairs that would break the full local test suite after adding the shell marker belong in Prompt 01.
- Broader Playwright evidence improvements can remain Prompt 05 unless current local tests depend on them.

---

## 6. Identify Stale Source Comments

Inspect:

```text
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

Search for claims similar to:

```text
only one element in the rendered tree carries `data-pcc-active-surface-panel`
```

Classify:

- no stale comment found;
- stale comment found and should be updated in Prompt 01 as a narrow comment-only correction;
- runtime behavior drift found.

Do not edit the comment in Prompt 00.

The expected Phase 2 posture after Prompt 01 is:

- shell `main` semantically owns the active-panel marker;
- card-level markers may remain temporarily for compatibility;
- comments must not claim there is only one broad marker in the rendered tree if compatibility markers remain.

---

## 7. Confirm Playwright Selector Dependency

Inspect:

```text
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
```

Confirm whether Playwright currently:

- only checks selector presence/count;
- checks broad `[data-pcc-active-surface-panel="<surfaceId>"]`;
- depends on marker being a bento card;
- verifies `main[role="tabpanel"]`;
- records owner tag/role/id in evidence;
- can tolerate local source being ahead of tenant-deployed package version.

Report:

```text
Playwright dependency: presence-only / broad-marker ambiguous / card-owner dependent / shell-owner verified
Prompt impact: Prompt 01 / Prompt 05 / no change needed
```

Do not modify Playwright in Prompt 00.

---

## 8. Confirm Existing Shell Test Coverage

Inspect:

```text
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

Report whether it already verifies:

- one canvas marker;
- canvas element is `MAIN`;
- `main` has `id="pcc-active-surface-panel"`;
- `main` has `role="tabpanel"`;
- `main` has `aria-labelledby="pcc-tab-project-home"` by default;
- every tab has `aria-controls="pcc-active-surface-panel"`;
- clicking Documents updates `aria-labelledby`;
- clicking Site Health is already covered or missing;
- shell active-panel marker is already covered or missing.

Identify exact Prompt 01 additions needed.

---

## 9. Confirm Package-Solution / Manifest Posture

Check whether any of the following exist:

```text
config/package-solution.json
apps/project-control-center/config/package-solution.json
sharepoint/config/package-solution.json
```

Search for:

```bash
rg -n "package-solution.json|hb-intel-project-control-center|1.0.0." config apps sharepoint tools e2e docs --glob '!**/node_modules/**'
```

Classify results as:

- present and in scope;
- moved;
- absent;
- docs/tooling reference only;
- irrelevant to Phase 2.

You must specifically report:

```text
root config/package-solution.json: present / absent
apps/project-control-center/config/package-solution.json: present / absent / version
sharepoint/config/package-solution.json: present / absent
Prompt 01 package-solution edit allowed: no
```

Do not modify packaging files.

---

## 10. Confirm Package / Dependency / Manifest Safety

Inspect only as needed:

```text
package.json
apps/project-control-center/package.json
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/**/manifest.json
pnpm-lock.yaml
```

Report whether Prompt 01 should modify any of them.

Expected answer:

```text
No package, dependency, lockfile, manifest, or package-solution edits are required for Prompt 01.
```

If repo truth contradicts that, stop and explain.

---

## 11. Confirm Updated Prompt 01 Compatibility

Before recommending Prompt 01 execution, compare the repo-truth findings against the updated Prompt 01 requirements.

Specifically confirm whether Prompt 01 must include:

- adding `data-pcc-active-surface-panel={activeSurfaceId}` to shell `main`;
- adding shell-owner tests in `PccShell.responsive.test.tsx`;
- repairing stale broad selector logic in `PccCardTierContract.test.tsx`;
- making a narrow comment-only correction in `PccSurfaceRouter.tsx`;
- avoiding shared primitive edits;
- avoiding duplicate header-card removal;
- avoiding package/lockfile/manifest drift.

---

## 12. Required Output

Return:

```markdown
## Prompt 00 Repo-Truth Gate

## Git / Lockfile Baseline
- Branch:
- HEAD:
- Lockfile hash:
- Dirty files:
- Relevant dirty-file concerns:

## Current Shell Markup
- `ACTIVE_PANEL_ID`:
- `PccHorizontalTabs.panelId`:
- `main` id/role/aria-labelledby/canvas:
- shell `data-pcc-active-surface-panel`:
- Shell semantic active-panel owner currently:

## Tab ARIA Contract
- Tablist:
- Tab id:
- Tab role:
- Tab selected state:
- Tab controls:
- Keyboard behavior:
- Drift concerns:

## Marker Usage Inventory
### Production layout primitive
### Production surface cards/components
### Shell/router comments
### Unit tests
### Playwright/e2e
### Docs/plans/evidence

## Stale Card-Owner Test Assumptions
- Broad active-panel selectors:
- Parent-is-bento assumptions:
- “Active-panel card” language:
- Exact single broad-marker assertions:
- Required Prompt 01 test repairs:
- Deferrable later-prompt test/evidence items:

## Stale Source Comments
- `PccSurfaceRouter.tsx` stale single-marker comment:
- Required Prompt 01 comment repair:

## Playwright Selector Dependency
- Dependency classification:
- Card-owner dependency:
- Shell-owner verification:
- Prompt impact:

## Existing Shell Test Coverage
- Canvas marker:
- Main element:
- ID/role/aria-labelledby:
- Tab `aria-controls`:
- Documents click:
- Site Health click:
- Shell active-panel marker:
- Required Prompt 01 additions:

## Package-Solution Posture
- root `config/package-solution.json`:
- `apps/project-control-center/config/package-solution.json`:
- `sharepoint/config/package-solution.json`:
- Package-solution references:
- Prompt 01 packaging edit allowed:

## Package / Dependency / Manifest Safety
- `package.json`:
- `apps/project-control-center/package.json`:
- SPFx manifests:
- `pnpm-lock.yaml`:
- Prompt 01 edit allowed:

## Drift / Dirty File Concerns

## Prompt 01 Readiness Recommendation
Approved for updated Prompt 01 / Do not proceed yet

## Prompt 01 Required Scope Confirmed
- ...

## Prompt 01 Scope Warnings
- ...
```

## Recommendation Rules

Return **Approved for updated Prompt 01** only if:

- current shell markup still lacks the shell active-panel marker and otherwise matches assumptions;
- tab ARIA contract is intact;
- stale card-owner tests are identified and assigned to Prompt 01 repair;
- stale router comment is identified and assigned to Prompt 01 repair if present;
- Playwright is classified accurately;
- package-solution path/version posture is documented;
- no relevant dirty files block execution.

Return **Do not proceed yet** if:

- relevant files are dirty and unexplained;
- shell markup already changed materially;
- tab ARIA contract drifted;
- the repo state makes Prompt 01 unsafe without rewriting;
- package/lockfile/manifest drift is present and unexplained.

## Completion Standard for Prompt 00

Prompt 00 is complete when it produces a factual, repo-backed no-edit report that can be used to authorize or stop the updated Prompt 01 execution without re-opening closed Phase 2 decisions.
