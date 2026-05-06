---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# Prompt 01 — Add-On Scope Lock and Shell Ownership

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


## Role

You are the PCC host shell add-on remediation implementation agent.

## Objective

Lock the add-on scope and implement/document the shell ownership boundary so later prompts do not reintroduce context duplication or broaden into unrelated surface redesign.

## Required Reads

Use active context first. Read only:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/host-shell-add-on/docs/01_Shell_Ownership_And_Surface_Boundary_Contract.md
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.tsx
apps/project-control-center/src/tests/
```

## Implementation Requirements

1. Confirm shell-owned responsibilities in code comments, tests, or documentation as appropriate.
2. Identify current `PccSurfaceContextHeader` usages through targeted search only.
3. Do not remove all context headers in this prompt unless the change is trivial and test-safe.
4. Create/update a closeout doc that lists which surfaces repeat shell context and which should be cleaned in Prompt 03.
5. Preserve all routing and bento invariants.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccSurfaceContextHeader PccShell
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml
```

## Closeout Requirements

Document:

- shell-owned responsibilities;
- surface-owned responsibilities;
- current context duplication map;
- files changed;
- validation results;
- next prompt handoff.
