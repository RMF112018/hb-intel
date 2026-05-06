# Prompt 02 — Hero Project Context and Visual Hierarchy


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

You are the PCC hero remediation implementation agent.

## Objective

Rebuild `PccProjectHeroBand` into a premium, branded, visually hierarchical hero using the locked content contract. Align shell project identity with `SAMPLE_PROJECT_PROFILE` / `IProjectProfile` and remove the flat reference-placeholder strip.

## Product Contract

Hero must include:

- `Project Control Center` as primary title;
- active surface name as secondary title;
- active surface shell-safe description;
- location;
- estimated value;
- scheduled completion;
- project stage;
- disabled command preview affordance or reserved slot if Prompt 04 will complete command styling.

Hero must not include:

- project number;
- client;
- project status;
- source confidence;
- last updated;
- `Reference Client`;
- `Reference Location`;
- `$0`.

## Required Implementation Direction

- Replace shell dependence on `PCC_PROJECT_PLACEHOLDER` with a profile-derived shell view model.
- Use `SAMPLE_PROJECT_PROFILE` as the default preview profile source.
- Preserve future compatibility for read-model profile data if currently practical without broad rewiring.
- Add a compact surface-description map if `PCC_MVP_SURFACES.description` is too long for hero use.
- Use branded UI-kit tokens already available in the repo.
- Add visual separation between hero and tab rail.
- Do not introduce live data calls.

## Likely Files

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/preview/projectPlaceholder.ts
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

## Required Tests

Add/update tests asserting:

- hero primary title is `Project Control Center`;
- active surface name renders;
- long surface descriptions are not blindly injected into the hero;
- project number is not rendered;
- client is not rendered;
- source confidence is not rendered;
- last updated is not rendered;
- project status is not rendered;
- location, estimated value, scheduled completion, and project stage render;
- `Reference Client`, `Reference Location`, and `$0` are absent in default preview shell;
- responsive mode markers still exist.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center test -- PccProjectHeroBand PccShell
pnpm --filter @hbc/spfx-project-control-center check-types
md5 pnpm-lock.yaml
```

If filtered tests are unsupported, run:

```bash
pnpm --filter @hbc/spfx-project-control-center test
```

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/Prompt_02_Hero_Closeout.md
```

Include files changed, behavior changed, tests run, lockfile status, residual risks, and screenshots needed.

## Commit

Commit message:

```text
feat(pcc): Wave 15A shell flagship Prompt 02 hero hierarchy
```
