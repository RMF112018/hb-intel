# Prompt 03 — Project Hero Band


# Shared Instructions for This Prompt

## Context-Efficiency Rules

- Use active context first.
- Do not re-read files that are already in your current context and have not changed.
- Read only files you will edit, tests you will update, the immediately prior closeout, or exact type definitions needed to compile.
- Do not run broad repo audits.
- Do not search unrelated packages or archived plans.
- Do not inspect backend/API/surface/shared-package files unless a validation failure points there or this prompt explicitly allows it.
- If you need files outside the allowed list, stop and explain why before expanding scope.

## Global Guardrails

- No backend/API runtime changes.
- No Graph/PnP/SharePoint REST.
- No Procore live integration.
- No dependency install/update.
- No `pnpm-lock.yaml` drift.
- No package/manifest bump unless packaging files are changed and user approval is obtained.
- No final 56/56 claim.
- No `git push` unless the user explicitly instructs it.


## Role

You are the PCC Project Hero Band implementation agent.

## Objective

Create `PccProjectHeroBand` as the replacement target for `PccProjectIntelligenceHeader`.

Do not mount it in `PccShell` yet unless the prompt is explicitly extended later. Do not delete the old header in this prompt.

## Implementation Requirements

1. Create `PccProjectHeroBand`.
2. Include fixed content order:
   - eyebrow: `Project Control Center`,
   - project name,
   - status pills,
   - metadata row: Client | Location | Estimated Value,
   - active surface label/workflow,
   - command search,
   - source confidence.

3. Expand `PCC_PROJECT_PLACEHOLDER` with:
   - `clientName`,
   - `location`,
   - `estimatedValue`,
   - `sourceConfidence`.

4. Use product-safe source confidence labels:
   - `Reference data`
   - `Live project data`

5. Avoid:
   - `Preview mode`
   - `Mock`
   - `Fixture`
   - `Wave`
   - `Prompt`

6. Responsive target:
   - `ultrawide`: 72–85px target height; project name, active surface, full metadata row, status/source-confidence indicators, and expanded metadata/search area all visible.
   - `desktop`: 72–85px target height; project name, active surface, metadata row, status/source-confidence indicators, and expanded metadata/search area visible.
   - `largeLaptop`: 72–85px target height; project name, active surface, metadata row, and expanded metadata/search area visible with slightly tighter spacing.
   - `standardLaptop`: 72–85px target height; project name, active surface, metadata row, and metadata/search area remain visible; use compact spacing only, not content removal.
   - `smallLaptop`: compact density; project name, active surface, metadata row, and metadata/search area remain visible with reduced gaps, shorter labels if needed, and controlled truncation.
   - `tabletLandscape`: compact two-row layout allowed; project name, active surface, metadata row, and metadata/search area remain visible.
   - `tabletPortrait`: stacked/compact layout allowed; project name, active surface, metadata row, and metadata/search area remain visible, with wrapping or reduced-width search if needed.
   - `phone`: project name and active surface remain visible. Metadata/search collapses behind a toggle labeled `Project Intel`; when toggled, the metadata/search content displays below the project name. Do not remove the metadata/search affordance entirely.

7. Required markers:
   - `data-pcc-project-hero-band=""`
   - `data-pcc-project-identity=""`
   - `data-pcc-project-metadata=""`
   - `data-pcc-source-confidence="<reference|live>"`
   - `data-pcc-active-surface-context=""`

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccProjectHeroBand
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed-files>
md5 pnpm-lock.yaml
```

## Stop Conditions

Stop if:

- hero band requires live read model data,
- placeholder changes require shared `@hbc/models`,
- command search behavior must change,
- lockfile changes.

## Closeout

Create the closeout path above. Include:

- placeholder contract changes,
- product-safe language confirmation,
- responsive-mode test coverage,
- context-efficiency section,
- next prompt: shell recomposition and rail removal.
