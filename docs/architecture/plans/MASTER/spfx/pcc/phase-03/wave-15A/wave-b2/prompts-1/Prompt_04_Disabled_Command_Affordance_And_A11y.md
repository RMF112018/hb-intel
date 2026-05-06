# Prompt 04 — Disabled Command Affordance and Accessibility


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

You are the PCC shell accessibility and command-affordance remediation agent.

## Objective

Replace the misleading read-only command search input with a clearly disabled preview affordance and complete tab-to-panel accessibility wiring without breaking bento layout invariants.

## Product Contract

Command search remains disabled preview.

Preferred label:

```text
Command Search — Preview
```

Helper copy:

```text
Project search and command actions are planned for a later phase.
```

Do not render an editable input or active search field.

## Required Implementation Direction

- Replace `readOnly` input-style search with a disabled preview chip/button/affordance.
- Choose either a non-focusable disabled button with visible helper text or a focusable `aria-disabled="true"` button with accessible helper/tooltip.
- Do not allow typing or execution.
- Wire `panelId` from `PccShell` to `PccHorizontalTabs`.
- Add active panel semantics without breaking bento direct-child cards.
- Preserve exactly one active surface panel marker.

## Likely Files

```text
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

## Required Tests

Add/update tests asserting:

- no `input[type="search"]` renders in the shell hero;
- disabled command affordance label renders;
- helper copy renders or is accessible;
- clicking/keyboard activation does not execute anything;
- every tab has `aria-controls`;
- active panel has `role="tabpanel"` or documented grid-safe equivalent;
- active panel has `aria-labelledby` if feasible;
- bento direct-child invariant remains intact;
- exactly one active surface panel marker remains.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center test -- PccProjectHeroBand PccHorizontalTabs PccShell
pnpm --filter @hbc/spfx-project-control-center check-types
md5 pnpm-lock.yaml
```

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/Prompt_04_Command_A11y_Closeout.md
```

## Commit

Commit message:

```text
feat(pcc): Wave 15A shell flagship Prompt 04 command affordance and a11y
```
