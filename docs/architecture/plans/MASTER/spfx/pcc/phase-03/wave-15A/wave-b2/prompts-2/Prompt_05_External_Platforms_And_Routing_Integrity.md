---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# Prompt 05 — External Platforms and Routing Integrity

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

Apply the approved External Platforms taxonomy and harden active surface label consistency without changing the underlying `external-systems` surface id.

## Allowed Files to Edit

```text
packages/models/src/pcc/PccMvpSurfaces.ts
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/surfaces/
apps/project-control-center/src/tests/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/host-shell-add-on/closeout/
```

## Implementation Requirements

1. User-facing tab label must be `External Platforms`.
2. Surface page title must be `External Platforms Launch Pad`.
3. Supporting copy must clarify platforms are hosted outside the SharePoint project site.
4. Remove user-facing `Apps` label in tab rail.
5. Do not use `Systems` as user-facing tab/product label.
6. Do not rename TypeScript surface id `external-systems` in this phase.
7. All eight surfaces remain visible and routeable.
8. Invalid active surface, if encountered, falls back to Project Home.
9. Do not add URL/hash routing in this phase.

## Tests Required

- `external-systems` tab renders `External Platforms`.
- No `Apps` tab label.
- No user-facing `Systems` tab label.
- Surface title renders `External Platforms Launch Pad`.
- All route IDs still render.
- Active tab/hero/panel labels agree.

## Validation

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccHorizontalTabs PccSurfaceRouter PccApp
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml
```

## Stop Conditions

Stop if label cleanup would require broader model migration beyond user-facing copy.
