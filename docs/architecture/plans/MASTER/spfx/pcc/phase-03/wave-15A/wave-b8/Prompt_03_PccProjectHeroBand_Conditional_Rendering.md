# Prompt 03 — PccProjectHeroBand Conditional Rendering

## Mandatory Efficiency Directive

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Shared Guardrails

- Work from current repo truth.
- Preserve SharePoint host-fit.
- Preserve read-only / preview / no-writeback posture.
- Preserve the distinction between PCC surfaces and work centers/modules.
- Preserve bento direct-child invariants.
- Preserve tab / tabpanel accessibility.
- Do not implement full Modules launcher behavior.
- Do not implement command routing.
- Do not introduce active module state.
- Do not remove duplicate/header cards in Phase 03.
- Do not change `pnpm-lock.yaml`, package dependencies, or SPFx package-solution files unless a prompt explicitly proves it is unavoidable and the user approves.
- Use `apps/project-control-center/config/package-solution.json` for package-solution references.

---

## Role

You are implementing the Phase 03 conditional rendering layer in the shell command header.

## Objective

Render the completed surface metadata in `PccProjectHeroBand` as meaningful, compact, surface-specific command-header content.

The header should visibly and semantically change by active surface.

## Preconditions

Do not proceed unless Prompt 02 completed:

- deterministic metadata for all eight surfaces;
- tests proving metadata exhaustiveness;
- no duplicate-card removal;
- no package/lockfile/manifest drift.

## Likely Files to Edit

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
```

## Required Rendering Behavior

The command header must render:

- `primaryTitle`;
- active surface secondary title;
- compact surface description;
- project facts;
- surface summary item zone;
- surface cue zone;
- read-only/no-writeback cue;
- command-search preview;
- Project Home command-summary or future trend seam where metadata supports it.

## Surface Change Requirements

Tests and implementation must prove that changing active tab changes the header summary/cue content for:

```text
project-home -> documents
documents -> approvals
approvals -> external-systems
external-systems -> site-health
```

It is acceptable to test all eight surfaces if straightforward.

## Project Home Specific Requirement

Project Home should begin absorbing safe content from `PccProjectIntelligenceCard` / `projectCommandSummary` into the header. The runtime card remains in place.

Allowed content extraction:

- high-priority action count if deterministic;
- pending approvals if deterministic;
- blocking setup gaps if deterministic;
- source preview label;
- HBI advisory cue;
- compact future health trend seam.

Not allowed:

- removing `PccProjectIntelligenceCard`;
- moving bento composition;
- adding active module routing;
- adding real command execution.

## Command Search Requirement

If `PccCommandSearch` remains preview-only:

- no `input`;
- no `button`;
- no `a`;
- no `role="button"`;
- no `tabindex="0"`;
- visible copy must communicate preview/unavailable posture.

## Accessibility Requirements

- `PccProjectHeroBand` remains a region with an appropriate accessible label.
- Summary/cue zones use readable text and stable markers.
- Status is not color-only.
- Read-only/no-writeback text remains visible.
- No fake enabled controls.

## Responsive Requirements

- Summary/cue zones wrap without horizontal overflow.
- Compact modes remain readable.
- Header height remains controlled.
- Project facts and command slot do not collapse layout.

## Prohibited

- Do not remove duplicate/header cards.
- Do not implement module launcher.
- Do not implement command routing.
- Do not introduce active module state.
- Do not alter bento composition.
- Do not change package/lockfile/manifest files.

## Tests Required

Add/update tests proving:

- header summary item IDs change by active surface;
- header cue IDs change by active surface;
- Project Home renders command-summary/HBI/source posture;
- Approvals header includes no-approval/no-writeback posture;
- External Systems header includes launch-only/no-sync/no-writeback posture;
- Site Health header includes repair/no-acknowledgement posture;
- summary/cue zones have no interactive descendants unless intentionally introduced and fully justified;
- command-search preview remains truthful.

## Required Validation

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Required Completion Response

```markdown
## Prompt 03 Complete

## Files Changed

## Conditional Header Rendering Summary

## Surface-by-Surface Header Behavior

## Project Home Content Extraction Audit

## Command Search / False Affordance Audit

## Accessibility and Responsive Audit

## Tests Added or Updated

## Validation Results

## Package / Lockfile / Manifest Audit

## Follow-Up Notes for Prompt 04
```
