---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# Prompt 06 — Host Fit, Responsive Evidence, and Closeout

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

Complete documentation, validation, and evidence requirements for the host shell add-on package. Do not claim 56/56 unless hosted evidence supports it.

## Allowed Files to Edit

```text
apps/project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/host-shell-add-on/
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/host-shell-add-on/
```

## Implementation Requirements

1. Create a hosted evidence index template if screenshots are not yet captured.
2. Document required screenshots across:
   - edit mode;
   - view mode;
   - 8 responsive modes;
   - 125% zoom;
   - short-height;
   - focus-visible state;
   - unavailable state;
   - External Platforms route.
3. Update PCC README to reflect:
   - thin shell;
   - non-sticky hero/tab rail;
   - text-only tabs;
   - disabled command preview;
   - active panel a11y;
   - 8-mode breakpoint policy;
   - no final 56/56 claim.
4. Create final closeout with:
   - files changed;
   - validation commands;
   - hard-stop checklist;
   - residual limitations;
   - score estimate.
5. Preserve package/manifest unless explicitly approved.

## Validation

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml
```

## Closeout Warning

Do not write “56/56 achieved” unless:

- hosted evidence matrix is complete;
- no hard-stop failures remain;
- scorecard supports it;
- user approves the claim.
