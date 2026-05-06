# Prompt 03 — Tab Rail No-Icons, Labels, and Motion


## Shared Context-Efficiency Rules

- Use active context first.
- Do not re-read files that are still within your current context or memory and have not changed.
- Read only the files required for this prompt, the immediately prior closeout, and files needed to verify current repo truth.
- Do not run broad repo audits unless this prompt explicitly requires one.
- Do not inspect unrelated packages unless a validation failure points there.
- If scope expansion is required, stop and explain why before editing additional files.

## Global Guardrails

- No live tenant writes.
- No Graph / PnP / SharePoint REST runtime work.
- No Procore / Document Crunch / Adobe Sign runtime work.
- No backend route changes.
- No approval/workflow execution.
- No dependency install/update.
- No package/manifest/SPPKG changes.
- No `pnpm-lock.yaml` drift.
- No final 56/56 claim unless evidence independently proves it.
- Do not push unless explicitly instructed.


## Role

You are the PCC tab rail remediation implementation agent.

## Objective

Remediate the horizontal tab rail into a premium text-only navigation band. Remove icons, improve selected-state contrast, add restrained motion, and rename `Apps` to `External Platforms` in user-facing navigation.

## Product Contract

Canonical labels:

```text
Project Home
Team
Documents
Project Readiness
Approvals
External Platforms
Settings
Site Health
```

Remove all tab icons for now.

## Required Implementation Direction

- Remove tab icon rendering and icon imports from `PccHorizontalTabs`.
- Replace `Apps` tab label with `External Platforms`.
- Preserve internal surface id `external-systems` unless a broader model migration is explicitly approved.
- Improve active selected state using branded UI-kit tokens.
- Add subtle active indicator motion.
- Improve inactive/hover/focus/pressed states.
- Preserve roving tab index and keyboard behavior.
- Add reduced-motion handling.

## Likely Files

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
packages/models/src/pcc/PccMvpSurfaces.ts
```

Only update `PccMvpSurfaces.ts` if needed for user-facing display labels; do not rename ids.

## Required Tests

Add/update tests asserting:

- all 8 labels render in order;
- tab rail includes `External Platforms`;
- tab rail does not include `Apps`;
- no icon wrapper renders inside tabs;
- active indicator marker exists;
- active indicator state follows active tab;
- keyboard navigation remains intact;
- compact density behavior remains intact;
- focus-visible class/marker is structurally present if testable.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center test -- PccHorizontalTabs
pnpm --filter @hbc/spfx-project-control-center check-types
md5 pnpm-lock.yaml
```

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/Prompt_03_Tab_Rail_Closeout.md
```

## Commit

Commit message:

```text
feat(pcc): Wave 15A shell flagship Prompt 03 tab rail refinement
```
