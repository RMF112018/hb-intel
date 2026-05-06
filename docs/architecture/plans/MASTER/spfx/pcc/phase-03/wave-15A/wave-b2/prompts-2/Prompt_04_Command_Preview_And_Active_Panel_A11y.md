---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# Prompt 04 — Command Preview and Active Panel Accessibility

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

Replace the misleading command search input with a disabled preview affordance and complete the tab-to-panel accessibility contract.

## Allowed Files to Edit

```text
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/PccCommandSearch.module.css
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/tests/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/host-shell-add-on/closeout/
```

## Implementation Requirements

1. `PccCommandSearch` must no longer render an `<input type="search">`.
2. Render a non-interactive preview capsule or status treatment.
3. Copy:
   - `Command Search — Preview`
   - helper: `Search and project commands are unavailable in this preview.`
4. The preview affordance should not be keyboard focusable if it performs no action.
5. `PccShell` must provide a stable active panel id to `PccHorizontalTabs`.
6. `main[data-pcc-canvas]` must include:
   - `id="pcc-active-surface-panel"`;
   - `role="tabpanel"`;
   - `aria-labelledby` pointing to the active tab.
7. Tabs must include `aria-controls="pcc-active-surface-panel"`.
8. Respect reduced-motion for any tab/canvas motion added in the hero/tab package.

## Tests Required

- No search input rendered.
- Command preview text renders.
- Preview affordance is non-interactive.
- Tabs have `aria-controls`.
- Active panel has `role="tabpanel"`.
- Active panel has `aria-labelledby`.
- Keyboard navigation still works.

## Validation

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccCommandSearch PccHorizontalTabs PccShell
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml
```
