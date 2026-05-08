# Prompt 02 — Surface Command Header Metadata v2

## Mandatory Efficiency Directive

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Role

You are the local code agent implementing **Prompt 02 — Surface Command Header Metadata** for PCC Phase 03.

This prompt is intentionally narrow. You are not redesigning the shell, not expanding the metadata schema, not removing duplicate cards, and not implementing command behavior. You are applying the Prompt 01 metadata readiness decision and hardening the tests around deterministic surface-command-header metadata.

---

## Objective

Implement the **Variant B — handoff-driven additive** metadata update approved after Prompt 01:

1. Add one deterministic surface cue to `project-readiness`.
2. Add one deterministic surface cue to `external-systems`.
3. Preserve the existing metadata model:
   - `surfaceSummaryItems`
   - `surfaceCues`
   - `readOnlyCue`
4. Preserve all existing shell, tab, bento, command-search, package, lockfile, manifest, and duplicate-card behavior.
5. Update targeted tests so the new cue IDs and values are locked by repo-truth tests.

No schema change is authorized by this prompt.

---

## Prompt 01 Baseline to Respect

Prompt 01 concluded:

- Working tree was clean.
- Phase 2 shell ownership remained intact.
- `apps/project-control-center/src/shell/surfaceHeaderMetadata.ts` remains the metadata source of truth.
- Current metadata already covers all eight MVP surfaces.
- Six of eight surfaces remain unchanged for Prompt 02.
- Only two cue additions are recommended for Prompt 02:
  - `project-readiness` → add `no-execution` cue.
  - `external-systems` → add `launch-context` cue.
- Project Home facts/counts remain Phase 04 retained.
- Site Health `Overall` metric remains Phase 04 deferred.
- Duplicate/header-card removal remains Phase 04 only.

If current repo truth contradicts any of the above, stop and report drift before editing.

---

## Required First Actions

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log -1 --oneline
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Then inspect only the files needed for this prompt unless current repo truth is stale, missing, or contradictory:

```text
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/tests/projectShellViewModel.test.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
packages/models/src/pcc/PccMvpSurfaces.ts
apps/project-control-center/config/package-solution.json
```

Confirm:

- `surfaceHeaderMetadata.ts` still exports `PCC_SHELL_SURFACE_HEADER_METADATA`.
- Metadata is still keyed as `Readonly<Record<PccMvpSurfaceId, IPccShellSurfaceHeaderMetadata>>`.
- `PccProjectHeroBand.tsx` still renders `viewModel.surfaceCues` array-driven.
- `projectShellViewModel.ts` still passes metadata through without requiring schema changes.
- `apps/project-control-center/config/package-solution.json` exists and must not be edited.

---

## Authorized Runtime Source Change

Edit only:

```text
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
```

### 1. Add Project Readiness cue

In:

```ts
PCC_SHELL_SURFACE_HEADER_METADATA['project-readiness'].surfaceCues
```

Add this cue after the existing `module-boundary` cue:

```ts
{
  id: 'no-execution',
  label: 'Posture',
  value: 'No checklist completion or evidence execution from this header',
}
```

### 2. Add External Systems cue

In:

```ts
PCC_SHELL_SURFACE_HEADER_METADATA['external-systems'].surfaceCues
```

Add this cue after the existing `integration-boundary` cue:

```ts
{
  id: 'launch-context',
  label: 'Boundary',
  value: 'Launch links open the source system in a new tab',
}
```

### 3. Do not change anything else in metadata

Do not alter the existing `surfaceSummaryItems`, `readOnlyCue`, surface descriptions, display names, model interfaces, or other surface cues unless a compile/test failure proves a narrow correction is required.

---

## Authorized Test Changes

Update only the minimum required tests.

Expected candidate files:

```text
apps/project-control-center/src/tests/projectShellViewModel.test.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

### Required test coverage

Add or update tests proving:

1. `project-readiness` includes cue ID `no-execution`.
2. `project-readiness` cue text includes:
   - `No checklist completion`
   - `evidence execution`
   - `from this header`
3. `external-systems` includes cue ID `launch-context`.
4. `external-systems` cue text includes:
   - `Launch links open`
   - `source system`
   - `new tab`
5. Cue IDs remain unique per surface.
6. Summary item IDs remain unique per surface.
7. Cue values do not imply command execution, approval execution, repair execution, external sync, file operation, setting mutation, or live writeback.
8. Negated boundary language such as `no writeback`, `No sync`, `No access changes`, `No file moves`, and `No setting changes` is valid and must not be treated as forbidden authority language.

### Required integration hardening

If `PccShell.responsive.test.tsx` does not already include an all-eight-surface metadata switching integration test, add one targeted test that:

- renders `<PccApp forceMode="standardLaptop" />`;
- iterates through all `PCC_MVP_SURFACE_IDS`;
- clicks the matching tab for each surface;
- asserts:
  - selected tab is active;
  - shell `main[role="tabpanel"]` has `data-pcc-active-surface-panel` equal to the surface ID;
  - hero secondary title equals `PCC_MVP_SURFACES[id].displayName`;
  - hero summary item count equals `PCC_SHELL_SURFACE_HEADER_METADATA[id].surfaceSummaryItems.length`;
  - hero cue count equals `PCC_SHELL_SURFACE_HEADER_METADATA[id].surfaceCues.length`;
  - hero read-only cue text equals `PCC_SHELL_SURFACE_HEADER_METADATA[id].readOnlyCue`.

Keep this as a single compact looped test. Do not rewrite the shell test suite.

---

## Explicitly Prohibited

Do **not**:

- remove, demote, rename, reorder, or modify duplicate/header cards;
- edit `PccProjectIntelligenceCard`;
- edit `PccDocumentsHeaderCard`;
- edit `PccTeamAccessHeaderCard`;
- edit `PccProjectReadinessSurface`;
- edit `PccApprovalsSurface`;
- edit `PccExternalSystemsLaunchPadHeaderCard`;
- edit `PccExternalSystemsHeaderCard`;
- edit `PccControlCenterSettingsSurface`;
- edit `PccSiteHealthOverviewCard`;
- add Project Home facts/counts to shell metadata;
- add Site Health `Overall` metric to shell metadata;
- add `surfaceSubtitle`, `surfaceStatusFacts`, command actions, or any new metadata model field;
- edit `projectShellViewModel.ts` unless a compile failure proves a narrow type-only correction is required;
- edit `PccProjectHeroBand.tsx` unless a test failure proves the current array-driven rendering is broken;
- edit `surfaceHeroCopy.ts`;
- edit `PccCommandSearch.tsx`;
- make command search interactive;
- implement Modules launcher behavior;
- implement command routing;
- add active module state;
- introduce live fetches, tenant reads, Graph/PnP/Procore calls, or external sync;
- edit `PccBentoGrid`, `PccDashboardCard`, `footprints`, or layout primitives;
- edit `package.json`, `apps/project-control-center/package.json`, `pnpm-lock.yaml`, SPFx manifests, or `apps/project-control-center/config/package-solution.json`.

---

## Authority / Boundary Language Rules

Boundary language must remain explicit.

Allowed examples:

```text
No checklist completion or evidence execution from this header.
Launch links open the source system in a new tab.
No sync or external writeback.
No approval authority.
No setting changes from this header.
```

Forbidden examples:

```text
Complete checklist
Execute evidence workflow
Approve / reject
Sync external systems
Repair now
Acknowledge repair
Upload files
Delete files
Change settings
Write back to source systems
HBI will decide
```

Treat negated boundary language as valid. Prohibit only affirmative language that implies live action, mutation, approval, decision authority, repair execution, file operation, settings mutation, or autonomous HBI decision-making.

---

## Validation Required

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

If formatting fails, make a surgical formatting correction only for changed files, then re-run:

```bash
pnpm exec prettier --check <changed-files>
pnpm --filter @hbc/spfx-project-control-center test
git diff --check
```

Do not run broad `prettier --write` over the repo.

---

## Required Completion Response

```markdown
## Prompt 02 Complete

## Files Changed
- ...

## Metadata Model Changes
- Confirm no schema change.
- Confirm only `surfaceCues` entries were added.

## Implemented Surface Metadata Matrix
| Surface | Summary Items | Cues | Read-Only Cue | Prompt 02 Action |
|---|---|---|---|---|
| project-home | unchanged | unchanged | unchanged | unchanged |
| team-and-access | unchanged | unchanged | unchanged | unchanged |
| documents | unchanged | unchanged | unchanged | unchanged |
| project-readiness | unchanged | added `no-execution` | unchanged | additive cue |
| approvals | unchanged | unchanged | unchanged | unchanged |
| external-systems | unchanged | added `launch-context` | unchanged | additive cue |
| control-center-settings | unchanged | unchanged | unchanged | unchanged |
| site-health | unchanged | unchanged | unchanged | unchanged |

## Static vs Fixture-Derived Values
- Confirm both new cues are static deterministic copy.
- Confirm no live counts, tenant reads, fixture derivation, or external calls were introduced.

## Authority / Read-Only Boundary Audit
- Confirm no affirmative writeback, approval execution, repair execution, file operation, setting mutation, command routing, or autonomous HBI decision language was introduced.
- Confirm negated boundary language remains valid and intentional.

## Tests Added or Updated
- ...

## Validation Results
- `git status --short` before:
- `md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml` before:
- `check-types`:
- `test`:
- `prettier --check <changed-files>`:
- `git diff --check`:
- lockfile hash after:
- `git status --short` after:

## Package / Lockfile / Manifest Audit
- Confirm unchanged:
  - `package.json`
  - `apps/project-control-center/package.json`
  - `pnpm-lock.yaml`
  - `apps/project-control-center/config/package-solution.json`
  - SPFx manifests

## Follow-Up Notes for Prompt 03
- Confirm duplicate/header cards remain in place.
- Confirm Project Home facts/counts remain Phase 04 retained.
- Confirm Site Health operational metrics remain Phase 04 deferred.
- Confirm Prompt 03 may render richer header content only through existing metadata fields unless separately authorized.
```
