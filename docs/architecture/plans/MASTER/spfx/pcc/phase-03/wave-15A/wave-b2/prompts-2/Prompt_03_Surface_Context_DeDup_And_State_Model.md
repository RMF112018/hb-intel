---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# Prompt 03 — Surface Context De-Duplication and State Model

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

Remove or compress duplicate surface context headers from happy-path first views and ensure every active surface has an intentional first-view state.

## Allowed Files to Edit

```text
apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.tsx
apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.module.css
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/surfaces/
apps/project-control-center/src/tests/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/host-shell-add-on/closeout/
```

## Scope Limits

Do not redesign full downstream surfaces. Touch surface files only where required to:

- remove duplicate context headers;
- add intentional unavailable/empty/loading state;
- preserve first-view content;
- keep tests passing.

## Implementation Requirements

1. Remove `PccSurfaceContextHeader` from happy-path first views where it only repeats shell context.
2. Retain compact local status only when it provides work value.
3. Add intentional state cards where a surface would otherwise appear blank.
4. Do not repeat project identity, source confidence, or last updated as dominant content.
5. Preserve all surface route IDs and bento card direct-child behavior.

## Tests Required

- No blank first-view surface for Team & Access.
- Happy-path surfaces do not render duplicate shell context.
- Unavailable state card renders when applicable.
- All eight routes still render.

## Validation

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccSurfaceContextHeader PccSurfaceRouter PccShell
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml
```

## Stop Conditions

Stop if surface cleanup would require broad redesign of downstream cards. Document deferment instead.
