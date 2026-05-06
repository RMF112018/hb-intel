# Prompt 05 — Responsive Host Fit and Breakpoint Evidence


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

You are the PCC responsive host-fit remediation agent.

## Objective

Validate and tune the remediated hero and tab rail across the existing 8-mode PCC breakpoint policy. Ensure the shell remains host-safe, compact, scroll-safe, and visually separated from the tab rail and canvas.

## Required Implementation Direction

- Preserve existing 8-mode breakpoint policy.
- Tune hero density by mode.
- Ensure facts wrap/collapse according to the content priority table.
- Ensure tab rail remains text-visible and horizontally scroll-safe on compact widths.
- Ensure no double-scroll or `100vh` shell dependency is introduced.
- Ensure the hero does not push all content below the fold in constrained height.

## Likely Files

```text
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
```

## Required Tests

Add/update tests asserting:

- all 8 modes still render hero, tabs, and bento grid;
- hero density markers behave by mode;
- tab rail labels remain rendered at phone mode;
- command affordance compacts or hides as designed;
- project identity remains visible at phone mode;
- no old `Apps` label or tab icons reappear.

## Hosted Evidence Instructions

If hosted screenshots are available, capture/save evidence under the relevant Wave 15A evidence folder. Include:

- desktop edit mode;
- desktop view mode if available;
- tablet landscape or equivalent constrained browser width;
- tablet portrait or equivalent constrained browser width;
- phone/narrow width;
- active tab focus-visible state;
- before/after comparison against old flat hero/tab rail.

Do not invent evidence. If screenshots are operator-pending, record that explicitly.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center check-types
md5 pnpm-lock.yaml
```

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/Prompt_05_Responsive_Host_Fit_Closeout.md
```

## Commit

Commit message:

```text
feat(pcc): Wave 15A shell flagship Prompt 05 responsive host fit
```
