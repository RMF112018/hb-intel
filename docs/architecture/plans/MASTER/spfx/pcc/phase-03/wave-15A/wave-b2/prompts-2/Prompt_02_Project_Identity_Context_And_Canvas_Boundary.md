---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# Prompt 02 — Project Identity, Mandatory Facts, and Canvas Boundary

# Shared Instructions for All Add-On Prompts

## Context-Efficiency Rules

- Do not re-read files that are still within your current context or memory unless they changed, you need exact adjacent lines, or a validation failure requires verification.
- Use active context first.
- Read only files you will edit, tests you will update, immediately prior closeout docs, or exact type definitions needed to compile.
- Do not run broad repo audits after Prompt 01.
- If you need files outside the allowed list, stop and explain why before expanding scope.

## Global Guardrails

- No backend/API runtime changes.
- No Graph/PnP/SharePoint REST runtime changes.
- No Procore live integration.
- No dependency install/update.
- No `pnpm-lock.yaml` drift.
- No SPFx package/manifest bump unless explicitly approved.
- No final 56/56 claim.
- No fake SharePoint chrome.
- No sticky/fixed hero or tab rail in this phase.
- No tab icons.
- No URL/hash routing in this phase.
- No `Systems` user-facing label.
- No `Apps` tab label after remediation.
- No `git push` unless the user explicitly instructs it.


## Objective

Align the shell to the fixture-selected project profile, remove generic placeholder identity, and create a stronger host-safe canvas boundary beyond the hero/tab visual remediation.

## Allowed Files to Edit

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/preview/projectPlaceholder.ts
apps/project-control-center/src/tests/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/host-shell-add-on/closeout/
```

## Implementation Requirements

1. Use the fixture-selected project profile as the authoritative preview identity source.
2. Do not use generic `PCC_PROJECT_PLACEHOLDER` values as final visible identity if a profile fixture is available.
3. Hero must include:
   - location;
   - estimated value;
   - scheduled completion;
   - project stage.
4. Hero must exclude:
   - project number;
   - client;
   - project status;
   - source confidence;
   - last updated.
5. Strengthen the canvas boundary below the tab rail using existing UI-kit tokens only.
6. Do not introduce sticky/fixed shell behavior.
7. Preserve `PccBentoGrid` direct-child invariants.

## Tests Required

Add/update tests asserting:

- mandatory hero facts appear;
- excluded hero facts do not appear;
- generic placeholder values do not render if selected fixture profile exists;
- canvas marker remains present;
- shell does not render project number;
- all eight surfaces still route.

## Validation

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccApp PccShell PccProjectHeroBand
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml
```

## Stop Conditions

Stop if identity alignment requires backend/API/live SharePoint metadata or model migration beyond fixture/read-model seams.
